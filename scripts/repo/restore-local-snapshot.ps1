param(
  [Parameter(Mandatory = $true)]
  [string]$StashRef,
  [string]$BaseRef,
  [switch]$DryRun
)

. "$PSScriptRoot\git-local-common.ps1"

$repoRoot = Enter-RepoRoot
$timestampId = Get-TimestampId
$safetyBranch = Get-PreRestoreBranchName -TimestampId $timestampId
$safetyMessage = Get-PreRestoreMessage -TimestampId $timestampId
$currentHead = Get-GitOutput -GitArgs @("rev-parse", "--short", "HEAD")
$isDirty = Test-WorkingTreeDirty

if (-not (Test-GitRefExists -Ref $StashRef)) {
  throw "Snapshot stash ref not found: $StashRef"
}

if ($BaseRef -and -not (Test-GitRefExists -Ref $BaseRef)) {
  throw "Base ref not found: $BaseRef"
}

if (Test-GitRefExists -Ref $safetyBranch) {
  throw "Safety branch already exists: $safetyBranch"
}

Write-Host ""
Write-Host "=== Local Restore Plan ==="
Write-Host "Repo:          $repoRoot"
Write-Host "Current HEAD:  $currentHead"
Write-Host "Safety branch: $safetyBranch"
Write-Host "Safety stash:  $safetyMessage"
Write-Host "Snapshot stash:$StashRef"
Write-Host "Base ref:      $(if ($BaseRef) { $BaseRef } else { '(keep current HEAD)' })"
Write-Host "Dirty tree:    $isDirty"
Write-Host ""

if ($DryRun) {
  Write-Host "Dry-run mode. No files were changed."
  exit 0
}

Invoke-Git -GitArgs @("branch", $safetyBranch, "HEAD")

$safetyStashHash = ""
if ($isDirty) {
  Invoke-Git -GitArgs @("stash", "push", "-u", "-m", $safetyMessage)
  $safetyStashHash = Get-GitOutput -GitArgs @("rev-parse", "stash@{0}")
}

if ($BaseRef) {
  Invoke-Git -GitArgs @("reset", "--hard", $BaseRef)
}

Invoke-Git -GitArgs @("stash", "apply", "--index", $StashRef)

Write-Host "Restore complete."
Write-Host "Safety branch: $safetyBranch"
if ($safetyStashHash) {
  Write-Host "Safety stash:  $safetyStashHash"
}
Write-Host "Active HEAD:   $(Get-GitOutput -GitArgs @('rev-parse', '--short', 'HEAD'))"
