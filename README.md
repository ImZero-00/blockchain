# 🔗 E-commerce Blockchain Platform

> **Full-stack blockchain-based e-commerce với JWT authentication, role-based access control, và smart contract integration.**

![Status](https://img.shields.io/badge/Status-Complete-success)
![Auth](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-orange)
![Blockchain](https://img.shields.io/badge/Blockchain-Solidity%20%2B%20Hardhat-purple)

---

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Tính năng mới](#-tính-năng-mới---authentication-system)
- [Tech Stack](#tech-stack)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Cài đặt và Chạy dự án](#cài-đặt-và-chạy-dự-án)
- [Tài khoản demo](#-tài-khoản-demo)
- [Demo Flow](#demo-flow)
- [API Documentation](#api-documentation)
- [Smart Contract](#smart-contract)
- [Testing](#-testing)
- [Documentation](#-documentation)

---
#fix lỗi ko chạy scripts: Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
## 🎯 Tổng quan

Hệ thống e-commerce blockchain hoàn chỉnh với các tính năng:

### Core Features:
- ✅ **Tạo đơn hàng** và ghi giao dịch lên **Blockchain**
- ✅ **Xác minh đơn hàng** bằng cách so sánh dữ liệu On-Chain và Off-Chain
- ✅ **Data Hashing** - SHA256 hash của order data trên blockchain
- ✅ **Buyer Address** - Lưu địa chỉ ví người mua
- ✅ Đảm bảo tính **minh bạch** và **không thể chỉnh sửa** của giao dịch
- ✅ Lưu trữ **dữ liệu bổ sung** (tên khách hàng, sản phẩm) trong Database off-chain

### 🆕 Authentication & Authorization:
- ✅ **JWT-based Authentication** - Token expires sau 7 ngày
- ✅ **Password Hashing** - Bcrypt với salt rounds 10
- ✅ **Role-based Access Control** - Admin và User roles
- ✅ **Protected Routes** - Middleware cho API và frontend
- ✅ **Wallet Requirement** - Yêu cầu khai báo wallet trước khi đặt hàng
- ✅ **Admin Dashboard** - Quản lý orders với role protection
- ✅ **Profile Management** - User profile với wallet integration

---

## 🔐 Tính năng mới - Authentication System

### 1. User Authentication
- **Register**: Đăng ký tài khoản với email, password, fullName
- **Login**: Đăng nhập nhận JWT token
- **Profile**: Xem và cập nhật thông tin user
- **Wallet Management**: Khai báo địa chỉ ví Ethereum

### 2. Role-based Access Control
- **Admin Role**: Truy cập admin dashboard, quản lý tất cả orders
- **User Role**: Tạo orders, xem profile của mình
- **Protected Routes**: Middleware kiểm tra token và role

### 3. Order Authorization
- ✅ Yêu cầu login trước khi đặt hàng
- ✅ Yêu cầu khai báo wallet trước khi tạo order
- ✅ Order được link với userId
- ✅ Buyer address được ghi vào blockchain

### 4. Security Features
- ✅ Password hashing với bcrypt
- ✅ JWT token signing và verification
- ✅ Wallet address validation (Ethereum format)
- ✅ Protected API endpoints
- ✅ Frontend auth state management với Zustand

---

## 🛠 Tech Stack

### **Blockchain**
- **Smart Contract:** Solidity 0.8.20
- **Development Framework:** Hardhat
- **Blockchain:** Hardhat Local Node (hoặc Ganache)

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Blockchain Library:** Ethers.js v6
- **Database:** SQLite
- **ORM:** Prisma

### **Frontend**
- **Library:** React 18
- **Build Tool:** Vite
- **Router:** React Router v6
- **HTTP Client:** Axios

---

## 📁 Cấu trúc dự án

```
Blockchain/
│
├── blockchain/                 # Smart Contract & Hardhat
│   ├── contracts/
│   │   └── OrderValidation.sol    # Smart contract chính
│   ├── scripts/
│   │   └── deploy.js              # Script deploy contract
│   ├── test/
│   │   └── OrderValidation.test.js # Unit tests
│   ├── hardhat.config.js
│   └── package.json
│
├── backend/                    # Backend API
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── orderController.js
│   │   │   ├── productController.js
│   │   │   └── blockchainController.js
│   │   ├── routes/
│   │   │   ├── orderRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   └── blockchainRoutes.js
│   │   ├── services/
│   │   │   └── blockchainService.js
│   │   ├── db/
│   │   │   └── prisma.js
│   │   ├── index.js               # Entry point
│   │   └── seed.js                # Seed dữ liệu mẫu
│   ├── prisma/
│   │   └── schema.prisma
│   ├── .env.example
│   └── package.json
│
└── frontend/                   # React Frontend
    ├── src/
    │   ├── api/
    │   │   └── api.js             # API service
    │   ├── components/
    │   │   ├── Navbar.jsx
    │   │   └── ProductCard.jsx
    │   ├── pages/
    │   │   ├── ProductListPage.jsx
    │   │   ├── CheckoutPage.jsx
    │   │   └── VerifyOrderPage.jsx
    │   ├── App.jsx
    │   ├── App.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## 🚀 Cài đặt và Chạy dự án

### **📋 Yêu cầu hệ thống**

- Node.js >= 18.x
- npm hoặc yarn

### **⚙️ Bước 1: Clone/Download dự án**

```powershell
cd "c:\Users\Admin\Documents\Blockchain"
```

---

### **🔗 Bước 2: Cài đặt và Chạy BLOCKCHAIN**

```powershell
# Di chuyển vào thư mục blockchain
cd blockchain

# Cài đặt dependencies
npm install

# Compile smart contract
npx hardhat compile

# (Optional) Chạy unit tests
npx hardhat test

# Chạy Hardhat local node (Terminal 1 - giữ terminal này mở)
npx hardhat node
```

**✅ Blockchain node đang chạy tại:** `http://127.0.0.1:8545`

**📝 Lưu ý:** Giữ terminal này mở. Hardhat node sẽ cung cấp 20 accounts với 10000 ETH mỗi account.

---

### **🚀 Bước 3: Deploy Smart Contract**

**Mở terminal mới (Terminal 2):**

```powershell
cd blockchain

# Deploy contract lên Hardhat local node
npx hardhat run scripts/deploy.js --network localhost
```

**✅ Kết quả:**
```
✅ Deploy thành công!
   Contract Address: 0x5FbDB2315678afecb367f032d93F642f64180aa3
   Network: localhost
   Chain ID: 1337
```

**📝 Lưu lại `Contract Address` này!**

File `blockchain/deployed-address.json` sẽ được tạo tự động với thông tin contract.

---

### **💾 Bước 4: Cài đặt và Chạy BACKEND**

**Mở terminal mới (Terminal 3):**

```powershell
cd backend

# Cài đặt dependencies
npm install

# Copy file .env.example thành .env
Copy-Item .env.example .env

# Mở file .env và cập nhật CONTRACT_ADDRESS
# Paste địa chỉ contract vừa deploy ở bước 3
notepad .env
```

**Cập nhật file `.env`:**
```env
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3  # <-- Thay bằng địa chỉ contract của bạn
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
PORT=5000
DATABASE_URL="file:./dev.db"
```

**📝 PRIVATE_KEY:** Đây là private key của Account #0 từ Hardhat node (có sẵn khi chạy `npx hardhat node`).

**Tiếp tục setup database:**

```powershell
# Generate Prisma Client
npx prisma generate

# Tạo database và tables
npx prisma migrate dev --name init

# Seed dữ liệu mẫu (6 sản phẩm)
node src/seed.js

# Chạy Backend server
npm start
```

**✅ Backend đang chạy tại:** `http://localhost:5000`

---

### **🎨 Bước 5: Cài đặt và Chạy FRONTEND**

**Mở terminal mới (Terminal 4):**

```powershell
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

**✅ Frontend đang chạy tại:** `http://localhost:3000`

Trình duyệt sẽ tự động mở trang web.

---

## 🎬 Demo Flow

### **1️⃣ Xem danh sách sản phẩm**

- Truy cập `http://localhost:3000`
- Xem danh sách 6 sản phẩm mẫu (Laptop, iPhone, Samsung, MacBook, Tai nghe, iPad)

### **2️⃣ Đặt hàng**

1. Click vào nút **"🛒 Đặt hàng"** trên sản phẩm bạn muốn
2. Nhập **Tên khách hàng**
3. Chọn **Số lượng**
4. Xem **Tóm tắt đơn hàng** (tổng tiền tự động tính)
5. Click **"🔗 Ghi giao dịch lên Blockchain"**

### **3️⃣ Xem kết quả**

Sau khi đặt hàng thành công, bạn sẽ thấy:

- ✅ **Thông tin đơn hàng:** Order ID, Khách hàng, Sản phẩm, Số lượng, Tổng tiền
- 🔗 **Thông tin Blockchain:**
  - Transaction Hash
  - Block Number
  - Buyer Address (địa chỉ ví đã ký giao dịch)

### **4️⃣ Xác minh đơn hàng**

1. Click vào nút **"🔍 Xác minh đơn hàng"**
2. Nhập **Order ID** (ví dụ: `ORDER_1700123456789_123`)
3. Click **"🔎 Xác minh"**

**Kết quả hiển thị:**

- ✅ **Tồn tại trên Blockchain** (dữ liệu on-chain)
- ✅ **Tồn tại trong Database** (dữ liệu off-chain)
- ✅ **Dữ liệu khớp** (so sánh amount, buyer address)

---

## 📡 API Documentation

### **Base URL:** `http://localhost:5000`

### **1. Products API**

#### **GET /products**
Lấy danh sách tất cả sản phẩm.

**Response:**
```json
{
  "success": true,
  "count": 6,
  "data": [
    {
      "id": 1,
      "productId": "PROD_001",
      "name": "Laptop Dell XPS 13",
      "price": "0.5",
      "stock": 10
    }
  ]
}
```

---

### **2. Orders API**

#### **POST /orders/create**
Tạo đơn hàng mới và ghi lên blockchain.

**Request Body:**
```json
{
  "orderId": "ORDER_1700123456789_123",
  "productId": "PROD_001",
  "customerName": "Nguyen Van A",
  "quantity": 2,
  "price": "0.5"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đơn hàng đã được tạo và ghi lên blockchain",
  "data": {
    "orderId": "ORDER_1700123456789_123",
    "transactionHash": "0xabc123...",
    "blockNumber": 5,
    "amountInEth": "1.0"
  }
}
```

#### **GET /orders/verify/:orderId**
Xác minh đơn hàng từ blockchain và so sánh với database.

**Response:**
```json
{
  "success": true,
  "existsOnChain": true,
  "existsInDatabase": true,
  "isMatched": true,
  "onChainData": {
    "orderId": "ORDER_1700123456789_123",
    "buyer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "amount": "1000000000000000000",
    "amountInEth": "1.0",
    "timestamp": 1700123456
  },
  "offChainData": {
    "orderId": "ORDER_1700123456789_123",
    "customerName": "Nguyen Van A",
    "productName": "Laptop Dell XPS 13",
    "transactionHash": "0xabc123..."
  }
}
```

---

### **3. Blockchain API**

#### **GET /blockchain/info**
Lấy thông tin blockchain network.

**Response:**
```json
{
  "success": true,
  "data": {
    "network": {
      "name": "unknown",
      "chainId": "1337",
      "blockNumber": 10
    },
    "contractAddress": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
    "totalOrdersOnChain": 5
  }
}
```

---

## 📜 Smart Contract

### **OrderValidation.sol**

**Chức năng chính:**

#### **1. createOrder(string orderId, uint256 amount)**
- Tạo đơn hàng mới trên blockchain
- Kiểm tra orderId không trùng lặp
- Lưu thông tin: orderId, buyer address, amount, timestamp
- Emit event `OrderCreated`

#### **2. verifyOrder(string orderId)**
- Xác minh và trả về thông tin đơn hàng
- Emit event `OrderVerified`

#### **3. getOrder(string orderId)**
- Lấy thông tin đơn hàng (view function, không tốn gas)

#### **4. checkOrderExists(string orderId)**
- Kiểm tra order có tồn tại hay không

**Struct Order:**
```solidity
struct Order {
    string orderId;
    address buyer;
    uint256 amount;
    uint256 timestamp;
    bool exists;
}
```

---

## 🧪 Testing

### **Test Smart Contract**

```powershell
cd blockchain
npx hardhat test
```

**Kết quả:**
```
  OrderValidation Contract
    Deployment
      ✔ Nên set đúng owner
      ✔ Nên khởi tạo totalOrders = 0
    Create Order
      ✔ Nên tạo đơn hàng thành công
      ✔ Nên revert nếu orderId rỗng
      ✔ Nên revert nếu amount = 0
      ✔ Nên revert nếu orderId đã tồn tại
    ...

  18 passing (2s)
```

---

## 🔒 Bảo mật

**⚠️ LƯU Ý: Đây là dự án DEMO, không sử dụng trong production:**

- Private key được lưu trong `.env` (không an toàn cho production)
- Không có authentication/authorization
- Không có rate limiting
- SQLite database (chỉ dùng cho demo)

**Cho production cần:**
- Sử dụng hardware wallet hoặc key management service
- Implement JWT authentication
- Rate limiting & DDoS protection
- PostgreSQL/MySQL database
- HTTPS
- Input validation & sanitization

---

## 🎯 Tính năng nâng cấp (Roadmap)

- [x] **Hash dữ liệu:** Hash toàn bộ order data trước khi ghi lên blockchain ✅
- [x] **MetaMask Integration UI:** Kết nối ví MetaMask từ frontend ✅
- [x] **Hash Verification:** Xác minh tính toàn vẹn dữ liệu qua hash ✅
- [ ] **MetaMask Transaction Signing:** Ký giao dịch trực tiếp bằng MetaMask
- [ ] **IPFS Storage:** Lưu order details lên IPFS, chỉ lưu CID trên blockchain
- [ ] **Multi-signature:** Yêu cầu xác nhận từ nhiều bên
- [ ] **Event Listener:** Backend tự động lắng nghe events từ blockchain
- [ ] **Order History:** Xem lịch sử tất cả đơn hàng của một địa chỉ
- [ ] **Admin Dashboard:** Quản lý orders, products, blockchain info

**📝 Xem chi tiết tại:** [UPGRADE_GUIDE.md](UPGRADE_GUIDE.md)

---

## 📝 Troubleshooting

### **❌ Backend không kết nối được blockchain**

```
Kiểm tra:
1. Hardhat node có đang chạy không? (Terminal 1)
2. CONTRACT_ADDRESS trong .env có đúng không?
3. BLOCKCHAIN_RPC_URL = http://127.0.0.1:8545
```

### **❌ Frontend không gọi được API**

```
Kiểm tra:
1. Backend có đang chạy không? (Terminal 3)
2. Port 5000 có bị chiếm không?
3. CORS đã được enable trong backend
```

### **❌ Transaction failed**

```
Kiểm tra:
1. Account có đủ ETH không?
2. OrderId có bị trùng không?
3. Amount > 0?
```

---

## 👨‍💻 Tác giả

Dự án demo được tạo bởi GitHub Copilot để minh họa cách áp dụng Blockchain vào E-commerce.

---

## 📄 License

MIT License - Tự do sử dụng cho mục đích học tập và nghiên cứu.

---

## 🎉 Kết luận

Bạn đã hoàn thành việc setup và chạy thành công hệ thống E-commerce Blockchain demo!

**🔗 Các URL quan trọng:**

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Blockchain RPC: `http://127.0.0.1:8545`
- Prisma Studio: `npx prisma studio` → `http://localhost:5555`

**📚 Để hiểu rõ hơn về dự án:**

1. Đọc code trong `blockchain/contracts/OrderValidation.sol`
2. Xem API endpoints trong `backend/src/routes/`
3. Xem UI flow trong `frontend/src/pages/`

**Happy Coding! 🚀**
