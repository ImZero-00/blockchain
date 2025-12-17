import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { useMetaMask } from '../hooks/useMetaMask';
import { updateWallet as apiUpdateWallet, getProfile } from '../api/api';
import '../styles/Profile.css';

/**
 * Profile Page - Hiển thị và cập nhật thông tin user với MetaMask Integration
 */
function ProfilePage() {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, updateWallet, logout } = useAuthStore();
  
  // MetaMask hook
  const {
    account: metamaskAccount,
    isConnected: isMetaMaskConnected,
    isCorrectNetwork,
    balance,
    loading: metamaskLoading,
    error: metamaskError,
    connect: connectMetaMask,
    hasMetaMask
  } = useMetaMask();

  const [walletInput, setWalletInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect nếu chưa login
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Refresh user data khi mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await getProfile();
        if (response.success) {
          updateWallet(response.data.user.walletAddress);
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err);
      }
    };

    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, updateWallet]);

  // Connect MetaMask và tự động điền địa chỉ
  const handleConnectMetaMask = async () => {
    setError('');
    setSuccess('');
    const result = await connectMetaMask();
    if (result && result.account) {
      setWalletInput(result.account);
      setSuccess('✅ Đã kết nối MetaMask! Địa chỉ ví đã được điền tự động.');
    } else if (metamaskError) {
      setError(metamaskError);
    }
  };

  // Sử dụng địa chỉ từ MetaMask
  const useMetaMaskAddress = () => {
    if (metamaskAccount) {
      setWalletInput(metamaskAccount);
      setSuccess('✅ Đã sử dụng địa chỉ từ MetaMask');
    }
  };

  const handleSaveWallet = async () => {
    if (!walletInput.trim()) {
      setError('Vui lòng nhập địa chỉ ví');
      return;
    }

    // Basic validation for Ethereum address
    if (!/^0x[a-fA-F0-9]{40}$/.test(walletInput)) {
      setError('Địa chỉ ví không hợp lệ. Phải bắt đầu bằng 0x và có 42 ký tự');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await apiUpdateWallet(walletInput);
      
      if (response.success) {
        updateWallet(walletInput);
        setSuccess('✅ Đã lưu địa chỉ ví thành công!');
        setWalletInput('');
      } else {
        setError(response.message || 'Cập nhật thất bại');
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật địa chỉ ví');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!isAuthenticated || !user) {
    return <div className="loading">⏳ Đang tải...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>👤 Thông tin tài khoản</h1>

        <div className="profile-info">
          <div className="info-row">
            <span className="label">Họ và tên:</span>
            <span className="value">{user.fullName}</span>
          </div>

          <div className="info-row">
            <span className="label">Email:</span>
            <span className="value">{user.email}</span>
          </div>

          <div className="info-row">
            <span className="label">Vai trò:</span>
            <span className={`badge badge-${user.role}`}>
              {user.role === 'admin' ? '👑 Admin' : '👤 User'}
            </span>
          </div>

          <div className="info-row">
            <span className="label">Địa chỉ ví:</span>
            <span className="value wallet-address">
              {user.walletAddress ? (
                <>
                  ✅ {user.walletAddress.substring(0, 10)}...{user.walletAddress.slice(-8)}
                </>
              ) : (
                <span className="no-wallet">❌ Chưa khai báo</span>
              )}
            </span>
          </div>
        </div>

        <div className="wallet-section">
          <h2>💼 Khai báo địa chỉ ví Ethereum</h2>
          <p>Kết nối MetaMask để tự động lấy địa chỉ ví, hoặc nhập thủ công.</p>

          {error && <div className="error-message">❌ {error}</div>}
          {success && <div className="success-message">{success}</div>}

          {/* MetaMask Connection */}
          <div className="metamask-section" style={{
            padding: '15px',
            marginBottom: '20px',
            borderRadius: '8px',
            background: isMetaMaskConnected ? '#e8f5e9' : '#fff3e0'
          }}>
            <h3>🦊 MetaMask</h3>
            {!hasMetaMask ? (
              <div style={{color: '#e74c3c'}}>
                MetaMask chưa được cài đặt!{' '}
                <a href="https://metamask.io/download/" target="_blank" rel="noreferrer">
                  Tải MetaMask
                </a>
              </div>
            ) : !isMetaMaskConnected ? (
              <button 
                onClick={handleConnectMetaMask}
                className="btn-primary"
                disabled={metamaskLoading}
                style={{marginTop: '10px'}}
              >
                {metamaskLoading ? '⏳ Đang kết nối...' : '🦊 Kết nối MetaMask'}
              </button>
            ) : (
              <div>
                <div style={{color: '#27ae60', marginBottom: '5px'}}>✅ Đã kết nối</div>
                <div style={{fontSize: '12px', wordBreak: 'break-all'}}>
                  <strong>Địa chỉ:</strong> {metamaskAccount}
                </div>
                <div style={{fontSize: '12px'}}>
                  <strong>Balance:</strong> {parseFloat(balance).toFixed(4)} ETH
                </div>
                <div style={{fontSize: '12px'}}>
                  <strong>Network:</strong>{' '}
                  <span style={{color: isCorrectNetwork ? '#27ae60' : '#e74c3c'}}>
                    {isCorrectNetwork ? '✅ Hardhat (1337)' : '❌ Sai mạng'}
                  </span>
                </div>
                <button 
                  onClick={useMetaMaskAddress}
                  className="btn-secondary"
                  style={{marginTop: '10px', fontSize: '14px'}}
                >
                  📋 Sử dụng địa chỉ này
                </button>
              </div>
            )}
          </div>

          <div className="wallet-actions">
            <div className="wallet-input-group">
              <label htmlFor="walletAddress">Địa chỉ ví:</label>
              <input
                type="text"
                id="walletAddress"
                value={walletInput}
                onChange={(e) => setWalletInput(e.target.value)}
                placeholder="0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
                className="wallet-input"
              />
              <small>Kết nối MetaMask hoặc nhập địa chỉ ví Hardhat</small>
            </div>
            <button 
              onClick={handleSaveWallet} 
              className="btn-success"
              disabled={loading}
            >
              {loading ? '⏳ Đang lưu...' : '💾 Lưu địa chỉ ví'}
            </button>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={handleLogout} className="btn-danger">
            🚪 Đăng xuất
          </button>
          {user.role === 'admin' && (
            <button onClick={() => navigate('/admin')} className="btn-secondary">
              👑 Admin Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
