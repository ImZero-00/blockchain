import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { login as apiLogin } from '../api/api';
import '../styles/Auth.css';

/**
 * Login Page Component
 */
function LoginPage() {
  const navigate = useNavigate();
  const loginStore = useAuthStore((state) => state.login);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await apiLogin(formData);
      
      if (response.success) {
        // Lưu vào Zustand store
        loginStore(response.data.user, response.data.token);
        
        // Redirect về trang chủ
        navigate('/');
      } else {
        setError(response.message || 'Đăng nhập thất bại');
      }
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>🔐 Đăng nhập</h1>
        <p className="auth-subtitle">Đăng nhập vào E-commerce Blockchain</p>

        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="admin@example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? '⏳ Đang đăng nhập...' : '🔓 Đăng nhập'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>

        <div className="demo-accounts">
          <h3>🧪 Tài khoản demo:</h3>
          <div className="demo-account">
            <strong>Admin:</strong> admin@example.com / admin123
          </div>
          <div className="demo-account">
            <strong>User:</strong> user@example.com / user123
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
