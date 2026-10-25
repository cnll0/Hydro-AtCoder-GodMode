@echo off
cd /d "%~dp0"
where node >nul 2>&1
if errorlevel 1 (
    echo Node.js not found. Install from https://nodejs.org/ then run this again.
    pause
    exit /b 1
)
start "HydroGM-Server" /min node server.js
echo.
echo Local service running at http://localhost:27122
echo Keep the hidden console window open while solving problems.
echo.
ping -n 3 127.0.0.1 >nul
if not defined HYDRO_NO_BROWSER start "" http://localhost:27122/install.html
