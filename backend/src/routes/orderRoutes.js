import express from 'express';
import {
  createOrder,
  verifyOrder,
  getAllOrders,
  getOrderById
} from '../controllers/orderController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Order Routes
 */

// POST /orders/create - Tạo đơn hàng mới (yêu cầu đăng nhập)
router.post('/create', authMiddleware, createOrder);

// GET /orders/verify/:orderId - Xác minh đơn hàng
router.get('/verify/:orderId', verifyOrder);

// GET /orders - Lấy tất cả orders
router.get('/', getAllOrders);

// GET /orders/:orderId - Lấy chi tiết một order
router.get('/:orderId', getOrderById);

export default router;
