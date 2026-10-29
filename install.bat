@echo off
chcp 65001>nul
setlocal
where node >nul 2>nul || (echo 需要先安装 Node.js：https://nodejs.org & pause & exit /b 1)
node "%~dp0app.js" %*
if errorlevel 1 pause
