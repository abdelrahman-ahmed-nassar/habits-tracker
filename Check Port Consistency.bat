@echo off
echo Checking port consistency across the codebase...
powershell -ExecutionPolicy Bypass -File check-ports.ps1
pause
