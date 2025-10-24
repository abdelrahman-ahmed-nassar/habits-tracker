@echo off
REM Script to prepare download packages for مداوم (Modawim) Habits Tracker
REM This script packages the executables with data folder for distribution

echo Preparing مداوم (Modawim) download packages...
echo.

REM Check if executables exist
if not exist "..\..\backend\executable\habits-tracker-backend-linux" (
    echo ERROR: Linux executable not found!
    goto :error
)

if not exist "..\..\backend\executable\habits-tracker-backend-macos" (
    echo ERROR: macOS executable not found!
    goto :error
)

REM Create temporary folders for packaging
mkdir temp-windows 2>nul
mkdir temp-macos 2>nul
mkdir temp-linux 2>nul
mkdir "temp-windows\modawim" 2>nul
mkdir "temp-macos\modawim" 2>nul
mkdir "temp-linux\modawim" 2>nul

echo Copying files...

REM Copy Windows executable (you need to build this)
REM copy "..\..\backend\executable\habits-tracker-backend.exe" "temp-windows\modawim\" 2>nul

REM Copy macOS executable
copy "..\..\backend\executable\habits-tracker-backend-macos" "temp-macos\modawim\habits-tracker-backend"

REM Copy Linux executable  
copy "..\..\backend\executable\habits-tracker-backend-linux" "temp-linux\modawim\habits-tracker-backend"

REM Copy data folders
xcopy "..\..\backend\executable\data" "temp-windows\modawim\data\" /E /I /Y
xcopy "..\..\backend\executable\data" "temp-macos\modawim\data\" /E /I /Y
xcopy "..\..\backend\executable\data" "temp-linux\modawim\data\" /E /I /Y

REM Copy README
copy "..\..\backend\executable\README.md" "temp-windows\modawim\README.md"
copy "..\..\backend\executable\README.md" "temp-macos\modawim\README.md"
copy "..\..\backend\executable\README.md" "temp-linux\modawim\README.md"

echo Creating zip files...

REM Create zip files (requires 7zip or PowerShell)
where 7z >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Using 7-Zip...
    7z a -tzip modawim-windows.zip "temp-windows\modawim\*"
    7z a -tzip modawim-macos.zip "temp-macos\modawim\*"
    7z a -tzip modawim-linux.zip "temp-linux\modawim\*"
) else (
    echo Using PowerShell...
    powershell -command "Compress-Archive -Path 'temp-windows\modawim\*' -DestinationPath 'modawim-windows.zip' -Force"
    powershell -command "Compress-Archive -Path 'temp-macos\modawim\*' -DestinationPath 'modawim-macos.zip' -Force"
    powershell -command "Compress-Archive -Path 'temp-linux\modawim\*' -DestinationPath 'modawim-linux.zip' -Force"
)

REM Cleanup
echo Cleaning up temporary files...
rmdir /S /Q temp-windows
rmdir /S /Q temp-macos
rmdir /S /Q temp-linux

echo.
echo ================================
echo Download packages created successfully!
echo.
echo Files created:
dir *.zip
echo.
echo These files are ready to be deployed with your Netlify site.
echo ================================
goto :end

:error
echo.
echo Please build the executables first using:
echo   cd backend
echo   pnpm run build:executable
echo.

:end
pause
