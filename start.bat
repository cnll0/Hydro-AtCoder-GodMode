@echo off
title Hydro-AtCoder-GodMode One-Click Start

echo ============================================
echo   Hydro-AtCoder-GodMode One-Click Start
echo   Local VSCode OJ Auto-Submit Tool
echo ============================================
echo.

:: Check Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Please install: https://nodejs.org/
    pause
    exit /b 1
)
echo [ OK ] Node.js found

:: Enter project directory
cd /d "%~dp0"

:: Run setup.js (generates .vscode config on first use)
echo [ Running ] Running setup.js to generate VSCode config...
node setup.js
if errorlevel 1 (
    echo [ERROR] setup.js failed
    pause
    exit /b 1
)
echo [ OK ] VSCode config ready
echo.

:: Start local server
echo [ Starting ] Starting local server (http://localhost:27122)...
start "" node server.js

:: Give the server a moment, then open the install guide in the default browser
timeout /t 2 /nobreak >nul
start "" "http://localhost:27122/install.html"

echo.
echo ============================================
echo   Service started: http://localhost:27122
echo   Install page opened in your browser.
echo   In that page, click the script links to install them.
echo   Then open a problem page and press Alt+Enter to submit.
echo ============================================
echo.
pause