@echo off
title Setup UPSC Daily Newspaper Auto-Sync Task
echo ============================================================
echo  Setting up Windows Scheduled Task for UPSC Newspaper Sync
echo ============================================================
echo.

set TASK_NAME=UPSCNewsHubSync
set SCRIPT_PATH=%~dp0sync-newspapers.bat

echo Task Name: %TASK_NAME%
echo Script:    %SCRIPT_PATH%
echo.

:: Delete existing task if present
schtasks /delete /tn "%TASK_NAME%" /f >nul 2>&1

:: Create scheduled task to run daily at 06:30 AM
schtasks /create /tn "%TASK_NAME%" /tr "\"%SCRIPT_PATH%\"" /sc daily /st 06:30 /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo [SUCCESS] Windows Task "%TASK_NAME%" created successfully!
    echo It will run automatically every morning at 6:30 AM IST.
    echo ============================================================
) else (
    echo.
    echo [NOTE] If permission denied, please right-click this .bat file and select 'Run as administrator'.
)

echo.
pause
