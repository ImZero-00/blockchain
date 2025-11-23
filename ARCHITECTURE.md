# 📚 Tài liệu Kiến trúc và Luồng hoạt động Hệ thống

## 🎯 Tổng quan Hệ thống

### Mô hình kiến trúc
```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                    React + Vite + Zustand                        │
│                     http://localhost:3000                        │
└─────────────────┬───────────────────────────────────────────────┘
                  │ HTTP/HTTPS (REST API)
                  │ JSON Web Token (JWT) Authentication
                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                            │
│              Node.js + Express + Prisma ORM                      │
│                     http://localhost:5000                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Controllers  │  │   Services   │  │     Auth     │          │
│  │   (HTTP)     │──│  (Business)  │──│     JWT      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────┬───────────────────────────┬───────────────────┘
                  │                           │
                  │ Prisma Client             │ ethers.js
                  ▼                           ▼
┌─────────────────────────────┐  ┌──────────────────────────────┐
│     SQLite Database         │  │   Hardhat Local Node         │
│   (Prisma Schema)           │  │    http://127.0.0.1:8545     │
│   - Users                   │  │                              │
│   - Orders                  │  │  ┌────────────────────────┐  │
│   - Products                │  │  │  OrderValidation.sol   │  │
│                             │  │  │  Smart Contract        │  │
│                             │  │  └────────────────────────┘  │
└─────────────────────────────┘  └──────────────────────────────┘
```

---

## 🛠️ Stack Công nghệ

### Frontend
- **React 18.3.1**: UI Framework
- **Vite 5.4.10**: Build tool & Dev server
- **React Router 6.27.0**: Client-side routing
- **Zustand 5.0.2**: State management (thay thế Redux)
- **Axios**: HTTP client cho API calls
- **CSS Modules**: Component-scoped styling

### Backend
- **Node.js 20+**: Runtime environment
- **Express 4.21.1**: Web framework
- **Prisma 5.22.0**: ORM & Database toolkit
- **SQLite**: Database (development)
- **bcrypt 5.1.1**: Password hashing
- **jsonwebtoken 9.0.2**: JWT authentication
- **ethers.js 6.13.4**: Blockchain interaction library
- **dotenv**: Environment variables management

### Blockchain
- **Hardhat 2.22.16**: Ethereum development environment
- **Solidity 0.8.20**: Smart contract language
- **@nomicfoundation/hardhat-ethers**: Hardhat + ethers.js integration
- **Local Node**: Development blockchain (Chain ID: 1337)

---

## 📁 Cấu trúc thư mục chi tiết

### Frontend Structure
```
frontend/
├── src/
│   ├── api/
│   │   └── api.js                    # Axios instance + API functions
│   ├── components/
│   │   ├── Navbar.jsx                # Navigation bar với auth state
│   │   ├── ProductCard.jsx           # Card hiển thị sản phẩm
│   │   └── MetaMaskButton.jsx        # [DEPRECATED] - Không dùng nữa
│   ├── pages/
│   │   ├── HomePage.jsx              # Danh sách sản phẩm
│   │   ├── LoginPage.jsx             # Form đăng nhập
│   │   ├── RegisterPage.jsx          # Form đăng ký
│   │   ├── ProfilePage.jsx           # Profile + Wallet management
│   │   ├── CheckoutPage.jsx          # Trang đặt hàng
│   │   └── OrdersPage.jsx            # Lịch sử đơn hàng
│   ├── store/
│   │   └── authStore.js              # Zustand store (user, token, auth)
│   ├── hooks/
│   │   └── useMetaMask.js            # [DEPRECATED] - Không dùng nữa
│   ├── App.jsx                       # Root component + Router setup
│   ├── main.jsx                      # Entry point
│   └── index.css                     # Global styles
├── public/
├── package.json
└── vite.config.js
```

### Backend Structure
```
backend/
├── src/
│   ├── controllers/
│   │   ├── authController.js         # Login, Register, Profile
│   │   ├── orderController.js        # Create, List, Verify orders
│   │   └── productController.js      # List products
│   ├── services/
│   │   └── blockchainService.js      # Blockchain interactions
│   ├── middleware/
│   │   └── authMiddleware.js         # JWT verification
│   ├── config/
│   │   └── database.js               # Prisma client instance
│   └── index.js                      # Express app + Routes
├── prisma/
│   ├── schema.prisma                 # Database schema
│   ├── seed.js                       # Sample data
│   └── dev.db                        # SQLite database file
├── .env                              # Environment variables
├── package.json
└── README.md
```

### Blockchain Structure
```
blockchain/
├── contracts/
│   └── OrderValidation.sol           # Smart contract
├── scripts/
│   └── deploy.js                     # Deployment script
├── test/
│   └── OrderValidation.test.js       # Contract tests
├── artifacts/                        # Compiled contracts (auto-generated)
├── cache/                            # Hardhat cache (auto-generated)
├── deployed-address.json             # Contract address sau deploy
├── hardhat.config.js                 # Hardhat configuration
└── package.json
```

---

## 🔄 Luồng hoạt động chi tiết

### 1️⃣ LUỒNG ĐĂNG KÝ (Register Flow)

```
┌──────────────┐
│   Browser    │
│ RegisterPage │
└──────┬───────┘
       │ 1. User nhập: email, password, fullName, address, phone
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: RegisterPage.jsx                                   │
│ ------------------------------------------------------------ │
│ const handleRegister = async (e) => {                       │
│   e.preventDefault()                                         │
│   const response = await register(formData)  // Call API    │
│   navigate('/login')                                        │
│ }                                                            │
└──────┬──────────────────────────────────────────────────────┘
       │ 2. POST /auth/register
       │    Body: { email, password, fullName, address, phone }
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: authController.js -> register()                    │
│ ------------------------------------------------------------ │
│ 1. Validate input (email format, password length)           │
│ 2. Check email exists: prisma.user.findUnique()            │
│ 3. Hash password: bcrypt.hash(password, 10)                │
│ 4. Create user: prisma.user.create()                       │
│ 5. Return: { message, userId, email }                      │
└──────┬──────────────────────────────────────────────────────┘
       │ 3. Response: 201 Created
       │    { message: "Đăng ký thành công", userId, email }
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: Redirect to /login                                 │
└─────────────────────────────────────────────────────────────┘
```

**Files tham gia:**
- `frontend/src/pages/RegisterPage.jsx` - UI form
- `frontend/src/api/api.js` - API call `register()`
- `backend/src/controllers/authController.js` - Logic xử lý
- `backend/prisma/schema.prisma` - User model definition
- SQLite Database - Lưu user mới

---

### 2️⃣ LUỒNG ĐĂNG NHẬP (Login Flow)

```
┌──────────────┐
│   Browser    │
│  LoginPage   │
└──────┬───────┘
       │ 1. User nhập: email, password
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: LoginPage.jsx                                      │
│ ------------------------------------------------------------ │
│ const handleLogin = async (e) => {                          │
│   const { token, user } = await login(email, password)      │
│   setAuth(user, token)  // Save to Zustand store           │
│   navigate('/')                                             │
│ }                                                            │
└──────┬──────────────────────────────────────────────────────┘
       │ 2. POST /auth/login
       │    Body: { email, password }
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: authController.js -> login()                       │
│ ------------------------------------------------------------ │
│ 1. Find user: prisma.user.findUnique({ email })            │
│ 2. Verify password: bcrypt.compare(password, user.password)│
│ 3. Generate JWT: jwt.sign({ userId, email }, SECRET, {...})│
│ 4. Return: { token, user: {...} }                          │
└──────┬──────────────────────────────────────────────────────┘
       │ 3. Response: 200 OK
       │    { token: "eyJhbGc...", user: {...} }
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: Zustand Store (authStore.js)                      │
│ ------------------------------------------------------------ │
│ setAuth: (user, token) => {                                 │
│   set({ user, token, isAuthenticated: true })              │
│   localStorage.setItem('token', token)                      │
│   localStorage.setItem('user', JSON.stringify(user))        │
│ }                                                            │
└──────┬──────────────────────────────────────────────────────┘
       │ 4. Token được lưu trong:
       │    - Zustand store (RAM)
       │    - localStorage (Persistent)
       │    - Axios default headers
       ▼
┌─────────────────────────────────────────────────────────────┐
│ All subsequent API calls include:                           │
│ Authorization: Bearer eyJhbGc...                            │
└─────────────────────────────────────────────────────────────┘
```

**Files tham gia:**
- `frontend/src/pages/LoginPage.jsx`
- `frontend/src/api/api.js`
- `frontend/src/store/authStore.js`
- `backend/src/controllers/authController.js`
- `backend/src/middleware/authMiddleware.js`

---

### 3️⃣ LUỒNG THÊM ĐỊA CHỈ VÍ (Add Wallet Flow)

```
┌──────────────┐
│   Browser    │
│ ProfilePage  │
└──────┬───────┘
       │ 1. User nhập: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
       │    Validation: /^0x[a-fA-F0-9]{40}$/
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: ProfilePage.jsx                                    │
│ ------------------------------------------------------------ │
│ const handleSaveWallet = async () => {                      │
│   if (!/^0x[a-fA-F0-9]{40}$/.test(walletInput)) {          │
│     setError('Địa chỉ ví không hợp lệ')                    │
│     return                                                   │
│   }                                                          │
│   await updateWallet(walletInput)  // Call API              │
│   setAuth({ ...user, walletAddress: walletInput })         │
│ }                                                            │
└──────┬──────────────────────────────────────────────────────┘
       │ 2. PUT /auth/wallet
       │    Headers: { Authorization: Bearer <token> }
       │    Body: { walletAddress: "0x7099..." }
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: authMiddleware.js -> authMiddleware()              │
│ ------------------------------------------------------------ │
│ 1. Extract token from headers                               │
│ 2. Verify JWT: jwt.verify(token, SECRET)                   │
│ 3. Attach userId to req.user                                │
│ 4. Next() -> authController.updateWallet()                  │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: authController.js -> updateWallet()                │
│ ------------------------------------------------------------ │
│ 1. Get userId from req.user (from middleware)               │
│ 2. Update: prisma.user.update({                            │
│      where: { id: userId },                                 │
│      data: { walletAddress }                                │
│    })                                                        │
│ 3. Return: { message, walletAddress }                      │
└──────┬──────────────────────────────────────────────────────┘
       │ 3. Response: 200 OK
       │    { message: "Đã cập nhật địa chỉ ví", walletAddress }
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: Update Zustand store                              │
│ - user.walletAddress được cập nhật                          │
│ - UI hiển thị địa chỉ ví mới                                │
└─────────────────────────────────────────────────────────────┘
```

**Files tham gia:**
- `frontend/src/pages/ProfilePage.jsx`
- `frontend/src/api/api.js`
- `frontend/src/store/authStore.js`
- `backend/src/middleware/authMiddleware.js`
- `backend/src/controllers/authController.js`

---

### 4️⃣ LUỒNG TẠO ĐỜN HÀNG (Create Order Flow) - PHỨC TẠP NHẤT

```
┌──────────────┐
│   Browser    │
│CheckoutPage  │
└──────┬───────┘
       │ 1. User chọn sản phẩm, số lượng
       │    Click "Đặt hàng"
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: CheckoutPage.jsx                                   │
│ ------------------------------------------------------------ │
│ const handleCheckout = async () => {                        │
│   if (!user.walletAddress) {                                │
│     alert('Vui lòng khai báo địa chỉ ví!')                 │
│     return                                                   │
│   }                                                          │
│   const orderData = {                                       │
│     productId, productName, quantity, amount                │
│   }                                                          │
│   const result = await createOrder(orderData)               │
│   // Hiển thị transaction hash & status                     │
│ }                                                            │
└──────┬──────────────────────────────────────────────────────┘
       │ 2. POST /orders/create
       │    Headers: { Authorization: Bearer <token> }
       │    Body: { productId, productName, quantity, amount }
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: authMiddleware.js                                  │
│ ------------------------------------------------------------ │
│ 1. Verify JWT token                                         │
│ 2. Attach userId to req.user                                │
│ 3. Next() -> orderController.createOrder()                  │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: orderController.js -> createOrder()                │
│ ------------------------------------------------------------ │
│ Step 1: Validate & Get User                                 │
│   - Get userId from req.user                                │
│   - Fetch user: prisma.user.findUnique({ id: userId })     │
│   - Check user.walletAddress exists                         │
│                                                              │
│ Step 2: Create Order ID                                     │
│   - orderId = `ORDER_${Date.now()}_${Math.random()}`       │
│   - Convert amount to Wei: parseEther(amount)              │
│                                                              │
│ Step 3: Call Blockchain Service                             │
│   - blockchainService.createOrderOnBlockchain({             │
│       orderId, productId, quantity, amountWei,              │
│       buyerAddress: user.walletAddress                      │
│     })                                                       │
└──────┬──────────────────────────────────────────────────────┘
       │ 3. Call blockchainService
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: blockchainService.js                               │
│ ------------------------------------------------------------ │
│ Step 1: Initialize Contract                                 │
│   - provider = new JsonRpcProvider('http://127.0.0.1:8545')│
│   - wallet = new Wallet(PRIVATE_KEY, provider)             │
│   - contract = new Contract(CONTRACT_ADDRESS, ABI, wallet) │
│                                                              │
│ Step 2: Create Data Hash                                    │
│   - dataHash = createOrderDataHash({                        │
│       orderId, productId, quantity, amount, buyerAddress    │
│     })                                                       │
│   - Using: ethers.keccak256(ethers.toUtf8Bytes(...))      │
│                                                              │
│ Step 3: Send Transaction to Blockchain                      │
│   - tx = await contract.createOrder(                        │
│       orderId, dataHash, buyerAddress, amountWei            │
│     )                                                        │
│   - receipt = await tx.wait()  // Wait for confirmation    │
│                                                              │
│ Step 4: Return Blockchain Info                              │
│   - return {                                                 │
│       transactionHash: receipt.hash,                        │
│       blockNumber: receipt.blockNumber,                     │
│       dataHash                                              │
│     }                                                        │
└──────┬──────────────────────────────────────────────────────┘
       │ 4. Transaction sent to Hardhat Node
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Hardhat Node: http://127.0.0.1:8545                         │
│ ------------------------------------------------------------ │
│ 1. Receive transaction from backend                         │
│ 2. Execute OrderValidation.createOrder() function           │
│ 3. Update contract state:                                   │
│    - orders[orderId] = Order struct                         │
│    - orderIds.push(orderId)                                 │
│    - buyerOrders[buyer].push(orderId)                       │
│ 4. Mine block (instant in dev mode)                         │
│ 5. Emit OrderCreated event                                  │
│ 6. Return transaction receipt                               │
└──────┬──────────────────────────────────────────────────────┘
       │ 5. Transaction confirmed
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: orderController.js (continued)                     │
│ ------------------------------------------------------------ │
│ Step 4: Save to Database                                    │
│   - order = await prisma.order.create({                     │
│       data: {                                                │
│         orderId,                                             │
│         productId, productName, quantity, amount,           │
│         buyerAddress: user.walletAddress,                   │
│         transactionHash,                                     │
│         blockNumber,                                         │
│         dataHash,                                            │
│         status: 'confirmed',                                │
│         userId                                               │
│       },                                                     │
│       include: { user: true }  // Get customer name         │
│     })                                                       │
│                                                              │
│ Step 5: Return Response                                     │
│   - res.status(201).json({                                  │
│       message: "Đơn hàng đã được tạo",                     │
│       order: {                                               │
│         orderId, customerName: order.user.fullName,         │
│         productId, productName, quantity, amount,           │
│         buyerAddress, transactionHash, blockNumber,         │
│         dataHash, status, createdAt                         │
│       }                                                      │
│     })                                                       │
└──────┬──────────────────────────────────────────────────────┘
       │ 6. Response: 201 Created
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: CheckoutPage.jsx                                   │
│ ------------------------------------------------------------ │
│ - Display success message                                    │
│ - Show transaction hash (clickable link)                    │
│ - Show block number                                          │
│ - Show order status                                          │
│ - User can verify on blockchain                             │
└─────────────────────────────────────────────────────────────┘
```

**Files tham gia:**
- `frontend/src/pages/CheckoutPage.jsx`
- `frontend/src/api/api.js`
- `backend/src/middleware/authMiddleware.js`
- `backend/src/controllers/orderController.js`
- `backend/src/services/blockchainService.js`
- `backend/prisma/schema.prisma` (Order model)
- `blockchain/contracts/OrderValidation.sol`
- Hardhat Node

**Data flow:**
```
User Input 
  → Frontend Validation 
  → API Call with JWT 
  → Backend Auth Middleware 
  → Order Controller 
  → Blockchain Service 
  → Smart Contract 
  → Transaction Mined 
  → Save to Database 
  → Response to Frontend 
  → Display Result
```

---

### 5️⃣ LUỒNG XEM LỊCH SỬ ĐƠN HÀNG (View Orders Flow)

```
┌──────────────┐
│   Browser    │
│  OrdersPage  │
└──────┬───────┘
       │ 1. Component mount → useEffect
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: OrdersPage.jsx                                     │
│ ------------------------------------------------------------ │
│ useEffect(() => {                                            │
│   const fetchOrders = async () => {                         │
│     const data = await getOrders()  // Call API             │
│     setOrders(data)                                         │
│   }                                                          │
│   fetchOrders()                                             │
│ }, [])                                                       │
└──────┬──────────────────────────────────────────────────────┘
       │ 2. GET /orders
       │    Headers: { Authorization: Bearer <token> }
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: authMiddleware.js                                  │
│ ------------------------------------------------------------ │
│ 1. Verify JWT token                                         │
│ 2. Attach userId to req.user                                │
│ 3. Next() -> orderController.getOrders()                    │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: orderController.js -> getOrders()                  │
│ ------------------------------------------------------------ │
│ 1. Get userId from req.user                                 │
│ 2. Query database:                                           │
│    orders = await prisma.order.findMany({                   │
│      where: { userId },                                     │
│      include: { user: true },                               │
│      orderBy: { createdAt: 'desc' }                         │
│    })                                                        │
│ 3. Transform data:                                           │
│    orders.map(order => ({                                   │
│      ...order,                                               │
│      customerName: order.user.fullName                      │
│    }))                                                       │
│ 4. Return: { orders: [...] }                               │
└──────┬──────────────────────────────────────────────────────┘
       │ 3. Response: 200 OK
       │    { orders: [...] }
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: Display orders in table                           │
│ - Order ID                                                   │
│ - Product Name                                               │
│ - Quantity                                                   │
│ - Amount (ETH)                                               │
│ - Transaction Hash (clickable)                              │
│ - Block Number                                               │
│ - Status                                                     │
│ - Created Date                                               │
└─────────────────────────────────────────────────────────────┘
```

**Files tham gia:**
- `frontend/src/pages/OrdersPage.jsx`
- `frontend/src/api/api.js`
- `backend/src/middleware/authMiddleware.js`
- `backend/src/controllers/orderController.js`

---

### 6️⃣ LUỒNG XÁC MINH ĐƠN HÀNG TRÊN BLOCKCHAIN (Verify Order Flow)

```
┌──────────────┐
│   Browser    │
│  OrdersPage  │
└──────┬───────┘
       │ 1. User click "Verify" button trên đơn hàng
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: OrdersPage.jsx                                     │
│ ------------------------------------------------------------ │
│ const handleVerify = async (orderId) => {                   │
│   const result = await verifyOrder(orderId)                 │
│   // Display verification result                            │
│ }                                                            │
└──────┬──────────────────────────────────────────────────────┘
       │ 2. GET /orders/verify/:orderId
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: orderController.js -> verifyOrder()                │
│ ------------------------------------------------------------ │
│ Step 1: Get Order from Database                             │
│   - order = await prisma.order.findUnique({                 │
│       where: { orderId }                                    │
│     })                                                       │
│                                                              │
│ Step 2: Verify on Blockchain                                │
│   - blockchainData = await blockchainService.verifyOrder({  │
│       orderId,                                               │
│       expectedDataHash: order.dataHash                      │
│     })                                                       │
└──────┬──────────────────────────────────────────────────────┘
       │ 3. Call blockchainService
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: blockchainService.js -> verifyOrder()              │
│ ------------------------------------------------------------ │
│ 1. Connect to contract                                       │
│ 2. Call contract.getOrder(orderId)                          │
│ 3. Compare:                                                  │
│    - orderExists on blockchain?                             │
│    - dataHash matches?                                      │
│    - buyer address matches?                                 │
│    - amount matches?                                        │
│ 4. Return verification result                               │
└──────┬──────────────────────────────────────────────────────┘
       │ 4. Query Hardhat Node
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Hardhat Node: OrderValidation.sol                           │
│ ------------------------------------------------------------ │
│ function getOrder(orderId) returns (Order memory) {         │
│   require(orders[orderId].exists, "Order not found")        │
│   return orders[orderId]                                    │
│ }                                                            │
└──────┬──────────────────────────────────────────────────────┘
       │ 5. Return blockchain data
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: orderController.js (continued)                     │
│ ------------------------------------------------------------ │
│ Step 3: Compare Data                                         │
│   - Database vs Blockchain                                   │
│   - isValid = (all fields match)                            │
│                                                              │
│ Step 4: Return Response                                      │
│   - res.json({                                               │
│       valid: isValid,                                       │
│       databaseOrder: {...},                                 │
│       blockchainOrder: {...},                               │
│       differences: [...]                                    │
│     })                                                       │
└──────┬──────────────────────────────────────────────────────┘
       │ 6. Response: 200 OK
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: Display verification result                       │
│ - ✅ Valid: Data matched                                     │
│ - ❌ Invalid: Show differences                               │
└─────────────────────────────────────────────────────────────┘
```

**Files tham gia:**
- `frontend/src/pages/OrdersPage.jsx`
- `frontend/src/api/api.js`
- `backend/src/controllers/orderController.js`
- `backend/src/services/blockchainService.js`
- `blockchain/contracts/OrderValidation.sol`

---

## 🔐 Bảo mật và Authentication Flow

### JWT Token Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│ 1. LOGIN                                                     │
│ ------------------------------------------------------------ │
│ Backend generates:                                           │
│   token = jwt.sign(                                         │
│     { userId, email, role },                                │
│     process.env.JWT_SECRET,                                 │
│     { expiresIn: '7d' }                                     │
│   )                                                          │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. STORE TOKEN                                               │
│ ------------------------------------------------------------ │
│ Frontend stores in:                                          │
│   - localStorage.setItem('token', token)                    │
│   - Zustand store: { token, user, isAuthenticated: true }  │
│   - Axios default header:                                    │
│     axios.defaults.headers.common['Authorization']          │
│       = `Bearer ${token}`                                    │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. USE TOKEN (Every API call)                               │
│ ------------------------------------------------------------ │
│ Request headers:                                             │
│   {                                                          │
│     "Authorization": "Bearer eyJhbGciOiJIUzI1NiIs..."       │
│     "Content-Type": "application/json"                      │
│   }                                                          │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. VERIFY TOKEN (authMiddleware.js)                         │
│ ------------------------------------------------------------ │
│ const authMiddleware = (req, res, next) => {                │
│   const token = req.headers.authorization?.split(' ')[1]    │
│   if (!token) return res.status(401).json({...})           │
│                                                              │
│   try {                                                      │
│     const decoded = jwt.verify(token, JWT_SECRET)           │
│     req.user = decoded  // { userId, email, role }          │
│     next()                                                   │
│   } catch (error) {                                          │
│     return res.status(401).json({...})                      │
│   }                                                          │
│ }                                                            │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. PROTECTED ROUTE ACCESS                                    │
│ ------------------------------------------------------------ │
│ Controller has access to:                                    │
│   - req.user.userId                                          │
│   - req.user.email                                           │
│   - req.user.role                                            │
│                                                              │
│ Example:                                                     │
│   const orders = await prisma.order.findMany({              │
│     where: { userId: req.user.userId }                      │
│   })                                                         │
└──────┬──────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. LOGOUT                                                    │
│ ------------------------------------------------------------ │
│ Frontend:                                                    │
│   - localStorage.removeItem('token')                        │
│   - localStorage.removeItem('user')                         │
│   - Zustand: setAuth(null, null)                            │
│   - delete axios.defaults.headers.common['Authorization']   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema (Prisma)

### Models và Relations

```prisma
// User Model
model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  password      String    // Bcrypt hashed
  fullName      String
  address       String?
  phone         String?
  walletAddress String?   // Ethereum address
  role          String    @default("user")
  orders        Order[]   // One-to-Many relation
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

// Order Model
model Order {
  id              Int      @id @default(autoincrement())
  orderId         String   @unique  // ORDER_timestamp_random
  productId       String
  productName     String
  quantity        Int
  amount          String   // Wei format
  buyerAddress    String   // Ethereum address
  transactionHash String   // Blockchain tx hash
  blockNumber     Int      // Block number
  dataHash        String   // keccak256 hash
  status          String   @default("pending")
  userId          Int      // Foreign key
  user            User     @relation(fields: [userId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Product Model
model Product {
  id          Int      @id @default(autoincrement())
  productId   String   @unique
  name        String
  description String
  price       String   // ETH format
  image       String
  category    String
  stock       Int      @default(100)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Relations

```
User (1) ───────< (N) Order
  │
  └── userId (Foreign Key)

Product (Independent - no direct relation to Order)
```

---

## ⛓️ Smart Contract (OrderValidation.sol)

### Contract Structure

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract OrderValidation {
    // Struct định nghĩa Order
    struct Order {
        string orderId;       // Unique order ID
        bytes32 dataHash;     // Keccak256 hash của order data
        address buyer;        // Địa chỉ ví người mua
        uint256 amount;       // Số tiền (Wei)
        uint256 timestamp;    // Thời gian tạo
        bool exists;          // Flag kiểm tra order tồn tại
    }

    // State variables
    address public owner;
    mapping(string => Order) public orders;        // orderId => Order
    string[] public orderIds;                      // Danh sách order IDs
    mapping(address => string[]) public buyerOrders; // buyer => orderIds

    // Events
    event OrderCreated(
        string orderId,
        bytes32 dataHash,
        address buyer,
        uint256 amount,
        uint256 timestamp
    );

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Main functions
    function createOrder(
        string memory _orderId,
        bytes32 _dataHash,
        address _buyer,
        uint256 _amount
    ) public {
        require(!orders[_orderId].exists, "Order already exists");
        require(_buyer != address(0), "Invalid buyer address");

        orders[_orderId] = Order({
            orderId: _orderId,
            dataHash: _dataHash,
            buyer: _buyer,
            amount: _amount,
            timestamp: block.timestamp,
            exists: true
        });

        orderIds.push(_orderId);
        buyerOrders[_buyer].push(_orderId);

        emit OrderCreated(_orderId, _dataHash, _buyer, _amount, block.timestamp);
    }

    // View functions
    function getOrder(string memory _orderId) 
        public view returns (Order memory) {
        require(orders[_orderId].exists, "Order not found");
        return orders[_orderId];
    }

    function getOrdersByBuyer(address _buyer) 
        public view returns (string[] memory) {
        return buyerOrders[_buyer];
    }

    function getTotalOrders() public view returns (uint256) {
        return orderIds.length;
    }
}
```

### Contract Deployment Flow

```
1. Compile Contract
   → npx hardhat compile
   → Output: artifacts/contracts/OrderValidation.sol/OrderValidation.json

2. Deploy Script (scripts/deploy.js)
   → Get deployer account from Hardhat
   → Deploy contract: new ethers.ContractFactory()
   → Wait for deployment
   → Save contract address to deployed-address.json

3. Backend Integration
   → Read contract address from deployed-address.json
   → Load ABI from artifacts
   → Create contract instance with ethers.js
```

---

## 🔄 State Management (Zustand)

### Auth Store Structure

```javascript
// frontend/src/store/authStore.js

const useAuthStore = create((set) => ({
  // State
  user: null,              // User object từ API
  token: null,             // JWT token
  isAuthenticated: false,  // Auth status

  // Actions
  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true })
    if (token) {
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      // Set default Axios header
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false })
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete axios.defaults.headers.common['Authorization']
  },

  // Initialize from localStorage
  initAuth: () => {
    const token = localStorage.getItem('token')
    const userStr = localStorage.getItem('user')
    if (token && userStr) {
      const user = JSON.parse(userStr)
      set({ user, token, isAuthenticated: true })
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    }
  }
}))

export default useAuthStore
```

### Usage in Components

```javascript
// Read state
const { user, isAuthenticated } = useAuthStore()

// Update state
const { setAuth, logout } = useAuthStore()

// Initialize on app start (App.jsx)
useEffect(() => {
  useAuthStore.getState().initAuth()
}, [])
```

---

## 📊 API Endpoints Summary

### Auth Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | ❌ | Đăng ký tài khoản mới |
| POST | `/auth/login` | ❌ | Đăng nhập, nhận JWT token |
| GET | `/auth/profile` | ✅ | Lấy thông tin profile |
| PUT | `/auth/wallet` | ✅ | Cập nhật địa chỉ ví |

### Order Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders/create` | ✅ | Tạo đơn hàng mới (blockchain + DB) |
| GET | `/orders` | ✅ | Lấy danh sách đơn hàng của user |
| GET | `/orders/verify/:orderId` | ❌ | Xác minh đơn hàng trên blockchain |

### Product Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products` | ❌ | Lấy danh sách sản phẩm |

### Blockchain Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/blockchain/info` | ❌ | Thông tin blockchain (network, contract) |

---

## 🚀 Deployment & Environment Variables

### Backend .env
```bash
# Server
PORT=5000
NODE_ENV=development

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Blockchain
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# Database (Prisma auto-detects from schema.prisma)
DATABASE_URL="file:./prisma/dev.db"
```

### Frontend Environment
```javascript
// Vite tự động load từ import.meta.env
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
```

---

## 🧪 Testing Flow

### Manual Testing Checklist

1. **Hardhat Node**
   ```bash
   cd blockchain
   npx hardhat node
   # Verify: Should show 20 accounts with 10000 ETH each
   ```

2. **Deploy Contract**
   ```bash
   npx hardhat run scripts/deploy.js --network localhost
   # Verify: deployed-address.json created
   ```

3. **Backend**
   ```bash
   cd backend
   npm start
   # Verify: "✅ Server đang chạy" message
   # Verify: Blockchain connection successful
   ```

4. **Frontend**
   ```bash
   cd frontend
   npm run dev
   # Verify: Opens at http://localhost:3000
   ```

5. **Test User Flow**
   - Register new account
   - Login
   - Add wallet address: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8`
   - Create order
   - View orders
   - Verify order on blockchain

---

## 🔍 Troubleshooting Guide

### Common Issues

#### 1. Backend can't connect to blockchain
```
Error: connect ECONNREFUSED 127.0.0.1:8545
```
**Solution:** 
- Đảm bảo Hardhat node đang chạy
- Check: `Test-NetConnection -ComputerName 127.0.0.1 -Port 8545`

#### 2. Prisma schema error
```
Unknown argument `customerName`
```
**Solution:**
- ✅ ĐÃ FIX: Removed customerName from orderController.js
- Get customer name from `order.user.fullName` instead

#### 3. JWT token expired
```
401 Unauthorized
```
**Solution:**
- Logout và login lại
- Token có thời hạn 7 ngày

#### 4. Port already in use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solution:**
```powershell
# Find process
Get-Process -Name node | Stop-Process -Force

# Hoặc dùng script
.\stop-all.ps1
```

---

## 📈 Performance Considerations

### Frontend
- **Code Splitting**: Vite tự động split chunks
- **Lazy Loading**: Routes có thể lazy load
- **State Management**: Zustand lightweight (< 1KB)

### Backend
- **Database Indexing**: Prisma tự động index unique fields
- **JWT Stateless**: Không cần session storage
- **Blockchain Caching**: Consider caching contract calls

### Blockchain
- **Gas Optimization**: Simple storage operations
- **Local Node**: Instant mining (no gas fees)
- **Production**: Cần optimize gas cho mainnet

---

## 🎓 Key Concepts

### 1. Blockchain Integration
- Backend gọi smart contract thay vì user
- User không cần MetaMask
- Private key được quản lý bởi backend (development only)
- Transaction hash được lưu trong database

### 2. Data Integrity
- Order data được hash (keccak256)
- Hash được lưu trên blockchain
- Verification: Compare database vs blockchain

### 3. Authentication Flow
- JWT-based authentication
- Stateless backend
- Token stored in localStorage & Zustand
- Protected routes require valid token

### 4. Database Relations
- User → Orders (One-to-Many)
- Prisma handles relations automatically
- Include user data when querying orders

---

## 📚 Next Steps & Improvements

### Security Enhancements
1. ✅ Sử dụng HTTPS trong production
2. ✅ Implement rate limiting
3. ✅ Add input sanitization
4. ✅ Use environment-specific private keys
5. ✅ Implement refresh tokens

### Features
1. ✅ Order cancellation
2. ✅ Order status updates
3. ✅ Admin dashboard
4. ✅ Email notifications
5. ✅ Product reviews

### Deployment
1. ✅ Deploy to cloud (AWS, Azure, GCP)
2. ✅ Use PostgreSQL for production
3. ✅ Deploy contract to testnet (Sepolia, Goerli)
4. ✅ Setup CI/CD pipeline
5. ✅ Monitor with logging service

---

## 📞 Support & Documentation

### Key Files to Reference
- `README.md` - Main documentation
- `README-KHOI-DONG.md` - Quick start guide (Vietnamese)
- `TESTING_GUIDE.md` - Testing procedures
- `AUTH_SETUP_GUIDE.md` - Authentication setup
- `SYSTEM_COMPLETE.md` - System completion notes

### Quick Reference
```bash
# Start all services
.\start-all.ps1

# Stop all services
.\stop-all.ps1

# Restart
.\restart-all.ps1

# Or double-click
START.bat
STOP.bat
```

---

**Document Version:** 1.0  
**Last Updated:** November 23, 2025  
**Maintained By:** Development Team
