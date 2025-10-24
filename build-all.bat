@echo off
echo ================================
echo  Building Habits Tracker
echo ================================
echo.

REM Step 1: Build Frontend
echo [1/6] Building React frontend...
cd frontend
call pnpm run build
if %errorlevel% neq 0 (
    echo ERROR: Frontend build failed!
    pause
    exit /b %errorlevel%
)
echo ✓ Frontend built successfully
echo.

REM Step 2: Rename dist to build
echo [2/6] Renaming dist to build...
if exist build (
    rmdir /s /q build
    timeout /t 1 /nobreak >nul
)
if exist dist (
    ren dist build 2>nul
    if not exist build (
        echo   Rename failed, trying copy instead...
        robocopy dist build /E /MOVE /NFL /NDL /NJH /NJS
        if %errorlevel% geq 8 (
            echo ERROR: Failed to rename/move dist to build!
            pause
            exit /b 1
        )
    )
    echo ✓ Renamed dist to build
) else (
    echo ERROR: dist folder not found!
    pause
    exit /b 1
)
echo.

REM Step 3: Delete old build in backend
echo [3/6] Removing old build from backend...
cd ..\backend
if exist build (
    rmdir /s /q build
    echo ✓ Old build removed
) else (
    echo   No old build found
)
echo.

REM Step 4: Copy new build to backend
echo [4/6] Copying new build to backend...
if not exist ..\frontend\build (
    echo ERROR: Frontend build folder not found!
    pause
    exit /b 1
)
robocopy ..\frontend\build build /E /NFL /NDL /NJH /NJS
if %errorlevel% geq 8 (
    echo ERROR: Failed to copy build folder!
    pause
    exit /b %errorlevel%
)
echo ✓ Build copied successfully
echo.

REM Step 5: Build TypeScript Backend
echo [5/6] Building TypeScript backend...
call pnpm run build
if %errorlevel% neq 0 (
    echo ERROR: Backend build failed!
    pause
    exit /b %errorlevel%
)
echo ✓ Backend built successfully
echo.

REM Step 6: Create executables with pkg
echo [6/6] Creating executables with pkg...
echo This may take a few minutes...
call pnpx pkg .
if %errorlevel% neq 0 (
    echo ERROR: pkg build failed!
    pause
    exit /b %errorlevel%
)
echo ✓ Executables created successfully
echo.

echo ================================
echo  Build Complete! 
echo ================================
echo.
echo Executables are in: backend\executable\
echo   - habits-tracker-backend-win.exe
echo   - habits-tracker-backend-linux
echo   - habits-tracker-backend-macos
echo.
echo Next steps:
echo 1. Test the executable locally
echo 2. Run: deploy-release.bat to create GitHub Release
echo 3. Push landing page updates to deploy on Netlify
echo.
echo The landing page uses GitHub Releases for downloads.
echo Run 'deploy-release.bat' to upload executables to GitHub.
echo.
pause
