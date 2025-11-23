import { Link, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

/**
 * Navbar Component - Navigation bar hiển thị ở đầu trang
 */
function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          🔗 E-commerce Blockchain
        </Link>
        <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
          <ul className="navbar-links" style={{margin: 0}}>
            <li>
              <Link 
                to="/" 
                className={location.pathname === '/' ? 'active' : ''}
              >
                Sản phẩm
              </Link>
            </li>
            <li>
              <Link 
                to="/verify" 
                className={location.pathname === '/verify' ? 'active' : ''}
              >
                Xác minh
              </Link>
            </li>
            {isAuthenticated && user?.role === 'admin' && (
              <li>
                <Link 
                  to="/admin" 
                  className={location.pathname === '/admin' ? 'active' : ''}
                >
                  👑 Admin
                </Link>
              </li>
            )}
          </ul>
          
          {/* Auth Links */}
          <div className="auth-links">
            {isAuthenticated ? (
              <Link to="/profile" className="profile-link">
                👤 {user?.fullName || user?.email}
              </Link>
            ) : (
              <>
                <Link to="/login" className="login-link">
                  🔓 Đăng nhập
                </Link>
                <Link to="/register" className="register-link">
                  📝 Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
