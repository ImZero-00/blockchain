@echo off
echo 🛑 Đang dừng Blockchain E-commerce System...
echo.
powershell.exe -ExecutionPolicy Bypass -File "%~dp0stop-all.ps1"
pause
