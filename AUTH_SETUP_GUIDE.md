# 🔐 HƯỚNG DẪN CẬP NHẬT DỰ ÁN VỚI AUTHENTICATION

## ✅ ĐÃ CẬP NHẬT

### **1. Smart Contract**
- ✅ Thêm tham số `_buyer` vào `createOrder()`
- ✅ Sử dụng buyer address từ database thay vì msg.sender

### **2. Prisma Schema**
- ✅ Thêm model `User` với:
  - email, password (hashed), fullName
  - role: "user" hoặc "admin"
  - walletAddress (nullable)
- ✅ Thêm quan hệ User → Orders (1-n)
- ✅ Order có thêm userId (FK)

### **3. Backend - Authentication**
- ✅ JWT authentication
- ✅ bcrypt password hashing
- ✅ Middleware: authMiddleware, roleMiddleware
- ✅ Auth Controller: register, login, getProfile, updateWallet
- ✅ Auth Routes: /auth/register, /auth/login, /auth/profile, /users/wallet

### **4. Backend - Order Updates**
- ✅ Yêu cầu authentication cho createOrder
- ✅ Kiểm tra user phải có walletAddress trước khi đặt hàng
- ✅ Lưu userId vào Order

---

## 🚀 HƯỚNG DẪN CÀI ĐẶT

### **Bước 1: Cài đặt dependencies mới**

```powershell
cd backend
npm install bcrypt jsonwebtoken
```

### **Bước 2: Cập nhật .env**

```powershell
# Copy .env.example và thêm JWT_SECRET
Copy-Item .env.example .env
notepad .env
```

Thêm vào `.env`:
```
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
JWT_EXPIRES_IN=7d
```

### **Bước 3: Reset Database với schema mới**

```powershell
cd backend

# Xóa database cũ
Remove-Item dev.db -ErrorAction SilentlyContinue
Remove-Item dev.db-journal -ErrorAction SilentlyContinue

# Tạo migration mới
npx prisma migrate dev --name add-auth

# Generate Prisma Client
npx prisma generate
```

### **Bước 4: Seed dữ liệu (có user admin)**

Tạo file `backend/src/seedWithAuth.js`:

```javascript
import prisma from './db/prisma.js';
import { hashPassword } from './utils/password.js';

async function main() {
  console.log('🌱 Bắt đầu seed dữ liệu...\n');

  // Xóa dữ liệu cũ
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  // Tạo Admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      password: adminPassword,
      fullName: 'Administrator',
      role: 'admin',
      walletAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266' // Account #0 từ Hardhat
    }
  });
  console.log('✅ Admin user created:', admin.email);

  // Tạo User thường
  const userPassword = await hashPassword('user123');
  const user = await prisma.user.create({
    data: {
      email: 'user@example.com',
      password: userPassword,
      fullName: 'Nguyễn Văn A',
      role: 'user',
      walletAddress: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' // Account #1 từ Hardhat
    }
  });
  console.log('✅ User created:', user.email);

  // Tạo sản phẩm
  const products = [
    {
      productId: 'PROD_001',
      name: 'Laptop Dell XPS 13',
      description: 'Laptop cao cấp, màn hình 13 inch',
      price: '0.5',
      image: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400',
      stock: 10
    },
    {
      productId: 'PROD_002',
      name: 'iPhone 15 Pro Max',
      description: 'Smartphone flagship của Apple',
      price: '0.8',
      image: 'https://images.unsplash.com/photo-1592286927505-2fd0cef75eba?w=400',
      stock: 15
    }
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
    console.log(`✅ Product: ${product.name}`);
  }

  console.log('\n✨ Seed hoàn tất!');
  console.log('\n📋 Thông tin đăng nhập:');
  console.log('Admin: admin@example.com / admin123');
  console.log('User:  user@example.com / user123');
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

Chạy seed:
```powershell
node src/seedWithAuth.js
```

### **Bước 5: Compile và Deploy Smart Contract mới**

```powershell
cd blockchain
npx hardhat compile
npx hardhat node  # Terminal mới
npx hardhat run scripts/deploy.js --network localhost
```

### **Bước 6: Cập nhật Blockchain Service**

File `backend/src/services/blockchainService.js` cần update:

```javascript
// Thêm buyer address vào createOrder
async createOrder(orderId, amount, orderData, buyerAddress) {
  // ...existing code...
  const dataHash = this.createOrderDataHash(orderData);
  
  // Gọi contract với buyer address
  const tx = await this.contract.createOrder(
    orderId, 
    amountInWei, 
    dataHash, 
    buyerAddress  // ✅ THÊM THAM SỐ NÀY
  );
  // ...
}
```

File `backend/src/controllers/orderController.js`:

```javascript
// Trong createOrder controller, truyền user.walletAddress
const blockchainResult = await blockchainService.createOrder(
  orderId, 
  totalAmountString, 
  orderData,
  user.walletAddress  // ✅ THÊM THAM SỐ NÀY
);

// Lưu database với userId
const order = await prisma.order.create({
  data: {
    orderId,
    userId: user.id,  // ✅ THÊM FIELD NÀY
    productId,
    // ...
  }
});
```

### **Bước 7: Cập nhật Routes để yêu cầu Auth**

File `backend/src/routes/orderRoutes.js`:

```javascript
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware.js';

// Bảo vệ routes với authentication
router.post('/create', authMiddleware, createOrder);
router.get('/verify/:orderId', verifyOrder);  // Public
router.get('/', authMiddleware, getAllOrders);
router.get('/admin/list', authMiddleware, roleMiddleware('admin'), adminGetAllOrders);
```

### **Bước 8: Cập nhật index.js**

```javascript
import authRoutes from './routes/authRoutes.js';

// Thêm auth routes
app.use('/auth', authRoutes);
app.use('/users', authRoutes);  // Cho /users/wallet
```

### **Bước 9: Chạy Backend**

```powershell
cd backend
npm start
```

---

## 🧪 TEST API

### **1. Register**
```bash
POST http://localhost:5000/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123",
  "fullName": "Test User"
}
```

### **2. Login**
```bash
POST http://localhost:5000/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "test123"
}
```

Response trả về `token`.

### **3. Get Profile**
```bash
GET http://localhost:5000/auth/profile
Authorization: Bearer <YOUR_TOKEN>
```

### **4. Update Wallet**
```bash
PUT http://localhost:5000/users/wallet
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json

{
  "walletAddress": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"
}
```

### **5. Create Order (cần có wallet)**
```bash
POST http://localhost:5000/orders/create
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json

{
  "orderId": "ORDER_123",
  "productId": "PROD_001",
  "quantity": 1,
  "price": "0.5"
}
```

---

## 📱 FRONTEND CẦN CẬP NHẬT

### **Cần tạo thêm:**

1. **Auth Store (Zustand)**
   - Lưu token, user info
   - Login/logout functions

2. **Pages mới:**
   - `LoginPage.jsx`
   - `RegisterPage.jsx`
   - `UpdateWalletPage.jsx`
   - `AdminDashboard.jsx`

3. **Protected Routes:**
   - Redirect nếu chưa login
   - Redirect nếu chưa có wallet (khi vào Checkout)

4. **API Service:**
   - Thêm Authorization header
   - Auth endpoints

---

## 📝 LƯU Ý

- **Admin account:** admin@example.com / admin123
- **User account:** user@example.com / user123
- **Wallet addresses:** Lấy từ Hardhat node (Account #0, #1, #2...)
- **JWT Secret:** Đổi trong production
- **Password:** Tối thiểu 6 ký tự

---

**🎉 Authentication đã được tích hợp thành công!**

Dự án hiện có đầy đủ:
- ✅ Đăng ký/Đăng nhập
- ✅ JWT Authentication
- ✅ Role-based access (admin/user)
- ✅ Yêu cầu khai báo ví trước khi đặt hàng
- ✅ Protected API endpoints
