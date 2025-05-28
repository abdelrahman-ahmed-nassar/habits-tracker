@echo off
echo ===================================================
echo    STARTING HABITS TRACKER IN DEVELOPMENT MODE
echo ===================================================
echo This mode provides hot-reloading for both frontend and backend.
echo Perfect for development and testing changes.
echo.
echo This window will remain open while the app is running.
echo Please DO NOT close this window until you're done coding.
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Starting development environment...
echo.

REM Start the development environment using dev-electron.js
node dev-electron.js

echo.
echo Development session ended.
echo You can now close this window.
pause
