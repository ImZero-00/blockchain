import express from 'express';
import {
  getAllProducts,
  getProductById,
  createProduct
} from '../controllers/productController.js';

const router = express.Router();

/**
 * Product Routes
 */

// GET /products - Lấy tất cả sản phẩm
router.get('/', getAllProducts);

// GET /products/:productId - Lấy chi tiết một sản phẩm
router.get('/:productId', getProductById);

// POST /products - Tạo sản phẩm mới
router.post('/', createProduct);

export default router;
