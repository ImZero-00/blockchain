# Script khởi động lại toàn bộ hệ thống
# Sử dụng: .\restart-all.ps1

Write-Host "🔄 Đang khởi động lại Blockchain E-commerce System..." -ForegroundColor Cyan
Write-Host ""

# Dừng tất cả
Write-Host "⏹️  Đang dừng các dịch vụ cũ..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Khởi động lại
Write-Host "🚀 Đang khởi động lại..." -ForegroundColor Yellow
Write-Host ""

& "$PSScriptRoot\start-all.ps1"
