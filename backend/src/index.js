import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

// Import routes
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import blockchainRoutes from './routes/blockchainRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Import services
import blockchainService from './services/blockchainService.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'E-commerce Blockchain API Server',
    version: '1.0.0',
    endpoints: {
      orders: '/orders',
      products: '/products',
      blockchain: '/blockchain'
    }
  });
});

// API Routes
app.use('/auth', authRoutes);
app.use('/orders', orderRoutes);
app.use('/products', productRoutes);
app.use('/blockchain', blockchainRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint không tồn tại'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('❌ Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Lỗi server',
    error: err.message
  });
});

// Khởi động server
async function startServer() {
  try {
    // Khởi tạo blockchain service
    console.log('\n🔗 Đang kết nối tới blockchain...');
    await blockchainService.initialize();
    
    // Start Express server
    app.listen(PORT, () => {
      console.log('\n✅ Server đang chạy');
      console.log(`   URL: http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('\n📍 API Endpoints:');
      console.log(`   GET  http://localhost:${PORT}/`);
      console.log(`   POST http://localhost:${PORT}/orders/create`);
      console.log(`   GET  http://localhost:${PORT}/orders/verify/:orderId`);
      console.log(`   GET  http://localhost:${PORT}/orders`);
      console.log(`   GET  http://localhost:${PORT}/products`);
      console.log(`   GET  http://localhost:${PORT}/blockchain/info`);
      console.log('\n🚀 Ready to accept requests!\n');
    });
    
  } catch (error) {
    console.error('\n❌ Không thể khởi động server:', error);
    process.exit(1);
  }
}

// Start server
startServer();
