import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import AdminNavigation from './AdminNavigation';

const Navigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Show admin navigation if user is admin
  if (user?.role === 'admin') {
    return <AdminNavigation />;
  }

  // Show user navigation for regular users
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="logo">⚡ Sun Electroniks</Link>

        <div className="nav-links">
          <Link to="/products">Products</Link>
        </div>

        <div className="nav-right">
          <Link to="/cart" className="cart-link">🛒 Cart</Link>

          {user ? (
            <div className="user-menu">
              <span>Welcome, {user.name}</span>
              <Link to="/profile">Profile</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
            </div>
          ) : (
            <Link to="/auth" className="login-btn">Login / Register</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
