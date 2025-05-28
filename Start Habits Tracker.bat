@echo off
echo ===================================================
echo          STARTING HABITS TRACKER APPLICATION
echo ===================================================
echo This window will remain open while the application is running.
echo Please do not close this window until you're done using the application.
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in your PATH.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if running in development or production mode
if exist "frontend\dist\index.html" (
    echo Running in production mode...
    
    REM Check if backend is already running
    netstat -ano | findstr :5002 >nul
    if %ERRORLEVEL% EQU 0 (
        echo Port 5002 is already in use. The backend may already be running.
        echo If the app doesn't work, please close other applications using port 5002.
    )
    
    cd frontend
    start "" electron .
) else (
    echo Running in development mode...
    echo (No production build found, starting in development mode)
    echo.
    node dev-electron.js
)

echo.
echo Application closed. You can now close this window.
pause