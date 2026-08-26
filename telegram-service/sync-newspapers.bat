@echo off
title UPSC NewsHub - Auto Multi-Channel Newspaper Sync & Deploy
cd /d "%~dp0"

REM Ensure Node.js and Git are always in PATH for Windows Task Scheduler
set "PATH=C:\Program Files\nodejs;C:\Program Files\Git\cmd;C:\Program Files\Git\bin;%USERPROFILE%\AppData\Roaming\npm;%PATH%"

echo ============================================================
echo  UPSC NewsHub - Multi-Channel Daily Sync & Auto-Deploy
echo ============================================================
echo.

node sync-and-push.mjs

echo.
echo Sync cycle complete.
