@echo off
setlocal EnableExtensions
title Hydro-AtCoder-GodMode Uninstaller

echo This will stop the local service and delete:
echo   %LOCALAPPDATA%\HydroGodMode
echo (Your Tampermonkey scripts stay installed in the browser.)
echo.
pause

for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":27122" ^| findstr LISTENING') do taskkill /PID %%p /F >nul 2>&1
taskkill /fi "WINDOWTITLE eq HydroGM-Server*" /f >nul 2>&1

cd /d "%TEMP%"
rmdir /s /q "%LOCALAPPDATA%\HydroGodMode" >nul 2>&1

echo.
echo Removed. You can also delete the downloaded project folder.
echo Your .vscode\tasks.json in the workspace is harmless; delete it manually if you want.
echo.
pause
endlocal
