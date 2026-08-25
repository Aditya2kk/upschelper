# ==========================================================
# UPSC NewsHub AI — Local Auto-Sync and GitHub Cloud Push
# ==========================================================

$ErrorActionPreference = "Continue"

$repoRoot = "D:\portfolio\UPSC"
Set-Location $repoRoot

$logFile = "$repoRoot\scripts\sync-log.txt"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Add-Content -Path $logFile -Value "`n[$timestamp] === Starting Daily Newspaper Auto-Sync ==="

# 1. Ensure Node.js and Git are in PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# 2. Run Telegram fetcher
Set-Location "$repoRoot\telegram-service"
node fetch-newspapers.mjs *>> $logFile

# 3. Stage manifest AND newly downloaded PDF files
Set-Location $repoRoot
git add frontend/public/newspapers/

$gitStatus = git status --porcelain frontend/public/newspapers/
if ($gitStatus) {
    $todayDate = Get-Date -Format "yyyy-MM-dd"
    git commit -m "chore(newspapers): automated daily newspaper sync for $todayDate" *>> $logFile
    git push origin main *>> $logFile
    Add-Content -Path $logFile -Value "[$timestamp] ✅ Successfully committed and pushed new editions to GitHub & Vercel!"
    Write-Host "✅ Live website automatically updated on Vercel!" -ForegroundColor Green
} else {
    Add-Content -Path $logFile -Value "[$timestamp] ℹ️ Manifest and PDFs are up to date. No new push needed."
    Write-Host "ℹ️ Manifest and PDFs are up to date." -ForegroundColor Yellow
}
