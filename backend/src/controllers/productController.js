import prisma from '../db/prisma.js';

/**
 * Product Controller - Xử lý các API liên quan đến products
 */

/**
 * GET /products
 * Lấy danh sách tất cả sản phẩm
 */
export const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (error) {
    console.error('❌ Lỗi trong getAllProducts:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * GET /products/:productId
 * Lấy thông tin chi tiết một sản phẩm
 */
export const getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { productId }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('❌ Lỗi trong getProductById:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * POST /products
 * Tạo sản phẩm mới
 */
export const createProduct = async (req, res) => {
  try {
    const { productId, name, description, price, image, stock } = req.body;

    // Validate
    if (!productId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin bắt buộc: productId, name, price'
      });
    }

    // Kiểm tra productId đã tồn tại chưa
    const existing = await prisma.product.findUnique({
      where: { productId }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Product ID đã tồn tại'
      });
    }

    // Tạo product
    const product = await prisma.product.create({
      data: {
        productId,
        name,
        description: description || '',
        price,
        image: image || '',
        stock: stock || 0
      }
    });

    res.status(201).json({
      success: true,
      message: 'Sản phẩm đã được tạo',
      data: product
    });

  } catch (error) {
    console.error('❌ Lỗi trong createProduct:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
