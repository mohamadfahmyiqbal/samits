@echo off
echo Starting SAMIT Backend Server...
echo.

REM Check if Node.js is running
tasklist /FI "IMAGENAME eq node.exe" 2>NUL | find /I "node.exe"
if %ERRORLEVEL% EQU 0 (
    echo [WARNING] Node.js process already running. Stopping...
    taskkill /F /IM node.exe
    timeout /t 2 >nul
)

REM Start server
echo [INFO] Starting server with SSL...
cd /d "%~dp0"
npm start

pause
