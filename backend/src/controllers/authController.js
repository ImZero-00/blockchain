import prisma from '../db/prisma.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { ethers } from 'ethers';

/**
 * POST /auth/register
 * Đăng ký tài khoản mới
 */
export const register = async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ email, password và fullName'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Email không hợp lệ'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự'
      });
    }

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email đã được sử dụng'
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Tạo user mới
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        fullName,
        role: 'user', // Mặc định là user
        walletAddress: null
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        walletAddress: true,
        createdAt: true
      }
    });

    // Tạo JWT token
    const token = generateToken({ userId: user.id, role: user.role });

    console.log(`✅ User registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'Đăng ký thành công',
      data: {
        token,
        user
      }
    });

  } catch (error) {
    console.error('❌ Error in register:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * POST /auth/login
 * Đăng nhập
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền email và password'
      });
    }

    // Tìm user theo email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Kiểm tra password
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Email hoặc mật khẩu không đúng'
      });
    }

    // Tạo JWT token
    const token = generateToken({ userId: user.id, role: user.role });

    // Không trả về password
    const { password: _, ...userWithoutPassword } = user;

    console.log(`✅ User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        token,
        user: userWithoutPassword
      }
    });

  } catch (error) {
    console.error('❌ Error in login:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * GET /auth/profile
 * Lấy thông tin profile (yêu cầu authentication)
 */
export const getProfile = async (req, res) => {
  try {
    // req.user đã được set bởi authMiddleware
    const user = req.user;

    res.status(200).json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('❌ Error in getProfile:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};

/**
 * PUT /users/wallet
 * Cập nhật địa chỉ ví (yêu cầu authentication)
 */
export const updateWallet = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    const userId = req.user.id;

    // Validate wallet address
    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập địa chỉ ví'
      });
    }

    // Kiểm tra format address bằng ethers.js
    if (!ethers.isAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ ví không hợp lệ'
      });
    }

    // Kiểm tra địa chỉ ví đã được sử dụng bởi user khác chưa
    const existingUser = await prisma.user.findFirst({
      where: {
        walletAddress: walletAddress,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Địa chỉ ví này đã được sử dụng bởi tài khoản khác'
      });
    }

    // Cập nhật wallet address
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { walletAddress },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        walletAddress: true,
        createdAt: true
      }
    });

    console.log(`✅ Wallet updated for user ${userId}: ${walletAddress}`);

    res.status(200).json({
      success: true,
      message: 'Cập nhật địa chỉ ví thành công',
      data: updatedUser
    });

  } catch (error) {
    console.error('❌ Error in updateWallet:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
};
