param(
  [switch]$Execute,
  [int]$SizeLimitMB = 20,
  [string]$RemoteName = "origin",
  [string]$BackupRoot = "..\\repo-backups",
  [string[]]$DropPathGlobs = @(
    "*.zip",
    "*.exe",
    "*.mp4",
    "*.mov",
    "*.psd",
    "dist/**",
    "dist_electron/**"
  )
)

$ErrorActionPreference = "Stop"

function Invoke-Git {
  param([string[]]$GitArgs)
  Write-Host (">> git " + ($GitArgs -join " "))
  & git @GitArgs
  if ($LASTEXITCODE -ne 0) {
    throw "git command failed: git $($GitArgs -join ' ')"
  }
}

function Ensure-GitFilterRepo {
  & git filter-repo --version *> $null
  if ($LASTEXITCODE -ne 0) {
    throw @"
Missing git-filter-repo.
Install one of these first:
  1) python -m pip install git-filter-repo
  2) pipx install git-filter-repo
"@
  }
}

Invoke-Git -GitArgs @("rev-parse", "--is-inside-work-tree")
$repoRoot = (& git rev-parse --show-toplevel).Trim()
Set-Location $repoRoot

$statusOutput = & git status --porcelain
$workingTreeDirty = if ($null -eq $statusOutput) { "" } else { ($statusOutput | Out-String).Trim() }
if ($Execute -and $workingTreeDirty) {
  throw "Working tree is not clean. Commit or stash changes before running with -Execute."
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$repoName = Split-Path -Leaf $repoRoot
$backupRootAbs = Resolve-Path -LiteralPath (Join-Path $repoRoot $BackupRoot) -ErrorAction SilentlyContinue
if (-not $backupRootAbs) {
  $backupRootAbs = Join-Path $repoRoot $BackupRoot
  New-Item -ItemType Directory -Path $backupRootAbs -Force | Out-Null
  $backupRootAbs = (Resolve-Path -LiteralPath $backupRootAbs).Path
} else {
  $backupRootAbs = $backupRootAbs.Path
}
$backupMirror = Join-Path $backupRootAbs "$repoName-mirror-$timestamp.git"

Write-Host ""
Write-Host "=== History Cleanup Plan ==="
Write-Host "Repo:       $repoRoot"
Write-Host "Remote:     $RemoteName"
Write-Host "Size limit: ${SizeLimitMB}MB"
Write-Host "Drop globs: $($DropPathGlobs -join ', ')"
Write-Host "Backup:     $backupMirror"
Write-Host ""

if (-not $Execute) {
  Write-Host "Dry-run mode. No destructive changes were made."
  Write-Host "Run this when ready:"
  Write-Host "  powershell -ExecutionPolicy Bypass -File scripts/repo/filter-history-safe.ps1 -Execute -SizeLimitMB $SizeLimitMB"
  exit 0
}

Ensure-GitFilterRepo

Write-Host "Step 1/3: Creating mirror backup..."
& git clone --mirror "$repoRoot" "$backupMirror"
if ($LASTEXITCODE -ne 0) {
  throw "Failed to create mirror backup."
}

Write-Host "Step 2/3: Rewriting history with git-filter-repo..."
$filterArgs = @(
  "filter-repo",
  "--force",
  "--strip-blobs-bigger-than", "${SizeLimitMB}M"
)
foreach ($glob in $DropPathGlobs) {
  $filterArgs += "--path-glob"
  $filterArgs += $glob
}
$filterArgs += "--invert-paths"
Invoke-Git -GitArgs $filterArgs

$remoteUrl = (& git remote get-url $RemoteName).Trim()
if (-not $remoteUrl) {
  throw "Cannot find remote '$RemoteName'."
}

Write-Host "Step 3/3: Local rewrite complete."
Write-Host ""
Write-Host "Next (manual) push commands:"
Write-Host "  git push $RemoteName --force --all"
Write-Host "  git push $RemoteName --force --tags"
Write-Host ""
Write-Host "Rollback (if needed):"
Write-Host "  cd `"$backupMirror`""
Write-Host "  git push --mirror $remoteUrl"
Write-Host ""
Write-Host "IMPORTANT: Team members must re-clone or hard reset after history rewrite."
