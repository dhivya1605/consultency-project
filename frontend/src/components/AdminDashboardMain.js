import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    revenue: 0,
    lowStockProducts: []
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardStats = useCallback(async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes, usersRes] = await Promise.all([
        apiCall.get('/products', { headers: { Authorization: `Bearer ${token}` }, params: { admin: true } }),
        apiCall.get('/orders/admin/all', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { orders: [] } })),
        apiCall.get('/users/admin/all', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { users: [] } }))
      ]);

      const products = productsRes.data.products || [];
      const orders = ordersRes.data.orders || [];
      const users = usersRes.data.users || [];

      // Calculate stats
      const totalProducts = products.length;
      const totalOrders = orders.length;
      const totalUsers = users.length;
      const revenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      const lowStockProducts = products.filter(p => p.stock < 5).slice(0, 5);

      setStats({
        totalProducts,
        totalOrders,
        totalUsers,
        revenue,
        lowStockProducts
      });
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchDashboardStats();
  }, [user, navigate, fetchDashboardStats]);

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-container">
      <h1>Dashboard</h1>
      
      {loading ? (
        <p>Loading statistics...</p>
      ) : (
          <>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Total Products</h3>
                  <p className="stat-value">{stats.totalProducts}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Total Orders</h3>
                  <p className="stat-value">{stats.totalOrders}</p>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Total Users</h3>
                  <p className="stat-value">{stats.totalUsers}</p>
                </div>
              </div>

              <div className="stat-card revenue-card">
                <div className="stat-icon"></div>
                <div className="stat-content">
                  <h3>Total Revenue</h3>
                  <p className="stat-value">₹{stats.revenue.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </div>

            {stats.lowStockProducts.length > 0 && (
              <div className="alert-section">
                <h3>Low Stock Alerts</h3>
                <div className="low-stock-list">
                  {stats.lowStockProducts.map(product => (
                    <div key={product._id} className="low-stock-item">
                      <span className="product-name">{product.name}</span>
                      <span className="stock-badge">{product.stock} in stock</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  className="action-btn"
                  onClick={() => navigate('/admin/products')}
                >
                  Manage Products
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/admin/orders')}
                >
                  View Orders
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </button>
                <button 
                  className="action-btn"
                  onClick={() => navigate('/admin/analytics')}
                >
                  View Analytics
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

export default AdminDashboard;
