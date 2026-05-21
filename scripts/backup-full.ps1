# Sauvegarde complète du site « Premières Nations du Québec »
# Usage: powershell -ExecutionPolicy Bypass -File scripts/backup-full.ps1
# Crée un dossier daté + archive ZIP + bundle Git (historique complet).

$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$parent = Split-Path -Parent $root
$stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss'
$destRoot = Join-Path $parent "sauvegardes_premieres_nations"
$dest = Join-Path $destRoot $stamp

New-Item -ItemType Directory -Path $dest -Force | Out-Null

Write-Host "Sauvegarde vers: $dest"

# 1) Copie des fichiers du projet (sans .git)
$exclude = @('.git', 'node_modules', '.cursor')
Get-ChildItem -Path $root -Force | Where-Object {
    $exclude -notcontains $_.Name
} | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination (Join-Path $dest $_.Name) -Recurse -Force
}

# 2) Bundle Git (tout l'historique, récupération possible avec: git clone repo.bundle)
Push-Location $root
try {
    $bundle = Join-Path $dest 'premieres-nations-quebec.bundle'
    git bundle create $bundle --all 2>&1 | Out-Host
    if ($LASTEXITCODE -ne 0) { throw "git bundle a échoué" }
}
finally {
    Pop-Location
}

# 3) Fiche récap
$commit = ''
$branch = ''
Push-Location $root
try {
    $commit = (git rev-parse HEAD 2>$null)
    $branch = (git branch --show-current 2>$null)
}
finally { Pop-Location }

$readme = @"
Sauvegarde — Premières Nations du Québec
========================================
Date      : $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
Dossier   : $stamp
Branche   : $branch
Commit    : $commit
Site live : https://socrate83.github.io/premieres-nations-quebec/

Contenu
-------
- Copie des fichiers du site (HTML, assets, scripts, podcasts, workflows)
- premieres-nations-quebec.bundle : dépôt Git complet

Restaurer les fichiers
----------------------
Copier le contenu de ce dossier vers un nouveau répertoire de travail.

Restaurer Git depuis le bundle
------------------------------
  git clone premieres-nations-quebec.bundle premieres-nations-quebec
  cd premieres-nations-quebec
  git remote add origin https://github.com/socrate83/premieres-nations-quebec.git

Archive ZIP
-----------
Voir: $stamp.zip dans le dossier parent sauvegardes_premieres_nations
"@

Set-Content -Path (Join-Path $dest 'LISEZMOI-SAUVEGARDE.txt') -Value $readme -Encoding UTF8

# 4) ZIP (API .NET, UTF-8 safe)
$zipPath = Join-Path $destRoot "$stamp.zip"
if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($dest, $zipPath)

Write-Host ""
Write-Host "OK - Sauvegarde terminee."
Write-Host "  Dossier : $dest"
Write-Host "  ZIP     : $zipPath"
$bundlePath = Join-Path $dest "premieres-nations-quebec.bundle"
Write-Host "  Bundle  : $bundlePath"
