import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import '../components/AdminPages.css';

const Reports = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReportData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiCall.get('/admin/sales-report', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReportData(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('Failed to load report data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchReportData();
  }, [user, navigate, fetchReportData]);

  if (user?.role !== 'admin') {
    return null;
  }

  const now = new Date();
  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const nextMonthDate = new Date();
  nextMonthDate.setMonth(now.getMonth() + 1);
  const nextMonthName = nextMonthDate.toLocaleString('default', { month: 'long' });

  const getCurrentMonthRevenue = () => {
    if (!reportData?.monthlySales) return 0;
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    const data = reportData.monthlySales.find(m => m._id.year === currentYear && m._id.month === currentMonth);
    return data ? data.totalSales : 0;
  };

  const currentMonthRevenue = getCurrentMonthRevenue();

  return (
    <div className="admin-container">
      <div className="admin-header-flex">
        <h1>📊 Sales & Business Reports</h1>
        <button onClick={fetchReportData} className="refresh-btn">Refresh Data</button>
      </div>

      {loading ? (
        <div className="loading-state">
          <p>Generating comprehensive reports...</p>
        </div>
      ) : error ? (
        <div className="error-card">
          <p>{error}</p>
          <button onClick={fetchReportData} className="retry-btn">Retry</button>
        </div>
      ) : (
        <>
          {/* Executive Summary Metrics */}
          <div className="prediction-section">
            <h2>📈 Executive Summary</h2>
            <div className="prediction-cards">
              <div className="prediction-card" style={{background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)'}}>
                <h3>{currentMonthName} Revenue</h3>
                <p className="prediction-value">₹{currentMonthRevenue.toLocaleString('en-IN')}</p>
                <span className="prediction-label">Monthly volume tracking</span>
              </div>
              <div className="prediction-card" style={{background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)'}}>
                <h3>Total Revenue</h3>
                <p className="prediction-value">₹{reportData.totalSales?.toLocaleString('en-IN')}</p>
                <span className="prediction-label">All-time sales volume</span>
              </div>
              {reportData.prediction && (
                <>
                  <div className="prediction-card" style={{background: 'linear-gradient(135deg, #2e1065 0%, #4c1d95 100%)'}}>
                    <h3>{nextMonthName} Forecast</h3>
                    <p className="prediction-value">₹{Math.round(reportData.prediction.prediction).toLocaleString('en-IN')}</p>
                    <span className="prediction-label">AI Predictions</span>
                  </div>
                  <div className="prediction-card" style={{background: 'linear-gradient(135deg, #164e63 0%, #155e75 100%)'}}>
                    <h3>Trend Analysis</h3>
                    <p className="prediction-value" style={{textTransform: 'capitalize'}}>
                      {reportData.prediction.trend === 'upward' ? '📈 Upward' : '📉 Downward'}
                    </p>
                    <span className="prediction-label">{Math.round(reportData.prediction.confidence * 100)}% Confidence Score</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Monthly Sales Performance */}
          <div className="analytics-card">
            <h3>📅 Monthly Sales Performance</h3>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>No. of Orders</th>
                    <th>Total Revenue</th>
                    <th>Avg. Order Value</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.monthlySales?.map((monthData, index) => {
                    const monthName = new Date(monthData._id.year, monthData._id.month - 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
                    const avgValue = monthData.totalSales / monthData.orderCount;
                    return (
                      <tr key={index}>
                        <td className="name">{monthName}</td>
                        <td>{monthData.orderCount}</td>
                        <td className="amount">₹{monthData.totalSales.toLocaleString('en-IN')}</td>
                        <td>₹{avgValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Product Performance Table */}
          <div className="analytics-card">
            <h3>📦 Product Performance Analysis</h3>
            <div className="users-table">
              <table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Units Sold</th>
                    <th>Revenue Generated</th>
                    <th>Contribution</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.productSales?.map((product, index) => {
                    const contribution = ((product.amount / reportData.totalSales) * 100).toFixed(1);
                    return (
                      <tr key={index}>
                        <td className="name">{product.name}</td>
                        <td>{product.quantity}</td>
                        <td className="amount">₹{product.amount.toLocaleString('en-IN')}</td>
                        <td>
                          <div className="progress-bar" style={{height: '10px', width: '100px', display: 'inline-block', marginRight: '10px'}}>
                            <div className="progress-fill" style={{width: `${contribution}%`}}></div>
                          </div>
                          <span className="percentage">{contribution}%</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Insights Section */}
          <div className="analytics-card">
             <h3>💡 Business Insights</h3>
             <div className="insights-grid">
                <div className="insight-item">
                    <h4>Top Performer</h4>
                    <p>{reportData.chartData?.topProduct ? `${reportData.chartData.topProduct[0]} (₹${reportData.chartData.topProduct[1].toLocaleString('en-IN')})` : 'N/A'}</p>
                </div>
                <div className="insight-item">
                    <h4>Inventory Diversity</h4>
                    <p>{reportData.chartData?.totalProducts || 0} unique products sold</p>
                </div>
             </div>
          </div>
        </>
      )}

      <style jsx="true">{`
        .admin-header-flex {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .refresh-btn {
          background: #1a3a52;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.2s;
        }
        .refresh-btn:hover {
          background: #2d5a80;
          transform: translateY(-2px);
        }
        .loading-state {
          text-align: center;
          padding: 3rem;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .error-card {
           background: #fee2e2;
           color: #991b1b;
           padding: 2rem;
           border-radius: 8px;
           text-align: center;
        }
        .retry-btn {
          margin-top: 1rem;
          background: #991b1b;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        .prediction-label {
          font-size: 0.8rem;
          opacity: 0.8;
          display: block;
          margin-top: 5px;
        }
        .insights-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
        }
        .insight-item {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 8px;
          border-left: 4px solid #1a3a52;
        }
        .insight-item h4 {
          margin: 0 0 0.5rem 0;
          color: #64748b;
          font-size: 0.9rem;
          text-transform: uppercase;
        }
        .insight-item p {
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #1a1a2e;
        }
      `}</style>
    </div>
  );
};

export default Reports;
