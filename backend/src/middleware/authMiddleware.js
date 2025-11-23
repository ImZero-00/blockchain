import { verifyToken } from '../utils/jwt.js';
import prisma from '../db/prisma.js';

/**
 * Middleware xác thực JWT
 * Kiểm tra token trong Authorization header
 */
export const authMiddleware = async (req, res, next) => {
  try {
    // Lấy token từ header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token không tồn tại'
      });
    }

    const token = authHeader.substring(7); // Bỏ "Bearer "

    // Verify token
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Token không hợp lệ hoặc đã hết hạn'
      });
    }

    // Lấy thông tin user từ database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        walletAddress: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User không tồn tại'
      });
    }

    // Gán user vào request để sử dụng ở các middleware/controller tiếp theo
    req.user = user;
    
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Unauthorized'
    });
  }
};

/**
 * Middleware kiểm tra role
 * Sử dụng sau authMiddleware
 */
export const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Chỉ ${allowedRoles.join(', ')} mới có quyền truy cập`
      });
    }

    next();
  };
};
