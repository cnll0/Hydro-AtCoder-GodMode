@echo off
setlocal EnableExtensions
title Hydro-AtCoder-GodMode
cd /d "%~dp0"

set "RUNTIME=%LOCALAPPDATA%\HydroGodMode"

rem ---------- first run: one-time install ----------
if not exist "%RUNTIME%\.installed" (
    echo First run detected: starting one-time install...
    echo.
    call "%~dp0install.bat"
    goto :eof
)

rem ---------- later runs: just start the local service ----------
if not exist "%~dp0server.js" (
    call "%RUNTIME%\start.bat"
    goto :eof
)

start "HydroGM-Server" /min node server.js
echo.
echo Local service running at http://localhost:27122
echo Keep the hidden console window open while solving problems.
echo Reinstall guide: run install.bat
echo.
"%SystemRoot%\System32\timeout.exe" /t 2 /nobreak >nul
endlocal
