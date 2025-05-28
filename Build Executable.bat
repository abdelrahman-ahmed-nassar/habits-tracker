@echo off
echo ===================================================
echo         BUILDING HABITS TRACKER EXECUTABLE
echo ===================================================

REM Set the project root directory
set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo Building Habits Tracker executable...
node "%PROJECT_ROOT%\build-app.js"

echo.
echo Build process completed.
pause
