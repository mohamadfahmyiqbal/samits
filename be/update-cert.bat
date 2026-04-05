@echo off
echo Updating SSL Certificate...
echo.

cd /d "%~dp0cert"

REM Check if new certificates exist
if not exist "localhost.crt" (
    echo ❌ New certificate not found!
    echo Please run: openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout localhost.key -out localhost.crt -subj "/CN=localhost" -addext "subjectAltName=DNS:localhost,IP:127.0.0.1"
    pause
    exit /b 1
)

if not exist "localhost.key" (
    echo ❌ New private key not found!
    pause
    exit /b 1
)

REM Backup old certificates
if exist "..\certificate.cer" (
    copy "..\certificate.cer" "..\certificate.cer.backup" >nul
    echo 📁 Backed up old certificate
)

if exist "..\private.key" (
    copy "..\private.key" "..\private.key.backup" >nul
    echo 📁 Backed up old private key
)

REM Copy new certificates
copy "localhost.crt" "..\certificate.cer" >nul
copy "localhost.key" "..\private.key" >nul

echo ✅ Certificates updated!
echo    📄 Certificate: certificate.cer
echo    🔑 Private Key: private.key
echo.
echo 🔒 New certificate includes Subject Alternative Names
echo    - localhost
echo    - 127.0.0.1
echo    - Valid for 365 days
echo.

REM Clean up temporary files
del "localhost.crt" 2>nul
del "localhost.key" 2>nul
echo 🧹 Cleaned up temporary files

echo.
echo ✅ Ready to start server!
echo    Run: npm start
pause
