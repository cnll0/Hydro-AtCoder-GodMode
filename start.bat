@echo off
chcp 65001 >nul
title Hydro-AtCoder-GodMode 一键启动

echo ============================================
echo   Hydro-AtCoder-GodMode 一键启动脚本
echo   本地 VSCode 一键抓题 / 自动分屏 / 一键提交
echo ============================================
echo.

:: 检查 Node.js
where node >nul 2>&1
if errorlevel 1 (
    echo [错误] 未检测到 Node.js，请先安装：https://nodejs.org/
    pause
    exit /b 1
)
echo [ OK ] Node.js 已安装

:: 进入项目目录
cd /d "%~dp0"

:: 运行安装脚本（首次使用会生成 .vscode 配置）
echo [ 正在 ] 运行 setup.js 生成 VSCode 配置...
node setup.js
if errorlevel 1 (
    echo [错误] setup.js 运行失败
    pause
    exit /b 1
)
echo [ OK ] VSCode 配置已就绪
echo.

:: 启动本地服务
echo [ 正在 ] 启动本地服务 (http://localhost:27122)...
start "" node server.js
echo.
echo ============================================
echo   服务已启动！请按以下步骤使用：
echo   1. 把 tampermonkey/ 里的两个脚本安装到浏览器
echo   2. 在 VSCode 中打开当前文件夹作为工作区
echo   3. 浏览器打开题目页，点击“发送到 CPH / VSCode”
echo   4. 编写代码后，按 Alt+Enter 一键提交
echo ============================================
echo.
pause