# 🚀 Hướng dẫn Khởi động Nhanh

## Khởi động toàn bộ hệ thống (CHỈ 1 LỆNH)

### Cách 1: Script tự động (Khuyên dùng)
```powershell
cd "c:\Users\Admin\Documents\Blockchain"
.\start-all.ps1
```

Script này sẽ tự động:
1. ✅ Khởi động Hardhat Node (port 8545)
2. ✅ Deploy Smart Contract
3. ✅ Khởi động Backend (port 5000)
4. ✅ Khởi động Frontend (port 3000)

**Tất cả chỉ trong 1 lệnh duy nhất!**

---

## Dừng toàn bộ hệ thống

```powershell
.\stop-all.ps1
```

---

## Nếu gặp lỗi "cannot be loaded because running scripts is disabled"

Chạy lệnh này **một lần duy nhất** (với quyền Administrator):

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Sau đó chạy lại `.\start-all.ps1`

---

## Thông tin hệ thống

### 🔗 URLs
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **Blockchain**: http://127.0.0.1:8545

### 👤 Tài khoản test
- **User**: user@example.com / user123
- **Admin**: admin@example.com / admin123

### 💼 Địa chỉ ví Hardhat (để test)
```
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (Deployer)
Account #1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (User test)
Account #2: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
```

---

## Khởi động thủ công (nếu cần)

### Terminal 1: Hardhat Node
```powershell
cd blockchain
npx hardhat node
```

### Terminal 2: Deploy Contract
```powershell
cd blockchain
npx hardhat run scripts/deploy.js --network localhost
```

### Terminal 3: Backend
```powershell
cd backend
npm start
```

### Terminal 4: Frontend
```powershell
cd frontend
npm run dev
```

---

## Xử lý sự cố

### Port đã được sử dụng
```powershell
# Kiểm tra process đang dùng port
Get-NetTCPConnection -LocalPort 3000,5000,8545 -ErrorAction SilentlyContinue | Select-Object LocalPort, OwningProcess

# Dừng process
Stop-Process -Id <PID> -Force
```

### Hardhat không kết nối được
1. Đảm bảo Hardhat Node đang chạy
2. Kiểm tra port 8545: `Test-NetConnection -ComputerName 127.0.0.1 -Port 8545`
3. Khởi động lại: `.\stop-all.ps1` → `.\start-all.ps1`

### Backend không kết nối blockchain
- Đảm bảo Hardhat Node đã chạy **trước** khi start backend
- Contract address phải đúng trong `backend/.env`

---

## Tips

1. **Luôn chạy `.\start-all.ps1` trong PowerShell** (không phải CMD)
2. **Đợi mỗi dịch vụ khởi động xong** (script tự động đợi)
3. **Frontend có thể mất 10-15 giây** để compile lần đầu
4. **Tắt máy**: Chạy `.\stop-all.ps1` trước khi tắt để đảm bảo không có process chạy nền

---

## Workflow hàng ngày

```powershell
# Sáng: Khởi động
.\start-all.ps1

# ... làm việc ...

# Tối: Tắt
.\stop-all.ps1
```

**Đơn giản vậy thôi! 🎉**
