import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import AdminNavigation from './AdminNavigation';

const Navigation = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cartItemCount = cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Show admin navigation if user is admin
  if (user?.role === 'admin') {
    return <AdminNavigation />;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">⚡</span>
          <span className="logo-text">Sun Electroniks</span>
        </Link>

        <div className="navbar-right">
          {user ? (
            <>
              <div className="user-greeting">
                <span className="welcome-text">Welcome,</span>
                <span className="user-name">{user.name}</span>
              </div>
              <Link to="/products" className={`nav-btn products-btn ${location.pathname === '/products' ? 'active' : ''}`}>
                Products
              </Link>
              <Link to="/profile" className={`nav-btn profile-btn ${location.pathname === '/profile' ? 'active' : ''}`}>
                Profile
              </Link>
              <Link to="/cart" className="nav-btn cart-btn">
                <span className="cart-icon">🛒</span>
                <span className="cart-text">Cart</span>
                {cartItemCount > 0 && <span className="cart-count">{cartItemCount}</span>}
              </Link>
              <button onClick={handleLogout} className="nav-btn logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/auth" className="nav-btn login-btn">Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
