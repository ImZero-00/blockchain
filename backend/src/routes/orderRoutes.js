import express from 'express';
import {
  createOrder,
  verifyOrder,
  getAllOrders,
  getOrderById,
  saveSignedOrder
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Order Routes
 */

// POST /orders/create - Tạo đơn hàng mới (backend ký)
router.post('/create', authMiddleware, createOrder);

// POST /orders/save-signed - Lưu đơn hàng đã ký qua MetaMask
router.post('/save-signed', authMiddleware, saveSignedOrder);

// GET /orders/verify/:orderId - Xác minh đơn hàng
router.get('/verify/:orderId', verifyOrder);

// GET /orders - Lấy tất cả orders
router.get('/', getAllOrders);

// GET /orders/:orderId - Lấy chi tiết một order
router.get('/:orderId', getOrderById);

export default router;
