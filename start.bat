@echo off
title Hydro-AtCoder-GodMode
chcp 65001>nul
cd /d "%~dp0"
where node >nul 2>nul || (echo 需要先安装 Node.js：https://nodejs.org & pause & exit /b 1)
node app.js --serve
