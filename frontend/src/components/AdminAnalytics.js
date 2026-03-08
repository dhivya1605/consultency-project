import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import './AdminPages.css';

const AdminAnalytics = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState({
    monthlySales: [],
    topProducts: [],
    salesTrend: [],
    categoryBreakdown: []
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [ordersRes, productsRes] = await Promise.all([
        apiCall.get('/orders/admin/all', { headers: { Authorization: `Bearer ${token}` } }).catch(() => ({ data: { orders: [] } })),
        apiCall.get('/products', { headers: { Authorization: `Bearer ${token}` }, params: { admin: true } }).catch(() => ({ data: { products: [] } }))
      ]);

      const orders = ordersRes.data.orders || [];
      const products = productsRes.data.products || [];

      // Calculate monthly sales
      const monthlySales = calculateMonthlySales(orders);
      
      // Get top products by orders
      const topProducts = calculateTopProducts(orders).slice(0, 5);
      
      // Calculate sales trend
      const salesTrend = calculateSalesTrend(orders);
      
      // Category breakdown
      const categoryBreakdown = calculateCategoryBreakdown(products);

      setAnalytics({
        monthlySales,
        topProducts,
        salesTrend,
        categoryBreakdown
      });
    } catch (err) {
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [user, navigate, fetchAnalytics]);

  const calculateMonthlySales = (orders) => {
    const months = {};
    orders.forEach(order => {
      const month = new Date(order.orderDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
      months[month] = (months[month] || 0) + (order.totalAmount || 0);
    });
    return Object.entries(months).map(([month, amount]) => ({ month, amount }));
  };

  const calculateTopProducts = (orders) => {
    const products = {};
    orders.forEach(order => {
      order.items?.forEach(item => {
        if (!products[item.productId]) {
          products[item.productId] = {
            name: item.name || 'Unknown',
            sales: 0,
            quantity: 0
          };
        }
        products[item.productId].sales += item.price * item.quantity;
        products[item.productId].quantity += item.quantity;
      });
    });
    return Object.values(products).sort((a, b) => b.quantity - a.quantity);
  };

  const calculateSalesTrend = (orders) => {
    const days = {};
    orders.forEach(order => {
      const day = new Date(order.orderDate).toLocaleDateString('en-IN');
      days[day] = (days[day] || 0) + 1;
    });
    return Object.entries(days).slice(-7).map(([day, count]) => ({ day, count }));
  };

  const calculateCategoryBreakdown = (products) => {
    const categories = {};
    products.forEach(product => {
      const cat = product.category || 'Other';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories).map(([category, count]) => ({ category, count }));
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-container">
      <h1>📈 Analytics & Reports</h1>

      {loading ? (
        <p>Loading analytics...</p>
      ) : (
        <>
          {/* Monthly Sales Chart */}
          {analytics.monthlySales.length > 0 && (
              <div className="analytics-card">
                <h3>💰 Monthly Revenue</h3>
                <div className="chart-container">
                  {analytics.monthlySales.map((item, idx) => (
                    <div key={idx} className="chart-bar">
                      <div className="bar">
                        <div 
                          className="bar-fill"
                          style={{
                            height: `${(item.amount / Math.max(...analytics.monthlySales.map(x => x.amount)) || 1) * 100}px`
                          }}
                        ></div>
                      </div>
                      <span className="bar-label">{item.month}</span>
                      <span className="bar-value">₹{(item.amount / 1000).toFixed(1)}K</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Products */}
            {analytics.topProducts.length > 0 && (
              <div className="analytics-card">
                <h3>🏆 Top Selling Products</h3>
                <div className="top-products">
                  {analytics.topProducts.map((product, idx) => (
                    <div key={idx} className="product-row">
                      <span className="rank">{idx + 1}</span>
                      <span className="name">{product.name}</span>
                      <span className="quantity">{product.quantity} sold</span>
                      <span className="amount">₹{product.sales.toLocaleString('en-IN')}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sales Trend */}
            {analytics.salesTrend.length > 0 && (
              <div className="analytics-card">
                <h3>📊 Recent Sales Trend</h3>
                <div className="trend-chart">
                  {analytics.salesTrend.map((item, idx) => (
                    <div key={idx} className="trend-bar">
                      <div 
                        className="trend-fill"
                        style={{
                          height: `${(item.count / Math.max(...analytics.salesTrend.map(x => x.count)) || 1) * 150}px`
                        }}
                      >
                        <span className="trend-count">{item.count}</span>
                      </div>
                      <span className="trend-label">{item.day}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Category Breakdown */}
            {analytics.categoryBreakdown.length > 0 && (
              <div className="analytics-card">
                <h3>📦 Products by Category</h3>
                <div className="category-list">
                  {analytics.categoryBreakdown.map((cat, idx) => {
                    const total = analytics.categoryBreakdown.reduce((sum, c) => sum + c.count, 0);
                    const percentage = ((cat.count / total) * 100).toFixed(1);
                    return (
                      <div key={idx} className="category-item">
                        <div className="category-info">
                          <span className="category-name">{cat.category}</span>
                          <span className="category-count">{cat.count} products</span>
                        </div>
                        <div className="progress-bar">
                          <div 
                            className="progress-fill"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="percentage">{percentage}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
        </>
        )}
      </div>
    );
  };

export default AdminAnalytics;
