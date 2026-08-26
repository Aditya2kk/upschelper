@echo off
title UPSC NewsHub - Auto Newspaper Sync & Deploy
cd /d "%~dp0"
echo ============================================================
echo  UPSC NewsHub - Daily Newspaper Sync ^& Auto-Deploy
echo ============================================================
echo.

node sync-and-push.mjs

echo.
echo Process complete.
