# Script dừng toàn bộ Blockchain E-commerce System
# Sử dụng: .\stop-all.ps1

Write-Host "🛑 Đang dừng Blockchain E-commerce System..." -ForegroundColor Red
Write-Host ""

# Dừng tất cả các process Node.js
Write-Host "⏹️  Đang dừng Backend & Frontend..." -ForegroundColor Yellow
try {
    Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Đã dừng Node.js processes" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Không tìm thấy Node.js process nào" -ForegroundColor Yellow
}

# Dừng tất cả các process PowerShell phụ (nếu có)
Write-Host "⏹️  Đang dừng các terminal phụ..." -ForegroundColor Yellow
$currentPID = $PID
Get-Process powershell -ErrorAction SilentlyContinue | Where-Object {
    $_.Id -ne $currentPID -and 
    $_.MainWindowTitle -match "hardhat|backend|frontend|Hardhat Node|Backend|Frontend"
} | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Đã đóng terminal: $($_.MainWindowTitle)" -ForegroundColor Green
}

Start-Sleep -Seconds 1

Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "✅ ĐÃ DỪNG TẤT CẢ CÁC DỊCH VỤ!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Để khởi động lại, chạy: .\start-all.ps1" -ForegroundColor Cyan
Write-Host ""
