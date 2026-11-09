@echo off
echo ============================================================
echo   CampusPulse AI - Push to GitHub (Shreehari159)
echo ============================================================
cd /d "C:\Apps\campuspulse-platform"

echo Checking remote configuration...
git remote -v

echo.
echo Attempting git push to origin main...
git push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================================
    echo [SUCCESS] Code successfully pushed to https://github.com/Shreehari159/campuspulse-ai
    echo ============================================================
) else (
    echo.
    echo ============================================================
    echo [NOTICE] If the connection timed out, your current Wi-Fi network
    echo          may be blocking outbound traffic to GitHub.
    echo.
    echo          Switch to a Mobile Hotspot or VPN and re-run this script!
    echo ============================================================
)

pause
