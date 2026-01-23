@echo off
echo ========================================
echo   EXPO SETUP FOR HELP NEST MOBILE APP
echo ========================================
echo.

REM Check Node.js
node --version
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo ✓ Node.js detected

REM Navigate to project
cd /d D:\HelpNest\mobile-app
echo Current directory: %CD%

REM Clean up
echo Cleaning up...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

REM Install Expo CLI
echo Installing Expo CLI...
npm install -g expo-cli

REM Install dependencies
echo Installing project dependencies...
npm install

echo.
echo ========================================
echo   STARTING HELP NEST APP
echo ========================================
echo.

REM Start the app
echo Choose platform:
echo 1. Web Browser
echo 2. Android Emulator
echo 3. iOS (Mac only)
echo 4. Expo Go (QR Code)
echo.
set /p choice="Enter choice (1-4): "

if "%choice%"=="1" (
    expo start --web
) else if "%choice%"=="2" (
    expo start --android
) else if "%choice%"=="3" (
    expo start --ios
) else if "%choice%"=="4" (
    expo start
) else (
    echo Invalid choice, starting web...
    expo start --web
)

pause