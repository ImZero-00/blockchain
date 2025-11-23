import express from 'express';
import {
  register,
  login,
  getProfile,
  updateWallet
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Auth Routes
 */

// POST /auth/register - Đăng ký
router.post('/register', register);

// POST /auth/login - Đăng nhập
router.post('/login', login);

// GET /auth/profile - Lấy thông tin profile (yêu cầu đăng nhập)
router.get('/profile', authMiddleware, getProfile);

// PUT /users/wallet - Cập nhật địa chỉ ví (yêu cầu đăng nhập)
router.put('/wallet', authMiddleware, updateWallet);

export default router;
