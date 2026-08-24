# ==========================================================
# UPSC NewsHub AI — Automated Daily Newspaper Sync Setup
# Configures Windows Task Scheduler to run daily at 6:30 AM IST
# ==========================================================

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Setting up UPSC NewsHub Daily Newspaper Sync Task..." -ForegroundColor Cyan

$nodePath = "C:\Program Files\nodejs\node.exe"
if (-not (Test-Path $nodePath)) {
    $nodeCmd = Get-Command node.exe -ErrorAction SilentlyContinue
    if ($nodeCmd) {
        $nodePath = $nodeCmd.Source
    } else {
        Write-Host "Could not find node.exe. Please install Node.js." -ForegroundColor Red
        exit 1
    }
}

Write-Host "Found Node.js at: $nodePath" -ForegroundColor Green

$workDir = "D:\portfolio\UPSC\telegram-service"
$scriptFile = "fetch-newspapers.mjs"

$action = New-ScheduledTaskAction -Execute $nodePath -Argument $scriptFile -WorkingDirectory $workDir
$trigger = New-ScheduledTaskTrigger -Daily -At 6:30AM
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -ExecutionTimeLimit (New-TimeSpan -Minutes 30)

$taskName = "UPSC-Newspaper-Daily-Sync"
Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Settings $settings -Description "Automatically downloads morning newspapers for UPSC NewsHub AI" -Force

Write-Host ""
Write-Host "Success! Windows Task '$taskName' has been registered." -ForegroundColor Green
Write-Host "Schedule: Daily at 6:30 AM IST" -ForegroundColor Yellow
Write-Host "If laptop is off at 6:30 AM, it will sync automatically when you turn on your laptop." -ForegroundColor Yellow
Write-Host "Runs completely in the background without any open terminal windows." -ForegroundColor Cyan
Write-Host ""
