Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Invoke-Git {
  param([string[]]$GitArgs)

  & git @GitArgs
  if ($LASTEXITCODE -ne 0) {
    throw "git command failed: git $($GitArgs -join ' ')"
  }
}

function Get-GitOutput {
  param([string[]]$GitArgs)

  $output = & git @GitArgs
  if ($LASTEXITCODE -ne 0) {
    throw "git command failed: git $($GitArgs -join ' ')"
  }

  return ($output | Out-String).Trim()
}

function Get-GitLines {
  param([string[]]$GitArgs)

  $output = & git @GitArgs
  if ($LASTEXITCODE -ne 0) {
    throw "git command failed: git $($GitArgs -join ' ')"
  }

  if ($null -eq $output) {
    return @()
  }

  return @($output)
}

function Assert-InsideGitRepo {
  $inside = Get-GitOutput -GitArgs @("rev-parse", "--is-inside-work-tree")
  if ($inside -ne "true") {
    throw "Current directory is not inside a Git repository."
  }
}

function Enter-RepoRoot {
  Assert-InsideGitRepo
  $repoRoot = Get-GitOutput -GitArgs @("rev-parse", "--show-toplevel")
  Set-Location $repoRoot
  return $repoRoot
}

function Get-SafeSlug {
  param([string]$Label)

  $raw = if ([string]::IsNullOrWhiteSpace($Label)) { "manual" } else { $Label.ToLowerInvariant() }
  $chars = $raw.ToCharArray() | ForEach-Object {
    if (($_ -ge 'a' -and $_ -le 'z') -or ($_ -ge '0' -and $_ -le '9')) {
      [string]$_
    } else {
      "-"
    }
  }

  $slug = (($chars -join "") -replace "-{2,}", "-").Trim("-")
  if ([string]::IsNullOrWhiteSpace($slug)) {
    return "manual"
  }

  return $slug
}

function Get-TimestampId {
  return (Get-Date -Format "yyyyMMdd-HHmmss")
}

function Get-WorkingTreeStatusLines {
  return Get-GitLines -GitArgs @("status", "--porcelain=v1", "-uall")
}

function Test-WorkingTreeDirty {
  $lines = Get-WorkingTreeStatusLines
  return ($lines.Count -gt 0 -and -not [string]::IsNullOrWhiteSpace(($lines | Out-String)))
}

function Test-GitRefExists {
  param([string]$Ref)

  & git rev-parse --verify --quiet $Ref 1>$null 2>$null
  return ($LASTEXITCODE -eq 0)
}

function Get-SnapshotBranchName {
  param(
    [string]$TimestampId,
    [string]$Slug
  )

  return "backup/snapshot-$TimestampId-$Slug"
}

function Get-SnapshotMessage {
  param(
    [string]$TimestampId,
    [string]$Slug
  )

  return "snapshot/$TimestampId/$Slug"
}

function Get-PreRestoreBranchName {
  param([string]$TimestampId)

  return "backup/pre-restore-$TimestampId"
}

function Get-PreRestoreMessage {
  param([string]$TimestampId)

  $offset = (Get-Date).ToString("zzz").Replace(":", "")
  return "pre-restore-$TimestampId$offset"
}
