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

echo Starting development environment...
echo.

REM Kill any processes that might be using our ports
echo Checking for processes using port 5002...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :5002') do (
    if not "%%a"=="0" (
        echo Terminating process %%a that's using port 5002
        taskkill /F /PID %%a >nul 2>&1
    )
)

REM Start the development environment using dev-electron.js with absolute path
node "%PROJECT_ROOT%\dev-electron.js"

echo.
echo Development session ended.
echo You can now close this window.
pause
