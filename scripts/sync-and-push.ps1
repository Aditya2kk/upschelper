# ==========================================================
# UPSC NewsHub AI — Automated Daily Newspaper & News Sync
# ==========================================================

$ErrorActionPreference = "Continue"

$repoRoot = "D:\portfolio\UPSC"
Set-Location $repoRoot

$logFile = "$repoRoot\scripts\sync-log.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path $logFile -Value "`n[$timestamp] === Starting Daily Auto-Sync (Newspapers + Current Affairs) ==="

# 1. Ensure Node.js and Git are in PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 2. Run Telegram Newspaper fetcher
Write-Host "📰 [1/3] Fetching newest daily newspapers from Telegram..." -ForegroundColor Cyan
Set-Location "$repoRoot\telegram-service"
node fetch-newspapers.mjs *>> $logFile

# 3. Run Live Current Affairs & Editorial synthesizer from National feeds
Write-Host "🔥 [2/3] Fetching daily current affairs from PIB & National feeds..." -ForegroundColor Cyan
Set-Location $repoRoot
node scripts/fetch-live-news.mjs *>> $logFile

# 4. Stage all updated newspapers and live current affairs
Write-Host "🚀 [3/3] Checking for updates to push to live website..." -ForegroundColor Cyan
git add frontend/public/newspapers/ frontend/public/news/

$gitStatus = git status --porcelain frontend/public/newspapers/ frontend/public/news/
if ($gitStatus) {
    $todayDate = Get-Date -Format "yyyy-MM-dd"
    git commit -m "chore(sync): automated daily sync for newspapers & current affairs ($todayDate)" *>> $logFile
    git push origin main *>> $logFile
    Add-Content -Path $logFile -Value "[$timestamp] ✅ Successfully committed and pushed live newspapers and current affairs to GitHub & Vercel!"
    Write-Host "✅ Live website automatically updated on Vercel!" -ForegroundColor Green
} else {
    Add-Content -Path $logFile -Value "[$timestamp] ℹ️ Everything is already up to date. No new push needed."
    Write-Host "ℹ️ Everything is already up to date." -ForegroundColor Yellow
}
