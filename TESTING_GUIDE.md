# 🧪 Manual Testing Guide

## ✅ CÁCH TEST HỆ THỐNG

### 1️⃣ Kiểm tra Backend Server
Mở browser hoặc dùng curl:
```bash
# Test health check
curl http://localhost:5000

# Kết quả mong đợi:
# {"success":true,"message":"E-commerce Blockchain API Server","version":"1.0.0"}
```

---

### 2️⃣ Test Authentication Flow

#### A. Đăng ký tài khoản mới
```bash
curl -X POST http://localhost:5000/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"newuser@test.com\",\"password\":\"test123\",\"fullName\":\"New User\"}"
```

**Kết quả mong đợi**: 
```json
{
  "success": true,
  "message": "Đăng ký thành công",
  "data": {
    "user": {
      "id": "...",
      "email": "newuser@test.com",
      "fullName": "New User",
      "role": "user"
    }
  }
}
```

#### B. Đăng nhập
```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"user123\"}"
```

**Kết quả mong đợi**: Nhận được JWT token
```json
{
  "success": true,
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**💾 LƯU TOKEN**: Copy token từ response để dùng cho các request tiếp theo!

#### C. Lấy thông tin profile (với token)
```bash
# Thay YOUR_TOKEN bằng token từ bước login
curl http://localhost:5000/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

### 3️⃣ Test Order Creation (Yêu cầu Token + Wallet)

#### A. Tạo đơn hàng (user có wallet)
```bash
# Login bằng user có wallet
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"user@example.com\",\"password\":\"user123\"}"

# Lưu token, sau đó tạo order
curl -X POST http://localhost:5000/orders/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"orderId\":\"MANUAL_TEST_001\",\"productId\":\"PROD_001\",\"quantity\":1,\"price\":\"0.5\"}"
```

**Kết quả mong đợi**: Order được tạo trên blockchain
```json
{
  "success": true,
  "data": {
    "orderId": "MANUAL_TEST_001",
    "customerName": "Nguyễn Văn A",
    "productName": "Laptop Dell XPS 13",
    "amountInEth": "0.5",
    "buyerAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "transactionHash": "0x...",
    "blockNumber": 2,
    "dataHash": "0x..."
  }
}
```

#### B. Test security (không có token)
```bash
curl -X POST http://localhost:5000/orders/create \
  -H "Content-Type: application/json" \
  -d "{\"orderId\":\"TEST\",\"productId\":\"PROD_001\",\"quantity\":1,\"price\":\"0.5\"}"
```

**Kết quả mong đợi**: Error 401 Unauthorized
```json
{
  "success": false,
  "message": "Token không được cung cấp"
}
```

---

### 4️⃣ Test Frontend UI

#### A. Truy cập ứng dụng
```
http://localhost:3000
```

#### B. Test Login Flow
1. Click **"🔓 Đăng nhập"** trên navbar
2. Điền:
   - Email: `user@example.com`
   - Password: `user123`
3. Click "Đăng nhập"
4. **Kiểm tra**: Navbar hiển thị "👤 Nguyễn Văn A"

#### C. Test Profile & Wallet
1. Click **"👤 Nguyễn Văn A"** để vào profile
2. Kiểm tra thông tin user hiển thị
3. Kiểm tra wallet address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`

#### D. Test Order Creation
1. Vào trang chủ
2. Chọn sản phẩm "Laptop Dell XPS 13"
3. Click **"Mua ngay"**
4. Nhập số lượng: `1`
5. Click **"🔗 Ghi giao dịch lên Blockchain"**
6. **Kiểm tra**:
   - Loading spinner hiển thị
   - Success message với transaction hash
   - Order details hiển thị đầy đủ
   - Data hash được hiển thị

#### E. Test Admin Dashboard
1. Logout (click "🚪 Đăng xuất")
2. Login lại với admin account:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Click **"👑 Admin"** trên navbar
4. **Kiểm tra**:
   - Statistics cards hiển thị
   - Order table với tất cả orders
   - Filter buttons hoạt động
   - Order details đầy đủ (buyer address, transaction hash)

---

### 5️⃣ Test Order Verification

#### A. Via API
```bash
curl http://localhost:5000/orders/verify/MANUAL_TEST_001
```

**Kết quả mong đợi**:
```json
{
  "success": true,
  "data": {
    "database": {...},
    "blockchain": {
      "exists": true,
      "buyer": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
      "amountInEth": "0.5000",
      "dataHashMatch": true
    }
  }
}
```

#### B. Via Frontend
1. Vào `/verify`
2. Nhập Order ID: `MANUAL_TEST_001`
3. Click "Xác minh"
4. **Kiểm tra**: 
   - ✅ Order tồn tại trên blockchain
   - ✅ Data hash khớp
   - Database và blockchain data hiển thị

---

### 6️⃣ Test Security Features

#### A. Unauthorized Access
1. Logout khỏi ứng dụng
2. Thử vào `/checkout` trực tiếp
3. **Kiểm tra**: Redirect về `/login`

#### B. No Wallet Protection
1. Login với user chưa có wallet:
   - Email: `user2@example.com`
   - Password: `user456`
2. Thử đặt hàng
3. **Kiểm tra**: Alert "Vui lòng khai báo địa chỉ ví"
4. Redirect về `/profile`

#### C. Admin Only Access
1. Login với user thường (`user@example.com`)
2. Thử vào `/admin` trực tiếp
3. **Kiểm tra**: Alert "Không có quyền truy cập"
4. Redirect về trang chủ

---

### 7️⃣ Test Blockchain Connection

```bash
curl http://localhost:5000/blockchain/info
```

**Kết quả mong đợi**:
```json
{
  "success": true,
  "data": {
    "network": "unknown",
    "chainId": "1337",
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "totalOrders": 3,
    "rpcUrl": "http://127.0.0.1:8545"
  }
}
```

---

## ✅ CHECKLIST - Tất cả phải PASS

### Backend:
- [ ] ✅ Server chạy trên port 5000
- [ ] ✅ POST /auth/register tạo user thành công
- [ ] ✅ POST /auth/login trả về JWT token
- [ ] ✅ GET /auth/profile yêu cầu token
- [ ] ✅ POST /orders/create yêu cầu token + wallet
- [ ] ✅ Order được ghi lên blockchain
- [ ] ✅ Unauthorized request bị reject

### Frontend:
- [ ] ✅ Server chạy trên port 3000
- [ ] ✅ Login page hoạt động
- [ ] ✅ Register page hoạt động
- [ ] ✅ Profile page hiển thị user info
- [ ] ✅ Navbar hiển thị auth links
- [ ] ✅ Checkout yêu cầu login
- [ ] ✅ Order creation thành công
- [ ] ✅ Admin dashboard chỉ admin truy cập được

### Blockchain:
- [ ] ✅ Hardhat node chạy trên port 8545
- [ ] ✅ Smart contract deployed
- [ ] ✅ Orders được lưu trên blockchain
- [ ] ✅ Buyer address được ghi nhận
- [ ] ✅ Data hash được tạo và verify

### Security:
- [ ] ✅ Password được hash (bcrypt)
- [ ] ✅ JWT token expires sau 7 ngày
- [ ] ✅ Protected routes yêu cầu auth
- [ ] ✅ Wallet validation trước order
- [ ] ✅ Admin role được enforce

---

## 🎯 KẾT LUẬN

Nếu tất cả checklist trên đều PASS:
## 🎉 HỆ THỐNG HOẠT ĐỘNG HOÀN HẢO! 🎉

**Access URLs**:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Blockchain: http://127.0.0.1:8545

**Demo Accounts**:
- Admin: admin@example.com / admin123
- User: user@example.com / user123
- User (no wallet): user2@example.com / user456

---

**Made with ❤️ - E-commerce Blockchain System Complete! 🚀**
