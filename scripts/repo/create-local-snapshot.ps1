param(
  [string]$Label = "manual",
  [switch]$DryRun
)

. "$PSScriptRoot\git-local-common.ps1"

$repoRoot = Enter-RepoRoot
$timestampId = Get-TimestampId
$slug = Get-SafeSlug -Label $Label
$branchName = Get-SnapshotBranchName -TimestampId $timestampId -Slug $slug
$stashMessage = Get-SnapshotMessage -TimestampId $timestampId -Slug $slug
$headSha = Get-GitOutput -GitArgs @("rev-parse", "--short", "HEAD")
$isDirty = Test-WorkingTreeDirty

if (Test-GitRefExists -Ref $branchName) {
  throw "Snapshot branch already exists: $branchName"
}

Write-Host ""
Write-Host "=== Local Snapshot Plan ==="
Write-Host "Repo:         $repoRoot"
Write-Host "Current HEAD: $headSha"
Write-Host "Snapshot ID:  $timestampId"
Write-Host "Label:        $slug"
Write-Host "Backup branch:$branchName"
Write-Host "Worktree stash message: $stashMessage"
Write-Host "Dirty tree:   $isDirty"
Write-Host ""

if ($DryRun) {
  Write-Host "Dry-run mode. No files were changed."
  exit 0
}

Invoke-Git -GitArgs @("branch", $branchName, "HEAD")

$stashHash = ""
if ($isDirty) {
  Invoke-Git -GitArgs @("stash", "push", "-u", "-m", $stashMessage)
  $stashHash = Get-GitOutput -GitArgs @("rev-parse", "stash@{0}")
  Invoke-Git -GitArgs @("stash", "apply", "--index", $stashHash)
}

Write-Host "Local snapshot created."
Write-Host "Branch: $branchName"
if ($stashHash) {
  Write-Host "Stash:  $stashHash"
  Write-Host "Restore: npm run git:restore -- -BaseRef $branchName -StashRef $stashHash"
} else {
  Write-Host "Stash:  (not needed, working tree was clean)"
  Write-Host "Restore: git reset --hard $branchName"
}
