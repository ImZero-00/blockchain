import prisma from '../db/prisma.js';
import blockchainService from '../services/blockchainService.js';
import { ethers } from 'ethers';

/**
 * Order Controller - Xử lý các API liên quan đến orders
 */

/**
 * POST /orders/create
 * Tạo đơn hàng mới và ghi lên blockchain (yêu cầu authentication và wallet)
 */
export const createOrder = async (req, res) => {
  try {
    const { orderId, productId, quantity, price } = req.body;
    const user = req.user; // Từ authMiddleware

    // Kiểm tra user đã khai báo ví chưa
    if (!user.walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Bạn phải khai báo địa chỉ ví trước khi đặt hàng'
      });
    }

    // Validate input
    if (!orderId || !productId || !quantity || !price) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: orderId, productId, quantity, price'
      });
    }

    // Kiểm tra orderId đã tồn tại trong database chưa
    const existingOrder = await prisma.order.findUnique({
      where: { orderId }
    });

    if (existingOrder) {
      return res.status(400).json({
        success: false,
        message: 'Order ID đã tồn tại trong hệ thống'
      });
    }

    // Lấy thông tin product
    const product = await prisma.product.findUnique({
      where: { productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    // Tính tổng tiền (price * quantity) - chuyển sang wei
    const totalAmount = ethers.parseEther((parseFloat(price) * quantity).toString());
    const totalAmountString = totalAmount.toString();

    // Chuẩn bị dữ liệu để hash
    const orderData = {
      orderId,
      productId,
      quantity,
      amount: totalAmountString,
      buyerAddress: user.walletAddress
    };

    // Ghi lên blockchain với data hash và buyer address
    console.log(`📝 Đang ghi đơn hàng ${orderId} lên blockchain...`);
    const blockchainResult = await blockchainService.createOrder(orderId, totalAmountString, orderData, user.walletAddress);

    if (!blockchainResult.success) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi ghi đơn hàng lên blockchain',
        error: blockchainResult.error
      });
    }

    // Lưu vào database off-chain
    const order = await prisma.order.create({
      data: {
        orderId,
        productId,
        productName: product.name,
        quantity,
        amount: totalAmountString,
        buyerAddress: user.walletAddress,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        dataHash: blockchainResult.dataHash,
        status: 'confirmed',
        userId: user.id
      },
      include: {
        user: true
      }
    });

    console.log(`✅ Đơn hàng ${orderId} đã được tạo thành công`);

    // Trả về response
    res.status(201).json({
      success: true,
      message: 'Đơn hàng đã được tạo và ghi lên blockchain',
      data: {
        orderId: order.orderId,
        customerName: order.user.fullName,
        productName: order.productName,
        quantity: order.quantity,
        amount: order.amount,
        amountInEth: ethers.formatEther(order.amount),
        transactionHash: order.transactionHash,
        blockNumber: order.blockNumber,
        buyerAddress: order.buyerAddress,
        dataHash: order.dataHash,
        status: order.status,
        createdAt: order.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Lỗi trong createOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * GET /orders/verify/:orderId
 * Xác minh đơn hàng từ blockchain và so sánh với database
 */
export const verifyOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'Order ID không được để trống'
      });
    }

    // Lấy thông tin từ blockchain
    console.log(`🔍 Đang verify order ${orderId} trên blockchain...`);
    const blockchainResult = await blockchainService.verifyOrder(orderId);

    // Lấy thông tin từ database
    const dbOrder = await prisma.order.findUnique({
      where: { orderId }
    });

    // Nếu không tồn tại trên blockchain
    if (!blockchainResult.exists) {
      return res.status(404).json({
        success: false,
        existsOnChain: false,
        existsInDatabase: dbOrder ? true : false,
        message: 'Đơn hàng không tồn tại trên blockchain',
        offChainData: dbOrder || null
      });
    }

    // So sánh dữ liệu on-chain và off-chain
    let isMatched = false;
    let differences = [];
    let hashVerification = null;

    if (dbOrder) {
      // So sánh amount
      if (dbOrder.amount !== blockchainResult.data.amount) {
        differences.push({
          field: 'amount',
          onChain: blockchainResult.data.amount,
          offChain: dbOrder.amount
        });
      }

      // So sánh buyer address
      if (dbOrder.buyerAddress.toLowerCase() !== blockchainResult.data.buyer.toLowerCase()) {
        differences.push({
          field: 'buyerAddress',
          onChain: blockchainResult.data.buyer,
          offChain: dbOrder.buyerAddress
        });
      }

      // So sánh data hash
      if (dbOrder.dataHash && blockchainResult.data.dataHash) {
        if (dbOrder.dataHash !== blockchainResult.data.dataHash) {
          differences.push({
            field: 'dataHash',
            onChain: blockchainResult.data.dataHash,
            offChain: dbOrder.dataHash
          });
        }

        // Xác minh hash bằng cách tính lại từ dữ liệu off-chain
        try {
          const orderData = {
            orderId: dbOrder.orderId,
            customerName: dbOrder.customerName,
            productId: dbOrder.productId,
            quantity: dbOrder.quantity,
            amount: dbOrder.amount
          };
          const hashCheck = await blockchainService.verifyOrderHash(orderId, orderData);
          hashVerification = {
            isValid: hashCheck.isValid,
            computedHash: hashCheck.dataHash,
            onChainHash: blockchainResult.data.dataHash
          };
        } catch (err) {
          console.error('Error verifying hash:', err);
        }
      }

      isMatched = differences.length === 0;
    }

    console.log(`✅ Verify hoàn tất: ${orderId}`);

    // Trả về kết quả
    res.status(200).json({
      success: true,
      existsOnChain: true,
      existsInDatabase: dbOrder ? true : false,
      isMatched,
      onChainData: {
        orderId: blockchainResult.data.orderId,
        buyer: blockchainResult.data.buyer,
        amount: blockchainResult.data.amount,
        amountInEth: ethers.formatEther(blockchainResult.data.amount),
        timestamp: blockchainResult.data.timestamp,
        timestampDate: blockchainResult.data.timestampDate,
        dataHash: blockchainResult.data.dataHash
      },
      offChainData: dbOrder ? {
        orderId: dbOrder.orderId,
        customerName: dbOrder.customerName,
        productName: dbOrder.productName,
        quantity: dbOrder.quantity,
        amount: dbOrder.amount,
        amountInEth: ethers.formatEther(dbOrder.amount),
        buyerAddress: dbOrder.buyerAddress,
        transactionHash: dbOrder.transactionHash,
        blockNumber: dbOrder.blockNumber,
        dataHash: dbOrder.dataHash,
        status: dbOrder.status,
        createdAt: dbOrder.createdAt
      } : null,
      differences: isMatched ? [] : differences,
      hashVerification: hashVerification
    });

  } catch (error) {
    console.error('❌ Lỗi trong verifyOrder:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * GET /orders
 * Lấy danh sách tất cả orders
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders.map(order => ({
        ...order,
        amountInEth: ethers.formatEther(order.amount)
      }))
    });

  } catch (error) {
    console.error('❌ Lỗi trong getAllOrders:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * GET /orders/:orderId
 * Lấy thông tin chi tiết một order
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { orderId }
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy đơn hàng'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        ...order,
        amountInEth: ethers.formatEther(order.amount)
      }
    });

  } catch (error) {
    console.error('❌ Lỗi trong getOrderById:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
