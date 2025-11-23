# 🚀 HƯỚNG DẪN CÁC TÍNH NĂNG NÂNG CẤP

Dự án đã được nâng cấp với các tính năng bảo mật và hiện đại:

---

## ✅ **1. DATA HASHING (ĐÃ TÍCH HỢP)**

### **Mô tả:**
Mỗi đơn hàng sẽ được hash toàn bộ dữ liệu (orderId, customerName, productId, quantity, amount) bằng SHA256 (keccak256) trước khi ghi lên blockchain.

### **Lợi ích:**
- ✅ Đảm bảo tính toàn vẹn dữ liệu
- ✅ Phát hiện bất kỳ sự thay đổi nào trong dữ liệu off-chain
- ✅ Tăng cường bảo mật và xác thực

### **Cách hoạt động:**
1. Backend tính hash từ dữ liệu đơn hàng
2. Hash được gửi cùng với orderId và amount lên smart contract
3. Smart contract lưu hash vào struct Order
4. Khi verify, hệ thống so sánh hash on-chain với hash tính lại từ dữ liệu off-chain

### **Smart Contract Changes:**
```solidity
struct Order {
    string orderId;
    address buyer;
    uint256 amount;
    uint256 timestamp;
    bytes32 dataHash;  // ✅ MỚI: Hash của dữ liệu
    bool exists;
}

function createOrder(
    string memory _orderId,
    uint256 _amount,
    bytes32 _dataHash  // ✅ MỚI: Nhận hash
) public
```

### **Xem kết quả:**
- Sau khi đặt hàng, bạn sẽ thấy **Data Hash** trong kết quả
- Khi verify, hệ thống hiển thị **Hash Verification** với trạng thái hợp lệ/không hợp lệ

---

## 🦊 **2. METAMASK INTEGRATION (ĐÃ TÍCH HỢP UI)**

### **Mô tả:**
Người dùng có thể kết nối ví MetaMask để ký giao dịch trực tiếp từ trình duyệt thay vì dùng private key backend.

### **Lợi ích:**
- ✅ An toàn hơn (không cần lưu private key trong backend)
- ✅ Người dùng tự quản lý ví của mình
- ✅ Trải nghiệm Web3 thực tế

### **Đã tích hợp:**
- ✅ Custom Hook `useMetaMask` để kết nối MetaMask
- ✅ Component `MetaMaskButton` hiển thị trên Navbar
- ✅ Auto-detect và auto-connect
- ✅ Lắng nghe thay đổi account và network

### **Cách sử dụng:**
1. Cài đặt MetaMask extension: https://metamask.io/download/
2. Tạo hoặc import ví
3. Kết nối MetaMask với Hardhat local network:
   - Network Name: `Hardhat Local`
   - RPC URL: `http://127.0.0.1:8545`
   - Chain ID: `1337`
   - Currency: `ETH`
4. Click nút **"🦊 Kết nối MetaMask"** trên Navbar
5. Địa chỉ ví sẽ hiển thị: `0x1234...5678`

### **Để sử dụng MetaMask cho giao dịch:**

Cần cập nhật thêm code để gửi transaction qua MetaMask thay vì Backend. Hiện tại đã có infrastructure sẵn sàng.

**Hướng dẫn nâng cấp thêm (optional):**

Trong `CheckoutPage.jsx`, thay vì gọi API backend, có thể:
1. Lấy signer từ MetaMask
2. Kết nối trực tiếp với smart contract
3. Gọi `createOrder` từ frontend
4. Sau đó gọi backend API để lưu off-chain data

---

## 📦 **3. IPFS INTEGRATION (TÙY CHỌN)**

### **Mô tả:**
Lưu toàn bộ chi tiết đơn hàng lên IPFS (InterPlanetary File System) và chỉ lưu CID (Content Identifier) lên blockchain.

### **Lợi ích:**
- ✅ Giảm chi phí gas (chỉ lưu CID thay vì dữ liệu đầy đủ)
- ✅ Lưu trữ phi tập trung
- ✅ Dữ liệu không bao giờ mất (IPFS)

### **Cách tích hợp:**

#### **Bước 1: Cài đặt IPFS client**
```bash
cd backend
npm install ipfs-http-client
```

#### **Bước 2: Tạo IPFS Service**
```javascript
// backend/src/services/ipfsService.js
import { create } from 'ipfs-http-client';

const ipfs = create({ 
  url: 'https://ipfs.infura.io:5001/api/v0' 
});

export const uploadToIPFS = async (data) => {
  const result = await ipfs.add(JSON.stringify(data));
  return result.path; // CID
};

export const getFromIPFS = async (cid) => {
  const chunks = [];
  for await (const chunk of ipfs.cat(cid)) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString());
};
```

#### **Bước 3: Cập nhật Smart Contract**
```solidity
struct Order {
    string orderId;
    address buyer;
    uint256 amount;
    uint256 timestamp;
    string ipfsCID;  // CID của dữ liệu trên IPFS
    bool exists;
}
```

#### **Bước 4: Workflow**
1. Upload order details lên IPFS → nhận CID
2. Ghi CID lên blockchain
3. Khi verify, lấy CID từ blockchain → fetch dữ liệu từ IPFS

---

## 🔄 **CẬP NHẬT DỰ ÁN**

### **Để áp dụng các thay đổi mới:**

```powershell
# 1. Dừng tất cả services đang chạy (Ctrl+C)

# 2. Cập nhật Smart Contract
cd blockchain
npx hardhat compile

# 3. Deploy lại contract
npx hardhat node  # Terminal 1
npx hardhat run scripts/deploy.js --network localhost  # Terminal 2

# 4. Cập nhật Backend
cd backend
# Cập nhật CONTRACT_ADDRESS trong .env
npx prisma migrate reset  # Reset database
npx prisma migrate dev --name add-datahash
node src/seed.js
npm start

# 5. Cập nhật Frontend
cd frontend
npm install  # Cài ethers
npm run dev
```

---

## 🧪 **TEST CÁC TÍNH NĂNG MỚI**

### **1. Test Data Hashing:**
1. Tạo đơn hàng mới
2. Xem **Data Hash** trong kết quả
3. Verify đơn hàng → thấy **Hash Verification: ✅ Valid**
4. Thử thay đổi dữ liệu trong database → Hash sẽ không khớp

### **2. Test MetaMask:**
1. Cài MetaMask
2. Thêm Hardhat Local network
3. Import private key từ Hardhat: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
4. Click "Kết nối MetaMask" trên navbar
5. Thấy địa chỉ ví hiển thị

---

## 📚 **TÀI LIỆU THAM KHẢO**

- **MetaMask Docs:** https://docs.metamask.io/
- **IPFS Docs:** https://docs.ipfs.tech/
- **Ethers.js Docs:** https://docs.ethers.org/v6/
- **Hardhat Docs:** https://hardhat.org/docs

---

## ⚠️ **LƯU Ý**

- **Data Hashing:** Đã hoàn thành và hoạt động
- **MetaMask UI:** Đã tích hợp, nhưng chưa dùng để ký transaction
- **IPFS:** Hướng dẫn tùy chọn, chưa tích hợp

Để tích hợp đầy đủ MetaMask cho việc ký transaction, cần thêm logic ở frontend để gửi transaction trực tiếp thay vì qua Backend API.

---

**🎉 Dự án đã được nâng cấp với các tính năng bảo mật và hiện đại!**
