# apply-patch.ps1 - applies the newest *.patch file from Claude, commits and pushes it.
# It works from ANY folder, so you never need to "cd" into the right folder again.
#
# Usage (PowerShell, from anywhere):
#   powershell -ExecutionPolicy Bypass -File "$HOME\Downloads\apply-patch.ps1" "Short description"
# The description is optional.

param([string]$Message = "Apply update from Claude")

$ErrorActionPreference = "Stop"

# The folder that contains the hidden .git folder (the INNER english-honours-platform folder).
$repo = Join-Path $HOME "Downloads\english-honours-platform\english-honours-platform"
if (-not (Test-Path (Join-Path $repo ".git"))) {
    Write-Host "Cannot find the project at: $repo" -ForegroundColor Red
    Write-Host "Open this script in Notepad and change the `$repo line to your project folder (the one that contains .git)."
    exit 1
}

# Look for the newest .patch file in Downloads and in the project folders.
$places = @((Join-Path $HOME "Downloads"), (Split-Path $repo -Parent), $repo)
$patch = $places |
    Where-Object { Test-Path $_ } |
    ForEach-Object { Get-ChildItem -Path $_ -Filter "*.patch" -File -ErrorAction SilentlyContinue } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if (-not $patch) {
    Write-Host "No .patch file found. Download the patch from the chat first (it goes to your Downloads folder)." -ForegroundColor Red
    exit 1
}

Write-Host "Using patch: $($patch.FullName)"

# Work from a private copy, then clear every stray copy of a patch out of the project folder
# (a patch file left inside the project would count as an "uncommitted change").
$work = Join-Path $env:TEMP "claude-update.patch"
Copy-Item $patch.FullName $work -Force
Get-ChildItem -Path $repo -Filter "*.patch" -File -ErrorAction SilentlyContinue | Remove-Item -Force
Set-Location $repo

# Safety: only continue if there is nothing else waiting to be committed.
$pending = git status --porcelain
if ($pending) {
    Write-Host "There are uncommitted changes in the project. Nothing was changed." -ForegroundColor Red
    git status --short
    exit 1
}

git apply --check "$work"
if ($LASTEXITCODE -ne 0) {
    Write-Host "This patch does not fit your current files. Nothing was changed. Send the message above to Claude." -ForegroundColor Red
    exit 1
}

git apply "$work"
if ($LASTEXITCODE -ne 0) { Write-Host "Applying failed." -ForegroundColor Red; exit 1 }

Remove-Item $work -Force
if (Test-Path $patch.FullName) { Remove-Item $patch.FullName -Force }
git add -A
git commit -m $Message
git push

Write-Host ""
Write-Host "Done. The update is on GitHub." -ForegroundColor Green
