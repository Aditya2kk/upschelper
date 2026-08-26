@echo off
title Setup UPSC Continuous Newspaper Auto-Sync
echo ============================================================
echo  Setting up Continuous Background Newspaper Sync (Every 20m)
echo ============================================================
echo.

set TASK_NAME=UPSCNewsHubSync
set SCRIPT_PATH=%~dp0run-sync-silent.vbs

echo Task Name: %TASK_NAME%
echo Runner:    wscript.exe "%SCRIPT_PATH%"
echo Frequency: Every 20 minutes (Continuous, Silent)
echo.

:: Delete existing task if present
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

:: Create scheduled task to run every 20 minutes silently in the background
schtasks /create /tn "%TASK_NAME%" /tr "wscript.exe \"%SCRIPT_PATH%\"" /sc minute /mo 20 /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo [SUCCESS] Continuous Auto-Sync Task registered!
    echo It will check Telegram every 20 minutes silently all day.
    echo As soon as any edition is uploaded, it auto-pushes to Vercel!
    echo ============================================================
) else (
    echo.
    echo [NOTE] If permission denied, please right-click this .bat file and select 'Run as administrator'.
)

echo.
pause
