import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ethers } from 'ethers';
import useAuthStore from '../store/authStore';
import { useMetaMask } from '../hooks/useMetaMask';
import { saveOrderToDatabase } from '../api/api';

/**
 * CheckoutPage - Trang đặt hàng với MetaMask Integration
 * User ký giao dịch thực tế qua MetaMask
 */
function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const product = location.state?.product;
  const { user, isAuthenticated } = useAuthStore();
  
  // MetaMask hook
  const {
    account,
    isConnected,
    isCorrectNetwork,
    balance,
    loading: walletLoading,
    error: walletError,
    connect,
    createOrderOnChain,
    hasMetaMask
  } = useMetaMask();

  // State
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Confirm MetaMask, 3: Processing, 4: Success
  const [error, setError] = useState(null);
  const [orderResult, setOrderResult] = useState(null);
  const [txStatus, setTxStatus] = useState('');

  // Redirect nếu chưa login
  useEffect(() => {
    if (!isAuthenticated) {
      alert('⚠️ Vui lòng đăng nhập để đặt hàng!');
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

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
  const totalPriceWei = ethers.parseEther(totalPrice);

  // Tạo data hash (như backend đang làm)
  const createDataHash = (orderId, productId, qty, amount, buyerAddress) => {
    const dataString = `${orderId}|${productId}|${qty}|${amount}|${buyerAddress}`;
    return ethers.keccak256(ethers.toUtf8Bytes(dataString));
  };

  // Kết nối MetaMask
  const handleConnectWallet = async () => {
    setError(null);
    const result = await connect();
    if (!result) {
      setError(walletError || 'Không thể kết nối MetaMask');
    }
  };

  // Xử lý đặt hàng với MetaMask
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isConnected) {
      setError('Vui lòng kết nối MetaMask trước');
      return;
    }

    if (!isCorrectNetwork) {
      setError('Vui lòng chuyển sang mạng Hardhat (Chain ID: 1337)');
      return;
    }

    if (quantity < 1 || quantity > product.stock) {
      setError(`Số lượng phải từ 1 đến ${product.stock}`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setStep(2);

      // Tạo orderId unique
      const orderId = `ORDER_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // Tạo data hash
      const dataHash = createDataHash(
        orderId,
        product.productId,
        quantity,
        totalPriceWei.toString(),
        account
      );

      setTxStatus('📝 Đang chuẩn bị giao dịch...');
      setStep(3);

      // GỌI SMART CONTRACT - USER KÝ GIAO DỊCH QUA METAMASK
      setTxStatus('🦊 Vui lòng xác nhận giao dịch trong MetaMask...');
      
      const blockchainResult = await createOrderOnChain(
        orderId,
        totalPriceWei,
        dataHash
      );

      if (!blockchainResult.success) {
        throw new Error(blockchainResult.error);
      }

      setTxStatus('⏳ Đang lưu thông tin vào database...');

      // Lưu vào database
      const dbResult = await saveOrderToDatabase({
        orderId,
        productId: product.productId,
        productName: product.name,
        quantity,
        amount: totalPriceWei.toString(),
        buyerAddress: account,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        dataHash,
        gasUsed: blockchainResult.gasUsed
      });

      setStep(4);
      setOrderResult({
        orderId,
        customerName: user?.fullName || 'N/A',
        productName: product.name,
        quantity,
        amountInEth: totalPrice,
        transactionHash: blockchainResult.transactionHash,
        blockNumber: blockchainResult.blockNumber,
        buyerAddress: account,
        dataHash,
        gasUsed: blockchainResult.gasUsed,
        signedBy: 'USER (MetaMask)'
      });

    } catch (err) {
      console.error('Error creating order:', err);
      setError(err.message || 'Không thể tạo đơn hàng');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Render step 4: Success
  if (step === 4 && orderResult) {
    return (
      <div className="container">
        <div className="card">
          <h2 className="card-header">✅ Đặt hàng thành công!</h2>
          
          <div className="alert alert-success">
            🎉 Giao dịch đã được <strong>KÝ BỞI BẠN</strong> qua MetaMask và ghi lên Blockchain!
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

          <div className="transaction-info" style={{marginTop: '20px', background: '#e8f5e9'}}>
            <h3>🔗 Thông tin Blockchain (GIAO DỊCH THỰC TẾ)</h3>
            <div className="data-row">
              <span className="data-label">⚡ Ký bởi:</span>
              <span className="data-value" style={{color: '#27ae60', fontWeight: 'bold'}}>
                {orderResult.signedBy}
              </span>
            </div>
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
              <span className="data-label">Gas Used:</span>
              <span className="data-value">{orderResult.gasUsed}</span>
            </div>
            
            <div className="data-row">
              <span className="data-label">Buyer Address (Your Wallet):</span>
            </div>
            <div className="transaction-hash">
              {orderResult.buyerAddress}
            </div>
            
            <div className="data-row" style={{marginTop: '10px'}}>
              <span className="data-label">🔒 Data Hash:</span>
            </div>
            <div className="transaction-hash">
              {orderResult.dataHash}
            </div>
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
        <h2 className="card-header">🛒 Đặt hàng với MetaMask</h2>

        {error && (
          <div className="alert alert-error">
            ❌ {error}
          </div>
        )}

        {/* MetaMask Connection Status */}
        <div className="metamask-status" style={{
          padding: '15px',
          marginBottom: '20px',
          borderRadius: '8px',
          background: isConnected ? '#e8f5e9' : '#fff3e0'
        }}>
          <h3>🦊 MetaMask Status</h3>
          
          {!hasMetaMask ? (
            <div style={{color: '#e74c3c'}}>
              ❌ MetaMask chưa được cài đặt!{' '}
              <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
                Tải MetaMask
              </a>
            </div>
          ) : !isConnected ? (
            <div>
              <p>Chưa kết nối ví</p>
              <button 
                className="btn btn-primary"
                onClick={handleConnectWallet}
                disabled={walletLoading}
              >
                {walletLoading ? '⏳ Đang kết nối...' : '🦊 Kết nối MetaMask'}
              </button>
            </div>
          ) : (
            <div>
              <div style={{color: '#27ae60', marginBottom: '10px'}}>
                ✅ Đã kết nối
              </div>
              <div className="data-row">
                <span className="data-label">Địa chỉ:</span>
                <code style={{fontSize: '12px'}}>{account}</code>
              </div>
              <div className="data-row">
                <span className="data-label">Balance:</span>
                <span>{parseFloat(balance).toFixed(4)} ETH</span>
              </div>
              <div className="data-row">
                <span className="data-label">Network:</span>
                <span style={{color: isCorrectNetwork ? '#27ae60' : '#e74c3c'}}>
                  {isCorrectNetwork ? '✅ Hardhat (1337)' : '❌ Sai mạng'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Product Info */}
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

        {/* User Info */}
        <div className="user-info-box">
          <h3>👤 Thông tin người đặt hàng</h3>
          <div className="info-item">
            <strong>Họ tên:</strong> {user?.fullName}
          </div>
          <div className="info-item">
            <strong>Email:</strong> {user?.email}
          </div>
          <div className="info-item">
            <strong>Địa chỉ ví (từ MetaMask):</strong>{' '}
            {isConnected ? (
              <code style={{fontSize: '12px', color: '#27ae60'}}>{account}</code>
            ) : (
              <span style={{color: '#e74c3c'}}>Chưa kết nối MetaMask</span>
            )}
          </div>
        </div>

        {/* Processing Status */}
        {step === 2 || step === 3 ? (
          <div className="alert alert-info" style={{textAlign: 'center'}}>
            <div style={{fontSize: '24px', marginBottom: '10px'}}>
              {step === 2 ? '🦊' : '⏳'}
            </div>
            <div>{txStatus}</div>
            {step === 3 && (
              <div className="loading-spinner" style={{margin: '20px auto'}}></div>
            )}
          </div>
        ) : (
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
                disabled={loading || !isConnected || !isCorrectNetwork}
              >
                {loading ? '⏳ Đang xử lý...' : '🦊 Ký & Gửi giao dịch qua MetaMask'}
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
        )}

        <div className="alert alert-info" style={{marginTop: '20px'}}>
          <strong>ℹ️ Lưu ý:</strong> Bạn sẽ ký giao dịch thực tế qua MetaMask. 
          Giao dịch sẽ được ghi lên Blockchain bởi chính bạn (không phải backend).
        </div>
      </div>

      <style>{`
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default CheckoutPage;
