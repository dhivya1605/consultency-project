import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [salesData, setSalesData] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate, token]);

  const fetchData = async () => {
    try {
      const salesRes = await axios.get('http://localhost:5000/api/admin/sales-report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSalesData(salesRes.data);

      const usersRes = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div>Access denied. Admin only.</div>;
  }

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      <div className="dashboard-tabs">
        <button 
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users & Orders
        </button>
      </div>

      {activeTab === 'overview' && (
        <div>
          <div className="sales-summary">
            <div className="summary-card">
              <h3>Total Sales</h3>
              <p className="summary-value">₹{salesData?.totalSales || 0}</p>
            </div>
            <div className="summary-card">
              <h3>Total Orders</h3>
              <p className="summary-value">{salesData?.totalOrders || 0}</p>
            </div>
            {salesData?.prediction && (
              <div className="summary-card prediction-card">
                <h3>Next Month Prediction</h3>
                <p className="summary-value">₹{Math.round(salesData.prediction.prediction)}</p>
                <small className={`trend ${salesData.prediction.trend}`}>
                  {salesData.prediction.trend} trend ({Math.round(salesData.prediction.confidence * 100)}% confidence)
                </small>
              </div>
            )}
          </div>

          {salesData?.chartData && (
            <div className="ml-analytics">
              <h2>Sales Analytics & Insights</h2>
              
              <div className="analytics-grid">
                <div className="chart-section">
                  <h3>Top Selling Products</h3>
                  <div className="product-chart">
                    {salesData.chartData.chartData?.map((item, index) => (
                      <div key={index} className="chart-bar">
                        <div className="bar-info">
                          <span className="product-name">{item.product}</span>
                          <span className="product-sales">₹{item.sales}</span>
                        </div>
                        <div className="bar-container">
                          <div 
                            className="bar-fill" 
                            style={{ width: `${item.percentage}%` }}
                          ></div>
                        </div>
                        <span className="percentage">{item.percentage}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="insights-section">
                  <h3>Business Insights</h3>
                  <div className="insight-cards">
                    {salesData.chartData.topProduct && (
                      <div className="insight-card">
                        <h4>🏆 Best Performer</h4>
                        <p>{salesData.chartData.topProduct[0]}</p>
                        <small>₹{salesData.chartData.topProduct[1]} in sales</small>
                      </div>
                    )}
                    
                    <div className="insight-card">
                      <h4>📈 Growth Prediction</h4>
                      <p>{salesData.prediction?.trend === 'upward' ? 'Positive Growth' : 'Declining Trend'}</p>
                      <small>Based on current sales pattern</small>
                    </div>
                    
                    <div className="insight-card">
                      <h4>📊 Product Diversity</h4>
                      <p>{salesData.chartData.totalProducts} Products</p>
                      <small>Active in sales</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="sales-report">
            <h2>Detailed Sales Report</h2>
            <table className="sales-table">
              <thead>
                <tr>
                  <th>Product Name</th>
                  <th>Quantity Sold</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {salesData?.productSales?.map((product, index) => (
                  <tr key={index}>
                    <td>{product.name}</td>
                    <td>{product.quantity}</td>
                    <td>₹{product.amount}</td>
                  </tr>
                )) || <tr><td colSpan="3">No sales data</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-list">
          <h2>Users & Their Orders</h2>
          {users.map(user => (
            <div key={user._id} className="user-card">
              <div className="user-header">
                <h3>{user.name}</h3>
                <div className="user-stats">
                  <span className="stat">Orders: {user.totalOrders}</span>
                  <span className="stat">Spent: ₹{Math.round(user.totalSpent * 83)}</span>
                </div>
              </div>
              
              <div className="user-details">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Joined:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
              </div>

              {user.orders.length > 0 && (
                <div className="user-orders">
                  <h4>Recent Orders:</h4>
                  {user.orders.slice(0, 3).map(order => (
                    <div key={order._id} className="order-summary">
                      <div className="order-info">
                        <span className="order-id">#{order._id.slice(-8)}</span>
                        <span className="order-amount">₹{Math.round(order.totalAmount * 83)}</span>
                        <span className={`order-status ${order.orderStatus.toLowerCase()}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                      <div className="order-date">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                  {user.orders.length > 3 && (
                    <p className="more-orders">+{user.orders.length - 3} more orders</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
