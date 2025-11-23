# E-commerce Blockchain - Backend API

Backend API sử dụng Express.js, Prisma, Ethers.js để tương tác với blockchain.

## Setup

```powershell
# Cài đặt
npm install

# Copy .env
Copy-Item .env.example .env

# Cập nhật CONTRACT_ADDRESS trong .env

# Generate Prisma Client
npx prisma generate

# Migrate database
npx prisma migrate dev --name init

# Seed dữ liệu mẫu
node src/seed.js

# Chạy server
npm start
```

## API Endpoints

- `GET /` - Health check
- `POST /orders/create` - Tạo đơn hàng
- `GET /orders/verify/:orderId` - Xác minh đơn hàng
- `GET /orders` - Lấy tất cả orders
- `GET /products` - Lấy tất cả sản phẩm
- `GET /blockchain/info` - Thông tin blockchain

Server chạy tại: `http://localhost:5000`
