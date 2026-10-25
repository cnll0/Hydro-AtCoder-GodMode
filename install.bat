@echo off
setlocal EnableExtensions
title Hydro-AtCoder-GodMode Installer

rem ============================================================
rem  One-time installer:
rem    1. writes VSCode tasks into your coding workspace
rem    2. serves the install page from a TEMP folder
rem    3. after you install the scripts, TEMP files are deleted
rem    4. optionally keeps a tiny local service for daily submit
rem ============================================================

cd /d "%~dp0"

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js not found. Install it first: https://nodejs.org/
    pause
    exit /b 1
)

rem ---------- 1) workspace for .vscode ----------
if defined HYDRO_WS (
    set "WS=%HYDRO_WS%"
) else (
    echo.
    echo Where do you write your .cpp files?
    echo Press Enter to use: %USERPROFILE%\Desktop\HydroOJ
    set /p "WS=Workspace> "
)
if not defined WS set "WS=%USERPROFILE%\Desktop\HydroOJ"
if not exist "%WS%" mkdir "%WS%"

echo.
echo [1/4] Writing VSCode tasks into "%WS%\.vscode" ...
node setup.js "%WS%"
if errorlevel 1 (
    echo [ERROR] setup.js failed
    pause
    exit /b 1
)

if not defined HYDRO_NO_KEYBIND (
    echo [1/4] Binding Alt+Enter in VS Code user keybindings ...
    node bind-keybinding.js
)

rem ---------- 2) temp install server ----------
set "PORT=27124"
netstat -ano | findstr ":27124" | findstr LISTENING >nul 2>&1
if not errorlevel 1 set "PORT=27125"

set "TMPD=%TEMP%\hydro-gm-%RANDOM%%RANDOM%"
mkdir "%TMPD%" >nul 2>&1
copy /y server.js "%TMPD%\" >nul
copy /y install.html "%TMPD%\" >nul
copy /y README.md "%TMPD%\" >nul
copy /y INSTALL.md "%TMPD%\" >nul
xcopy /e /i /y tampermonkey "%TMPD%\tampermonkey" >nul

echo [2/4] Starting temporary install server on port %PORT% ...
start "HydroGM-TempServer" /min /d "%TMPD%" cmd /c "set PORT=%PORT%&& node server.js"
ping -n 3 127.0.0.1 >nul

if not defined HYDRO_NO_BROWSER start "" "http://localhost:%PORT%/install.html"

echo.
echo [3/4] In the browser page:
echo        a) install Tampermonkey (Edge store button)
echo        b) click the two one-click install script links
echo        c) come back to this window
echo.
if not defined HYDRO_GM_YES pause

rem ---------- 3) stop temp server, delete temp files ----------
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort %PORT% -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }" >nul 2>&1
taskkill /fi "WINDOWTITLE eq HydroGM-TempServer*" /f >nul 2>&1
ping -n 2 127.0.0.1 >nul
rmdir /s /q "%TMPD%" >nul 2>&1
if exist "%TMPD%" rmdir /s /q "%TMPD%" >nul 2>&1
echo [3/4] Temporary install files removed.

rem ---------- 4) optional tiny runtime ----------
if defined HYDRO_KEEP_RUNTIME (
    set "KEEP=%HYDRO_KEEP_RUNTIME%"
) else (
    echo.
    echo Keep a tiny local service so Alt+Enter auto-submit keeps working? [Y/n]
    set /p "KEEP=Y> "
)
if /i "%KEEP%"=="n" goto :done

set "RUNTIME=%LOCALAPPDATA%\HydroGodMode"
if not exist "%RUNTIME%" mkdir "%RUNTIME%" >nul 2>&1
copy /y server.js "%RUNTIME%\" >nul
copy /y runtime-start.bat "%RUNTIME%\start.bat" >nul
copy /y uninstall.bat "%RUNTIME%\uninstall.bat" >nul
> "%RUNTIME%\.installed" echo ok
echo [4/4] Tiny runtime installed at "%RUNTIME%".

:done
echo.
echo ============================================================
if /i "%KEEP%"=="n" (
    echo Done. No local files are kept.
    echo NOTE: without the local service, Alt+Enter auto-submit will
    echo       not work. Re-run this installer later if you need it.
) else (
    echo Done. You can now delete the whole downloaded folder.
    echo Daily start: "%RUNTIME%\start.bat"
    echo Uninstall:   "%RUNTIME%\uninstall.bat"
)
echo ============================================================
echo.
if not defined HYDRO_GM_YES pause
endlocal
