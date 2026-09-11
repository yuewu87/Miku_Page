@echo off
chcp 65001 >nul
cd /d "%~dp0"

rem MIKU NOTE 一键启动：本地静态服务器 + 自动打开浏览器
rem 用法：双击本文件，或 start.bat 4000 指定端口

set "PORT=%~1"
if "%PORT%"=="" set "PORT=3939"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   [错误] 未找到 Node.js，请先安装后再运行本脚本。
  echo   下载地址: https://nodejs.org/
  echo.
  pause
  exit /b 1
)

echo.
echo   MIKU NOTE · 初音未来主题交互博客
echo   本地地址: http://127.0.0.1:%PORT%/
echo   停止服务: 按 Ctrl+C 或直接关闭本窗口
echo.

rem 延迟 2 秒后打开默认浏览器（设 MIKU_NO_OPEN=1 可跳过）
if not defined MIKU_NO_OPEN start "" /min cmd /c "ping -n 3 127.0.0.1 >nul & explorer http://127.0.0.1:%PORT%/" >nul 2>nul

node server.js %PORT%

echo.
echo   服务已停止。
pause
