@echo off
REM Deploy to GitHub Releases
REM Run this after build-all.bat completes

echo ================================
echo  Deploying to GitHub Releases
echo ================================
echo.

REM Check if GitHub CLI is installed
where gh >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: GitHub CLI (gh) not found!
    echo.
    echo Please install it from: https://cli.github.com/
    echo.
    echo After installation, run:
    echo   gh auth login
    echo.
    pause
    exit /b 1
)

REM Check if logged in
gh auth status >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Not logged in to GitHub!
    echo.
    echo Please run: gh auth login
    echo.
    pause
    exit /b 1
)

REM Get version (you can modify this)
set /p VERSION="Enter version (e.g., v1.0.0): "

echo.
echo Packaging executables...
echo.

REM Create temporary directory
mkdir temp-release 2>nul
mkdir temp-release\modawim-windows 2>nul
mkdir temp-release\modawim-macos 2>nul
mkdir temp-release\modawim-linux 2>nul

REM Copy files
copy backend\executable\habits-tracker-backend-win.exe temp-release\modawim-windows\habits-tracker-backend.exe
xcopy backend\executable\data temp-release\modawim-windows\data\ /E /I /Y /Q
copy backend\executable\README.md temp-release\modawim-windows\README.md

copy backend\executable\habits-tracker-backend-macos temp-release\modawim-macos\habits-tracker-backend
xcopy backend\executable\data temp-release\modawim-macos\data\ /E /I /Y /Q
copy backend\executable\README.md temp-release\modawim-macos\README.md

copy backend\executable\habits-tracker-backend-linux temp-release\modawim-linux\habits-tracker-backend
xcopy backend\executable\data temp-release\modawim-linux\data\ /E /I /Y /Q
copy backend\executable\README.md temp-release\modawim-linux\README.md

REM Create ZIP files
echo Creating ZIP files...
powershell -command "Compress-Archive -Path 'temp-release\modawim-windows\*' -DestinationPath 'temp-release\modawim-windows.zip' -Force"
powershell -command "Compress-Archive -Path 'temp-release\modawim-macos\*' -DestinationPath 'temp-release\modawim-macos.zip' -Force"
powershell -command "Compress-Archive -Path 'temp-release\modawim-linux\*' -DestinationPath 'temp-release\modawim-linux.zip' -Force"

echo.
echo Creating release %VERSION%...
echo.

REM Create release and upload files
gh release create %VERSION% ^
    temp-release\modawim-windows.zip ^
    temp-release\modawim-macos.zip ^
    temp-release\modawim-linux.zip ^
    --title "مداوم %VERSION%" ^
    --notes "تطبيق مداوم لتتبع العادات - إصدار %VERSION%"

if %errorlevel% neq 0 (
    echo ERROR: Failed to create release!
    rmdir /S /Q temp-release
    pause
    exit /b %errorlevel%
)

REM Cleanup
echo Cleaning up...
rmdir /S /Q temp-release

echo.
echo ================================
echo Release created successfully!
echo ================================
echo.
echo Download URLs:
echo https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/download/%VERSION%/modawim-windows.zip
echo https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/download/%VERSION%/modawim-macos.zip
echo https://github.com/abdelrahman-ahmed-nassar/modawim-habits-tracker/releases/download/%VERSION%/modawim-linux.zip
echo.
echo The landing page already uses /latest/download/ URLs
echo so users will always get the newest version automatically!
echo.
pause
