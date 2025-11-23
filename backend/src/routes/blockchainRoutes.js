import express from 'express';
import {
  getBlockchainInfo,
  getAllOrderIdsFromBlockchain
} from '../controllers/blockchainController.js';

const router = express.Router();

/**
 * Blockchain Routes
 */

// GET /blockchain/info - Lấy thông tin blockchain
router.get('/info', getBlockchainInfo);

// GET /blockchain/orders - Lấy danh sách order IDs từ blockchain
router.get('/orders', getAllOrderIdsFromBlockchain);

export default router;
