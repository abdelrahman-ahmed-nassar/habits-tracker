@echo off
echo Updating port references across the codebase...
node update-ports.js
echo.
echo Verifying ports are correctly updated...
powershell -ExecutionPolicy Bypass -File check-ports.ps1
pause
