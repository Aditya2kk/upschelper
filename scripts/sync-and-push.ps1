# ==========================================================
# UPSC NewsHub AI — Local Auto-Sync and GitHub Cloud Push
# ==========================================================

$ErrorActionPreference = "Continue"

$repoRoot = "D:\portfolio\UPSC"
Set-Location $repoRoot

# 1. Ensure Node.js is in PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

Write-Host "`n📰 [1/2] Fetching newest daily newspapers from Telegram..." -ForegroundColor Cyan

# 2. Run Telegram fetcher
Set-Location "$repoRoot\telegram-service"
node fetch-newspapers.mjs

# 3. Check for updates and push to GitHub so Vercel updates live website
Set-Location $repoRoot
Write-Host "`n🚀 [2/2] Checking for updates to publish to live website..." -ForegroundColor Cyan

git add frontend/public/newspapers/manifest.json

$gitStatus = git status --porcelain frontend/public/newspapers/manifest.json
if ($gitStatus) {
    $todayDate = Get-Date -Format "yyyy-MM-dd"
    git commit -m "chore(newspapers): automated daily newspaper sync for $todayDate"
    git push origin main
    Write-Host "✅ Live website automatically updated on Vercel!" -ForegroundColor Green
} else {
    Write-Host "ℹ️ Manifest is already up to date. No new push needed." -ForegroundColor Yellow
}
