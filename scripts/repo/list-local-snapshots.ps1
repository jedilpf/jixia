param(
  [int]$Limit = 20
)

. "$PSScriptRoot\git-local-common.ps1"

Enter-RepoRoot | Out-Null

$branchMap = @{}
$branchLines = Get-GitLines -GitArgs @(
  "for-each-ref",
  "--sort=-creatordate",
  "--format=%(refname:short)|%(objectname:short)|%(creatordate:iso8601)|%(subject)",
  "refs/heads/backup"
)

foreach ($line in $branchLines) {
  if ($line -match '^backup/snapshot-(\d{8}-\d{6})-(.+?)\|([^|]+)\|([^|]+)\|(.*)$') {
    $key = "$($Matches[1])/$($Matches[2])"
    $branchMap[$key] = [PSCustomObject]@{
      Branch    = "backup/snapshot-$($Matches[1])-$($Matches[2])"
      HeadSha   = $Matches[3]
      CreatedAt = $Matches[4]
      Subject   = $Matches[5]
    }
  }
}

$snapshotRows = @()
$safetyRows = @()
$stashLines = Get-GitLines -GitArgs @("log", "-g", "--format=%H|%cd|%gs", "--date=iso", "refs/stash")

foreach ($line in $stashLines) {
  if ($line -match '^([^|]+)\|([^|]+)\|On .+?: snapshot/(\d{8}-\d{6})/([^|]+)$') {
    $key = "$($Matches[3])/$($Matches[4])"
    $branchInfo = $branchMap[$key]
    $snapshotRows += [PSCustomObject]@{
      Id        = $Matches[3]
      Label     = $Matches[4]
      CreatedAt = $Matches[2]
      Branch    = if ($branchInfo) { $branchInfo.Branch } else { "(missing)" }
      StashRef  = $Matches[1]
      HeadSha   = if ($branchInfo) { $branchInfo.HeadSha } else { "" }
    }
    continue
  }

  if ($line -match '^([^|]+)\|([^|]+)\|On .+?: (pre-restore-.+)$') {
    $safetyRows += [PSCustomObject]@{
      CreatedAt = $Matches[2]
      StashRef  = $Matches[1]
      Label     = $Matches[3]
    }
  }
}

Write-Host ""
Write-Host "=== Local Snapshots ==="
if ($snapshotRows.Count -eq 0) {
  Write-Host "No local snapshot stash entries found yet."
} else {
  $snapshotRows |
    Select-Object -First $Limit |
    Format-Table -AutoSize Id, Label, CreatedAt, Branch, StashRef, HeadSha
}

Write-Host ""
Write-Host "=== Safety Restore Backups ==="
if ($safetyRows.Count -eq 0) {
  Write-Host "No pre-restore safety stashes found."
} else {
  $safetyRows |
    Select-Object -First $Limit |
    Format-Table -AutoSize CreatedAt, Label, StashRef
}

Write-Host ""
Write-Host "Usage:"
Write-Host "  npm run git:snapshot -- -Label story-fix"
Write-Host "  npm run git:restore -- -BaseRef backup/snapshot-YYYYMMDD-HHMMSS-label -StashRef <stash-hash>"
