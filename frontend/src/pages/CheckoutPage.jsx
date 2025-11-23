import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { createOrder } from '../api/api';

/**
 * CheckoutPage - Trang đặt hàng và ghi giao dịch lên blockchain (yêu cầu auth + wallet)
 */
function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const { user, isAuthenticated } = useAuthStore();

  // State
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [orderResult, setOrderResult] = useState(null);

  // Redirect nếu chưa login
  useEffect(() => {
    if (!isAuthenticated) {
      alert('⚠️ Vui lòng đăng nhập để đặt hàng!');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Kiểm tra wallet
  const hasWallet = user?.walletAddress;

  // Nếu không có sản phẩm được chọn
  if (!product) {
    return (
      <div className="container">
        <div className="card">
          <h2>❌ Không tìm thấy sản phẩm</h2>
          <p>Vui lòng chọn sản phẩm từ danh sách.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Quay lại danh sách sản phẩm
          </button>
        </div>
      </div>
    );
  }

  // Tính tổng tiền
  const totalPrice = (parseFloat(product.price) * quantity).toFixed(4);

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Kiểm tra wallet
    if (!hasWallet) {
      alert('⚠️ Vui lòng khai báo địa chỉ ví trước khi đặt hàng!');
      navigate('/profile');
      return;
    }

    if (quantity < 1 || quantity > product.stock) {
      setError(`Số lượng phải từ 1 đến ${product.stock}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Tạo orderId unique
      const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      // Gọi API tạo đơn hàng (customerName sẽ lấy từ user.fullName ở backend)
      const response = await createOrder({
        orderId,
        productId: product.productId,
        quantity,
        price: product.price
      });

      if (response.success) {
        setSuccess(true);
        setOrderResult(response.data);
      } else {
        setError(response.message || 'Lỗi khi tạo đơn hàng');
      }

    } catch (err) {
      console.error('Error creating order:', err);
      setError(
        err.response?.data?.message || 
        'Không thể tạo đơn hàng. Vui lòng kiểm tra Backend và Blockchain.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Nếu đã tạo đơn hàng thành công
  if (success && orderResult) {
    return (
      <div className="container">
        <div className="card">
          <h2 className="card-header">✅ Đặt hàng thành công!</h2>
          
          <div className="alert alert-success">
            Giao dịch đã được ghi lên Blockchain và xác thực thành công.
          </div>

          <div className="transaction-info">
            <h3>📦 Thông tin đơn hàng</h3>
            <div className="data-row">
              <span className="data-label">Order ID:</span>
              <span className="data-value">{orderResult.orderId}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Khách hàng:</span>
              <span className="data-value">{orderResult.customerName}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Sản phẩm:</span>
              <span className="data-value">{orderResult.productName}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Số lượng:</span>
              <span className="data-value">{orderResult.quantity}</span>
            </div>
            <div className="data-row">
              <span className="data-label">Tổng tiền:</span>
              <span className="data-value">{orderResult.amountInEth} ETH</span>
            </div>
          </div>

          <div className="transaction-info" style={{marginTop: '20px'}}>
            <h3>🔗 Thông tin Blockchain</h3>
            <div className="data-row">
              <span className="data-label">Transaction Hash:</span>
            </div>
            <div className="transaction-hash">
              {orderResult.transactionHash}
            </div>
            
            <div className="data-row" style={{marginTop: '10px'}}>
              <span className="data-label">Block Number:</span>
              <span className="data-value">{orderResult.blockNumber}</span>
            </div>
            
            <div className="data-row">
              <span className="data-label">Buyer Address:</span>
            </div>
            <div className="transaction-hash">
              {orderResult.buyerAddress}
            </div>
            
            {orderResult.dataHash && (
              <>
                <div className="data-row" style={{marginTop: '10px'}}>
                  <span className="data-label">🔒 Data Hash (SHA256):</span>
                </div>
                <div className="transaction-hash">
                  {orderResult.dataHash}
                </div>
                <div style={{fontSize: '12px', color: '#7f8c8d', marginTop: '5px'}}>
                  ✅ Dữ liệu đơn hàng đã được hash và bảo vệ trên blockchain
                </div>
              </>
            )}
          </div>

          <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/verify')}
            >
              🔍 Xác minh đơn hàng
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              ← Quay lại danh sách sản phẩm
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Form đặt hàng
  return (
    <div className="container">
      <div className="card">
        <h2 className="card-header">🛒 Đặt hàng</h2>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        <div style={{display: 'flex', gap: '20px', marginBottom: '20px'}}>
          <img 
            src={product.image || 'https://via.placeholder.com/200'} 
            alt={product.name}
            style={{width: '200px', height: '200px', objectFit: 'cover', borderRadius: '8px'}}
          />
          <div>
            <h3>{product.name}</h3>
            <p style={{color: '#7f8c8d'}}>{product.description}</p>
            <div style={{fontSize: '24px', color: '#27ae60', fontWeight: 'bold', marginTop: '10px'}}>
              {product.price} ETH
            </div>
            <div style={{color: '#95a5a6', marginTop: '5px'}}>
              Còn lại: {product.stock} sản phẩm
            </div>
          </div>
        </div>

        {/* Hiển thị thông tin user */}
        <div className="user-info-box">
          <h3>👤 Thông tin người đặt hàng</h3>
          <div className="info-item">
            <strong>Họ tên:</strong> {user?.fullName}
          </div>
          <div className="info-item">
            <strong>Email:</strong> {user?.email}
          </div>
          <div className="info-item">
            <strong>Địa chỉ ví:</strong> 
            {hasWallet ? (
              <code style={{fontSize: '12px'}}>{user.walletAddress}</code>
            ) : (
              <span style={{color: 'red'}}>
                ❌ Chưa khai báo - <a href="/profile">Khai báo ngay</a>
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Số lượng *</label>
            <input
              type="number"
              className="form-input"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              max={product.stock}
              required
            />
          </div>

          <div className="order-summary">
            <h3>📋 Tóm tắt đơn hàng</h3>
            <div className="summary-item">
              <span>Sản phẩm:</span>
              <span>{product.name}</span>
            </div>
            <div className="summary-item">
              <span>Giá:</span>
              <span>{product.price} ETH</span>
            </div>
            <div className="summary-item">
              <span>Số lượng:</span>
              <span>{quantity}</span>
            </div>
            <div className="summary-item total">
              <span>Tổng cộng:</span>
              <span>{totalPrice} ETH</span>
            </div>
          </div>

          <div style={{marginTop: '20px', display: 'flex', gap: '10px'}}>
            <button 
              type="submit" 
              className="btn btn-success"
              disabled={loading}
            >
              {loading ? '⏳ Đang xử lý...' : '🔗 Ghi giao dịch lên Blockchain'}
            </button>
            <button 
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
              disabled={loading}
            >
              Hủy
            </button>
          </div>
        </form>

        <div className="alert alert-info" style={{marginTop: '20px'}}>
          ℹ️ Giao dịch sẽ được ghi lên Blockchain và không thể thay đổi sau khi xác nhận.
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
