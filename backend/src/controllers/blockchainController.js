import blockchainService from '../services/blockchainService.js';

/**
 * Blockchain Controller - API để kiểm tra blockchain info
 */

/**
 * GET /blockchain/info
 * Lấy thông tin blockchain network
 */
export const getBlockchainInfo = async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();
    const totalOrders = await blockchainService.getTotalOrders();

    res.status(200).json({
      success: true,
      data: {
        network: networkInfo,
        contractAddress: blockchainService.contractAddress,
        totalOrdersOnChain: totalOrders
      }
    });

  } catch (error) {
    console.error('❌ Lỗi trong getBlockchainInfo:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * GET /blockchain/orders
 * Lấy danh sách tất cả order IDs từ blockchain
 */
export const getAllOrderIdsFromBlockchain = async (req, res) => {
  try {
    const orderIds = await blockchainService.getAllOrderIds();

    res.status(200).json({
      success: true,
      count: orderIds.length,
      data: orderIds
    });

  } catch (error) {
    console.error('❌ Lỗi trong getAllOrderIdsFromBlockchain:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
