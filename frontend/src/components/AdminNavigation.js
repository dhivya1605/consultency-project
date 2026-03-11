import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import './AdminNavigation.css';

const AdminNavigation = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    // Load from localStorage, default to true
    const saved = localStorage.getItem('adminSidebarOpen');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Save to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminSidebarOpen', JSON.stringify(sidebarOpen));
    // Apply sidebar state to document root for css adjustments
    document.documentElement.setAttribute('data-sidebar', sidebarOpen ? 'open' : 'closed');
  }, [sidebarOpen]);

  const handleNavClick = () => {
    setSidebarOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <div className="admin-header">
        <div className="admin-header-left">
          <button 
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <Link to="/admin" className="admin-logo">⚡ Sun Electroniks Admin</Link>
        </div>
        <div className="admin-header-right">
          <span className="admin-user">👤 {user?.name}</span>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`} data-sidebar-state={sidebarOpen ? 'open' : 'closed'}>
        <nav className="admin-nav">
          <Link 
            to="/admin" 
            onClick={handleNavClick}
            className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}
          >
            📊 Dashboard
          </Link>
          <Link 
            to="/admin/products" 
            onClick={handleNavClick}
            className={`admin-nav-link ${isActive('/admin/products') ? 'active' : ''}`}
          >
            📦 Products Management
          </Link>
          <Link 
            to="/admin/orders" 
            onClick={handleNavClick}
            className={`admin-nav-link ${isActive('/admin/orders') ? 'active' : ''}`}
          >
            🛒 Orders Management
          </Link>
          <Link 
            to="/admin/users" 
            onClick={handleNavClick}
            className={`admin-nav-link ${isActive('/admin/users') ? 'active' : ''}`}
          >
            👥 Users Management
          </Link>
          <Link 
            to="/admin/analytics" 
            onClick={handleNavClick}
            className={`admin-nav-link ${isActive('/admin/analytics') ? 'active' : ''}`}
          >
            📈 Analytics
          </Link>
          <Link 
            to="/admin/reports" 
            onClick={handleNavClick}
            className={`admin-nav-link ${isActive('/admin/reports') ? 'active' : ''}`}
          >
            📊 Reports
          </Link>
          <hr style={{margin: '1rem 0', opacity: 0.3}} />
          <button 
            onClick={handleLogout}
            className="admin-nav-link logout-link"
          >
            🚪 Logout
          </button>
        </nav>
      </div>
    </>
  );
};

export default AdminNavigation;
