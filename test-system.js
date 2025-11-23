#!/usr/bin/env node

/**
 * Test Script - Kiểm tra toàn bộ hệ thống E-commerce Blockchain
 * Chạy: node test-system.js
 */

import axios from 'axios';

const API_BASE = 'http://localhost:5000';
let authToken = '';
let testOrderId = '';

// Colors for console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.blue}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}\n`)
};

// Test functions
async function testHealthCheck() {
  log.section('1. HEALTH CHECK - Server Status');
  try {
    const response = await axios.get(API_BASE);
    if (response.data.success) {
      log.success('Backend server is running');
      log.info(`Version: ${response.data.version}`);
      return true;
    }
  } catch (error) {
    log.error('Backend server is not running');
    log.error('Please start backend: cd backend && npm start');
    return false;
  }
}

async function testLogin() {
  log.section('2. AUTHENTICATION - Login Test');
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email: 'user@example.com',
      password: 'user123'
    });

    if (response.data.success) {
      authToken = response.data.data.token;
      log.success('Login successful');
      log.info(`User: ${response.data.data.user.fullName}`);
      log.info(`Role: ${response.data.data.user.role}`);
      log.info(`Wallet: ${response.data.data.user.walletAddress}`);
      return true;
    }
  } catch (error) {
    log.error('Login failed');
    log.error(error.response?.data?.message || error.message);
    return false;
  }
}

async function testProfile() {
  log.section('3. PROFILE - Get User Info');
  try {
    const response = await axios.get(`${API_BASE}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    if (response.data.success) {
      log.success('Profile fetched successfully');
      log.info(`Email: ${response.data.data.user.email}`);
      log.info(`Wallet: ${response.data.data.user.walletAddress || 'Not set'}`);
      return true;
    }
  } catch (error) {
    log.error('Failed to fetch profile');
    log.error(error.response?.data?.message || error.message);
    return false;
  }
}

async function testProducts() {
  log.section('4. PRODUCTS - Get Product List');
  try {
    const response = await axios.get(`${API_BASE}/products`);

    if (response.data.success) {
      log.success(`Found ${response.data.data.products.length} products`);
      response.data.data.products.slice(0, 3).forEach(product => {
        log.info(`- ${product.name}: ${product.price} ETH`);
      });
      return true;
    }
  } catch (error) {
    log.error('Failed to fetch products');
    log.error(error.response?.data?.message || error.message);
    return false;
  }
}

async function testCreateOrder() {
  log.section('5. ORDER CREATION - Create Order with Auth');
  try {
    testOrderId = `TEST_${Date.now()}`;
    
    const response = await axios.post(
      `${API_BASE}/orders/create`,
      {
        orderId: testOrderId,
        productId: 'PROD_001',
        quantity: 1,
        price: '0.5'
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );

    if (response.data.success) {
      log.success('Order created successfully on blockchain!');
      log.info(`Order ID: ${response.data.data.orderId}`);
      log.info(`Customer: ${response.data.data.customerName}`);
      log.info(`Product: ${response.data.data.productName}`);
      log.info(`Amount: ${response.data.data.amountInEth} ETH`);
      log.info(`Buyer Address: ${response.data.data.buyerAddress}`);
      log.info(`Transaction Hash: ${response.data.data.transactionHash}`);
      log.info(`Block Number: ${response.data.data.blockNumber}`);
      log.info(`Data Hash: ${response.data.data.dataHash}`);
      return true;
    }
  } catch (error) {
    log.error('Failed to create order');
    log.error(error.response?.data?.message || error.message);
    return false;
  }
}

async function testVerifyOrder() {
  log.section('6. ORDER VERIFICATION - Verify Blockchain Order');
  try {
    const response = await axios.get(`${API_BASE}/orders/verify/${testOrderId}`);

    if (response.data.success) {
      log.success('Order verification successful!');
      log.info(`Order exists on blockchain: ${response.data.data.blockchain.exists}`);
      log.info(`Buyer: ${response.data.data.blockchain.buyer}`);
      log.info(`Amount: ${response.data.data.blockchain.amountInEth} ETH`);
      log.info(`Data hash matches: ${response.data.data.blockchain.dataHashMatch ? 'Yes ✅' : 'No ❌'}`);
      return true;
    }
  } catch (error) {
    log.error('Failed to verify order');
    log.error(error.response?.data?.message || error.message);
    return false;
  }
}

async function testGetAllOrders() {
  log.section('7. ORDER LIST - Get All Orders');
  try {
    const response = await axios.get(`${API_BASE}/orders`);

    if (response.data.success) {
      log.success(`Found ${response.data.data.orders.length} orders in database`);
      response.data.data.orders.slice(0, 3).forEach(order => {
        log.info(`- ${order.orderId}: ${order.productName} (${order.status})`);
      });
      return true;
    }
  } catch (error) {
    log.error('Failed to fetch orders');
    log.error(error.response?.data?.message || error.message);
    return false;
  }
}

async function testBlockchainInfo() {
  log.section('8. BLOCKCHAIN - Get Blockchain Info');
  try {
    const response = await axios.get(`${API_BASE}/blockchain/info`);

    if (response.data.success) {
      log.success('Blockchain connection established');
      log.info(`Network: ${response.data.data.network}`);
      log.info(`Chain ID: ${response.data.data.chainId}`);
      log.info(`Contract: ${response.data.data.contractAddress}`);
      log.info(`Total Orders: ${response.data.data.totalOrders}`);
      return true;
    }
  } catch (error) {
    log.error('Failed to fetch blockchain info');
    log.error(error.response?.data?.message || error.message);
    return false;
  }
}

async function testUnauthorizedAccess() {
  log.section('9. SECURITY - Test Unauthorized Access');
  try {
    await axios.post(`${API_BASE}/orders/create`, {
      orderId: 'UNAUTHORIZED_TEST',
      productId: 'PROD_001',
      quantity: 1,
      price: '0.5'
    });
    log.error('Security issue: Unauthorized request succeeded!');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      log.success('Security OK: Unauthorized requests are blocked');
      return true;
    } else {
      log.warning('Unexpected error in security test');
      return false;
    }
  }
}

// Main test runner
async function runTests() {
  console.log('\n🧪 STARTING SYSTEM TESTS...\n');
  console.log('Testing E-commerce Blockchain with Authentication\n');

  const results = {
    passed: 0,
    failed: 0,
    total: 9
  };

  // Run all tests
  const tests = [
    testHealthCheck,
    testLogin,
    testProfile,
    testProducts,
    testCreateOrder,
    testVerifyOrder,
    testGetAllOrders,
    testBlockchainInfo,
    testUnauthorizedAccess
  ];

  for (const test of tests) {
    const result = await test();
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Delay between tests
  }

  // Final results
  log.section('TEST RESULTS SUMMARY');
  console.log(`Total Tests: ${results.total}`);
  console.log(`${colors.green}✅ Passed: ${results.passed}${colors.reset}`);
  console.log(`${colors.red}❌ Failed: ${results.failed}${colors.reset}`);
  
  if (results.failed === 0) {
    log.success('\n🎉 ALL TESTS PASSED! System is working perfectly! 🎉\n');
  } else {
    log.error(`\n⚠️  ${results.failed} test(s) failed. Please check the errors above.\n`);
  }

  // Instructions
  console.log('\n📝 Next Steps:');
  console.log('1. Visit http://localhost:3000 to test the frontend');
  console.log('2. Login with: user@example.com / user123');
  console.log('3. Try creating an order through the UI');
  console.log('4. Check Admin Dashboard with: admin@example.com / admin123\n');
}

// Run tests
runTests().catch(error => {
  log.error('Test runner failed');
  console.error(error);
  process.exit(1);
});
