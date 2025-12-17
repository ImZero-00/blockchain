import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { getAllOrders } from '../api/api';
import '../styles/Admin.css';

/**
 * Admin Dashboard - Quản lý orders và users
 */
function AdminDashboard() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, confirmed, pending

  // Redirect nếu không phải admin
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    } else if (user?.role !== 'admin') {
      navigate('/');
      alert('⚠️ Bạn không có quyền truy cập trang này!');
    }
  }, [isAuthenticated, user, navigate]);

  // Fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await getAllOrders();
        console.log('getAllOrders response:', response);
        if (response.success) {
          // Backend trả về data là array trực tiếp
          setOrders(response.data || []);
        } else {
          setError('Không thể tải danh sách đơn hàng');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.message || 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role === 'admin') {
      fetchOrders();
    }
  }, [isAuthenticated, user]);

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.status === filter;
  });

  const stats = {
    total: orders.length,
    confirmed: orders.filter(o => o.status === 'confirmed').length,
    pending: orders.filter(o => o.status === 'pending').length,
    totalAmount: orders.reduce((sum, o) => sum + parseFloat(o.amount || 0), 0)
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>👑 Admin Dashboard</h1>
        <p>Quản lý đơn hàng và người dùng</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📦</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Tổng đơn hàng</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.confirmed}</div>
            <div className="stat-label">Đã xác nhận</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏳</div>
          <div className="stat-content">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Đang chờ</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">{(stats.totalAmount / 1e18).toFixed(4)} ETH</div>
            <div className="stat-label">Tổng doanh thu</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <button 
          className={filter === 'all' ? 'active' : ''} 
          onClick={() => setFilter('all')}
        >
          Tất cả
        </button>
        <button 
          className={filter === 'confirmed' ? 'active' : ''} 
          onClick={() => setFilter('confirmed')}
        >
          Đã xác nhận
        </button>
        <button 
          className={filter === 'pending' ? 'active' : ''} 
          onClick={() => setFilter('pending')}
        >
          Đang chờ
        </button>
      </div>

      {/* Orders Table */}
      <div className="admin-content">
        <h2>📋 Danh sách đơn hàng</h2>

        {loading ? (
          <div className="loading">⏳ Đang tải...</div>
        ) : error ? (
          <div className="error-message">❌ {error}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="empty-state">
            <p>Không có đơn hàng nào</p>
          </div>
        ) : (
          <div className="orders-table-container">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Khách hàng</th>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Giá trị</th>
                  <th>Địa chỉ ví</th>
                  <th>Trạng thái</th>
                  <th>Hash</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.orderId}>
                    <td className="order-id">{order.orderId}</td>
                    <td>{order.customerName}</td>
                    <td>{order.productName}</td>
                    <td>{order.quantity}</td>
                    <td className="amount">
                      {(parseFloat(order.amount) / 1e18).toFixed(4)} ETH
                    </td>
                    <td className="wallet">
                      <code>{order.buyerAddress?.substring(0, 8)}...</code>
                    </td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status === 'confirmed' ? '✅ Xác nhận' : '⏳ Chờ'}
                      </span>
                    </td>
                    <td className="tx-hash">
                      <code>{order.transactionHash?.substring(0, 10)}...</code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
