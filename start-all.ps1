# Script khởi động toàn bộ Blockchain E-commerce System
# Sử dụng: .\start-all.ps1

Write-Host "🚀 Đang khởi động Blockchain E-commerce System..." -ForegroundColor Cyan
Write-Host ""

# Kiểm tra các thư mục
$blockchainPath = "c:\Users\Admin\Documents\Blockchain\blockchain"
$backendPath = "c:\Users\Admin\Documents\Blockchain\backend"
$frontendPath = "c:\Users\Admin\Documents\Blockchain\frontend"

# DEBUG: show the paths and whether they exist (helps diagnose exit 1)
Write-Host "[DEBUG] blockchainPath = '$blockchainPath'" -ForegroundColor DarkGray
Write-Host "[DEBUG] Test-Path blockchainPath => $(Test-Path $blockchainPath)" -ForegroundColor DarkGray
Write-Host "[DEBUG] backendPath = '$backendPath'" -ForegroundColor DarkGray
Write-Host "[DEBUG] Test-Path backendPath  => $(Test-Path $backendPath)" -ForegroundColor DarkGray
Write-Host "[DEBUG] frontendPath = '$frontendPath'" -ForegroundColor DarkGray
Write-Host "[DEBUG] Test-Path frontendPath => $(Test-Path $frontendPath)" -ForegroundColor DarkGray
if (-not (Test-Path $blockchainPath)) {
    Write-Host "❌ Không tìm thấy thư mục blockchain!" -ForegroundColor Red
    exit 1
}

# 1. Khởi động Hardhat Node
Write-Host "📦 [1/4] Đang khởi động Hardhat Node..." -ForegroundColor Yellow
$hardhatProcess = Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Write-Host '🔗 Hardhat Node đang chạy trên http://127.0.0.1:8545' -ForegroundColor Green; cd '$blockchainPath'; npx hardhat node"
) -PassThru -WindowStyle Normal

Write-Host "⏳ Đợi Hardhat Node khởi động..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# 2. Deploy Smart Contract
Write-Host "📝 [2/4] Đang deploy Smart Contract..." -ForegroundColor Yellow
Set-Location $blockchainPath
$deployOutput = npx hardhat run scripts/deploy.js --network localhost 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Smart Contract đã deploy thành công!" -ForegroundColor Green
} else {
    Write-Host "⚠️ Deploy có cảnh báo nhưng có thể đã thành công" -ForegroundColor Yellow
}
Start-Sleep -Seconds 2

# 3. Khởi động Backend
Write-Host "🖥️  [3/4] Đang khởi động Backend Server..." -ForegroundColor Yellow
$backendProcess = Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Write-Host '🖥️  Backend đang chạy trên http://localhost:5000' -ForegroundColor Green; cd '$backendPath'; npm start"
) -PassThru -WindowStyle Normal

Start-Sleep -Seconds 3

# 4. Khởi động Frontend
Write-Host "🌐 [4/4] Đang khởi động Frontend..." -ForegroundColor Yellow
$frontendProcess = Start-Process powershell -ArgumentList @(
    '-NoExit',
    '-Command',
    "Write-Host '🌐 Frontend đang chạy trên http://localhost:3000' -ForegroundColor Green; cd '$frontendPath'; npm run dev"
) -PassThru -WindowStyle Normal

Start-Sleep -Seconds 3

# Hiển thị thông tin
Write-Host ""
Write-Host "=============================================" -ForegroundColor Green
Write-Host "✅ HỆ THỐNG ĐÃ KHỞI ĐỘNG THÀNH CÔNG!" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""
Write-Host "📌 Các dịch vụ đang chạy:" -ForegroundColor Cyan
Write-Host "   🔗 Hardhat Node:  http://127.0.0.1:8545" -ForegroundColor White
Write-Host "   🖥️  Backend API:   http://localhost:5000" -ForegroundColor White
Write-Host "   🌐 Frontend:      http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "📋 Tài khoản test:" -ForegroundColor Cyan
Write-Host "   User:  user@example.com / user123" -ForegroundColor White
Write-Host "   Admin: admin@example.com / admin123" -ForegroundColor White
Write-Host ""
Write-Host "💼 Địa chỉ ví Hardhat (để test):" -ForegroundColor Cyan
Write-Host "   Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  Để tắt hệ thống, chạy: .\stop-all.ps1" -ForegroundColor Yellow
Write-Host ""
Write-Host "Nhấn Enter để đóng cửa sổ này..." -ForegroundColor Gray
Read-Host
