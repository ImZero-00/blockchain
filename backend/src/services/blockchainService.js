import { ethers } from 'ethers';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Blockchain Service - Kết nối và tương tác với Smart Contract
 */
class BlockchainService {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.contract = null;
    this.contractAddress = process.env.CONTRACT_ADDRESS;
    this.rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://127.0.0.1:8545';
    
    // ABI của OrderValidation contract (lấy từ artifacts sau khi compile)
    this.contractABI = [
      "event OrderCreated(string indexed orderId, address indexed buyer, uint256 amount, uint256 timestamp, bytes32 dataHash)",
      "event OrderVerified(string indexed orderId, address indexed verifier, uint256 timestamp)",
      "function createOrder(string memory _orderId, uint256 _amount, bytes32 _dataHash, address _buyer) public",
      "function verifyOrder(string memory _orderId) public returns (string memory, address, uint256, uint256, bytes32, bool)",
      "function getOrder(string memory _orderId) public view returns (string memory, address, uint256, uint256, bytes32)",
      "function verifyOrderHash(string memory _orderId, bytes32 _dataToVerify) public view returns (bool)",
      "function checkOrderExists(string memory _orderId) public view returns (bool)",
      "function getAllOrderIds() public view returns (string[] memory)",
      "function totalOrders() public view returns (uint256)",
      "function owner() public view returns (address)"
    ];
  }

  /**
   * Khởi tạo kết nối blockchain
   */
  async initialize() {
    try {
      // Kết nối tới blockchain provider
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);
      
      // Tạo signer từ private key
      const privateKey = process.env.PRIVATE_KEY;
      if (!privateKey) {
        throw new Error('PRIVATE_KEY không được cấu hình trong .env');
      }
      
      this.signer = new ethers.Wallet(privateKey, this.provider);
      
      // Kết nối tới contract
      if (!this.contractAddress) {
        throw new Error('CONTRACT_ADDRESS không được cấu hình trong .env');
      }
      
      this.contract = new ethers.Contract(
        this.contractAddress,
        this.contractABI,
        this.signer
      );
      
      // Test connection
      const network = await this.provider.getNetwork();
      console.log('✅ Đã kết nối tới blockchain:');
      console.log('   Network:', network.name);
      console.log('   Chain ID:', network.chainId.toString());
      console.log('   Contract Address:', this.contractAddress);
      console.log('   Signer Address:', this.signer.address);
      
      return true;
    } catch (error) {
      console.error('❌ Lỗi khi khởi tạo blockchain service:', error.message);
      throw error;
    }
  }

  /**
   * Tạo hash SHA256 từ dữ liệu đơn hàng
   */
  createOrderDataHash(orderData) {
    const dataString = JSON.stringify({
      orderId: orderData.orderId,
      productId: orderData.productId,
      quantity: orderData.quantity,
      amount: orderData.amount,
      buyerAddress: orderData.buyerAddress
    });
    
    // Tạo hash bằng keccak256 (tương thích với Solidity)
    const hash = ethers.keccak256(ethers.toUtf8Bytes(dataString));
    console.log(`🔒 Data hash created: ${hash}`);
    return hash;
  }

  /**
   * Tạo đơn hàng mới trên blockchain với data hash
   */
  async createOrder(orderId, amount, orderData, buyerAddress) {
    try {
      if (!this.contract) {
        throw new Error('Contract chưa được khởi tạo');
      }

      // Chuyển đổi amount sang wei nếu cần
      const amountInWei = typeof amount === 'string' ? amount : amount.toString();
      
      // Tạo hash của dữ liệu đơn hàng
      const dataHash = this.createOrderDataHash(orderData);
      
      console.log(`📝 Tạo đơn hàng trên blockchain: ${orderId}, Amount: ${amountInWei} wei, Buyer: ${buyerAddress}`);
      
      // Gọi smart contract function với data hash và buyer address
      const tx = await this.contract.createOrder(orderId, amountInWei, dataHash, buyerAddress);
      
      console.log(`⏳ Transaction submitted: ${tx.hash}`);
      
      // Đợi transaction được confirm
      const receipt = await tx.wait();
      
      console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
      
      return {
        success: true,
        transactionHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        from: receipt.from,
        to: receipt.to,
        dataHash: dataHash
      };
    } catch (error) {
      console.error('❌ Lỗi khi tạo order trên blockchain:', error);
      
      // Parse lỗi từ smart contract
      let errorMessage = error.message;
      if (error.reason) {
        errorMessage = error.reason;
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Xác minh đơn hàng từ blockchain
   */
  async verifyOrder(orderId) {
    try {
      if (!this.contract) {
        throw new Error('Contract chưa được khởi tạo');
      }

      console.log(`🔍 Verify đơn hàng: ${orderId}`);
      
      // Kiểm tra order có tồn tại không
      const exists = await this.contract.checkOrderExists(orderId);
      
      if (!exists) {
        return {
          success: false,
          exists: false,
          message: 'Order không tồn tại trên blockchain'
        };
      }
      
      // Lấy thông tin order
      const orderData = await this.contract.getOrder(orderId);
      
      return {
        success: true,
        exists: true,
        data: {
          orderId: orderData[0],
          buyer: orderData[1],
          amount: orderData[2].toString(),
          timestamp: Number(orderData[3]),
          timestampDate: new Date(Number(orderData[3]) * 1000).toISOString(),
          dataHash: orderData[4]
        }
      };
    } catch (error) {
      console.error('❌ Lỗi khi verify order:', error);
      
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Lấy tất cả order IDs
   */
  async getAllOrderIds() {
    try {
      if (!this.contract) {
        throw new Error('Contract chưa được khởi tạo');
      }

      const orderIds = await this.contract.getAllOrderIds();
      return orderIds;
    } catch (error) {
      console.error('❌ Lỗi khi lấy all order IDs:', error);
      throw error;
    }
  }

  /**
   * Lấy tổng số orders
   */
  async getTotalOrders() {
    try {
      if (!this.contract) {
        throw new Error('Contract chưa được khởi tạo');
      }

      const total = await this.contract.totalOrders();
      return Number(total);
    } catch (error) {
      console.error('❌ Lỗi khi lấy total orders:', error);
      throw error;
    }
  }

  /**
   * Lấy thông tin network
   */
  async getNetworkInfo() {
    try {
      if (!this.provider) {
        throw new Error('Provider chưa được khởi tạo');
      }

      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();
      
      return {
        name: network.name,
        chainId: network.chainId.toString(),
        blockNumber: blockNumber,
        gasPrice: gasPrice.gasPrice ? gasPrice.gasPrice.toString() : null
      };
    } catch (error) {
      console.error('❌ Lỗi khi lấy network info:', error);
      throw error;
    }
  }

  /**
   * Xác minh hash dữ liệu đơn hàng
   */
  async verifyOrderHash(orderId, orderData) {
    try {
      if (!this.contract) {
        throw new Error('Contract chưa được khởi tạo');
      }

      const dataHash = this.createOrderDataHash(orderData);
      const isValid = await this.contract.verifyOrderHash(orderId, dataHash);
      
      return {
        success: true,
        isValid: isValid,
        dataHash: dataHash
      };
    } catch (error) {
      console.error('❌ Lỗi khi verify order hash:', error);
      throw error;
    }
  }
}

// Export singleton instance
const blockchainService = new BlockchainService();
export default blockchainService;
