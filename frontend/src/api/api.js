import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

/**
 * API Service để gọi Backend
 */

// Axios instance với interceptor để tự động thêm JWT token
const apiClient = axios.create({
  baseURL: API_BASE_URL
});

// Interceptor để thêm Authorization header
apiClient.interceptors.request.use(
  (config) => {
    const authStorage = localStorage.getItem('auth-storage');
    if (authStorage) {
      const { token } = JSON.parse(authStorage).state;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============ AUTH API ============

/**
 * Đăng ký tài khoản mới
 */
export const register = async (userData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return response.data;
  } catch (error) {
    console.error('Error registering:', error);
    throw error.response?.data || error;
  }
};

/**
 * Đăng nhập
 */
export const login = async (credentials) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
    return response.data;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error.response?.data || error;
  }
};

/**
 * Lấy thông tin profile
 */
export const getProfile = async () => {
  try {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  } catch (error) {
    console.error('Error fetching profile:', error);
    throw error.response?.data || error;
  }
};

/**
 * Cập nhật địa chỉ ví
 */
export const updateWallet = async (walletAddress) => {
  try {
    const response = await apiClient.put('/auth/users/wallet', { walletAddress });
    return response.data;
  } catch (error) {
    console.error('Error updating wallet:', error);
    throw error.response?.data || error;
  }
};

// ============ PRODUCTS API ============

/**
 * Lấy danh sách tất cả sản phẩm
 */
export const getAllProducts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`);
    return response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một sản phẩm
 */
export const getProductById = async (productId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/products/${productId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// ============ ORDERS API ============

/**
 * Tạo đơn hàng mới (yêu cầu authentication)
 */
export const createOrder = async (orderData) => {
  try {
    const response = await apiClient.post('/orders/create', orderData);
    return response.data;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error.response?.data || error;
  }
};

/**
 * Xác minh đơn hàng
 */
export const verifyOrder = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders/verify/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error verifying order:', error);
    throw error;
  }
};

/**
 * Lấy danh sách tất cả đơn hàng
 */
export const getAllOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders`);
    return response.data;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

/**
 * Lấy chi tiết một đơn hàng
 */
export const getOrderById = async (orderId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// ============ BLOCKCHAIN API ============

/**
 * Lấy thông tin blockchain
 */
export const getBlockchainInfo = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/blockchain/info`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blockchain info:', error);
    throw error;
  }
};

/**
 * Lấy danh sách order IDs từ blockchain
 */
export const getBlockchainOrders = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/blockchain/orders`);
    return response.data;
  } catch (error) {
    console.error('Error fetching blockchain orders:', error);
    throw error;
  }
};
