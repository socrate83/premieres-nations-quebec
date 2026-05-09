param(
  [string]$Owner = "socrate83",
  [string]$Repo = "premieres-nations-quebec"
)
$ErrorActionPreference = "Stop"
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "Installez GitHub CLI (winget install GitHub.cli), rouvrez le terminal, puis: gh auth login"
}
gh auth status 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
  Write-Error "Executez d'abord une fois: gh auth login"
}

$headers = @{ Accept = "application/vnd.github+json" }
$null = gh api "repos/$Owner/$Repo/pages" 2>&1
if ($LASTEXITCODE -ne 0) {
  gh api -X POST "repos/$Owner/$Repo/pages" `
    -f build_type=workflow `
    -f source[branch]=main `
    -f source[path]=/
  Write-Host "OK: Pages cree — source = GitHub Actions (workflow)."
} else {
  gh api -X PUT "repos/$Owner/$Repo/pages" -f build_type=workflow
  Write-Host "OK: Pages mis a jour — source = GitHub Actions (workflow)."
}
