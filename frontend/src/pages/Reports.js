import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import '../components/AdminPages.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

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
              <div className="prediction-card" style={{background: 'linear-gradient(135deg, #1a3a52 0%, #2d5a80 100%)'}}>
                <h3>{currentMonthName} Revenue</h3>
                <p className="prediction-value">₹{currentMonthRevenue.toLocaleString('en-IN')}</p>
                <span className="prediction-label">Monthly volume tracking</span>
              </div>
              <div className="prediction-card" style={{background: 'linear-gradient(135deg, #1a3a52 0%, #2d5a80 100%)'}}>
                <h3>Total Revenue</h3>
                <p className="prediction-value">₹{reportData.totalSales?.toLocaleString('en-IN')}</p>
                <span className="prediction-label">All-time sales volume</span>
              </div>
              {reportData.prediction && (
                <>
                  <div className="prediction-card" style={{background: 'linear-gradient(135deg, #1a3a52 0%, #2d5a80 100%)'}}>
                    <h3>{nextMonthName} Forecast</h3>
                    <p className="prediction-value">₹{Math.round(reportData.prediction.prediction).toLocaleString('en-IN')}</p>
                    <span className="prediction-label">AI Predictions</span>
                  </div>
                  <div className="prediction-card" style={{background: 'linear-gradient(135deg, #1a3a52 0%, #2d5a80 100%)'}}>
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

          {/* Graphical Analytics (Moved to End) */}
          <div className="analytics-section-end">
            <div className="report-chart-card featured-chart">
              <div className="chart-header">
                <h3>🏆 Product Revenue Performance</h3>
                <p>Top 5 products by total sales value</p>
              </div>
              <div className="chart-main" style={{ height: '400px' }}>
                <Bar 
                  data={{
                    labels: reportData.productSales?.slice(0, 5).map(p => p.name) || [],
                    datasets: [{
                      label: 'Revenue',
                      data: reportData.productSales?.slice(0, 5).map(p => p.amount) || [],
                      backgroundColor: 'rgba(26, 58, 82, 0.9)',
                      hoverBackgroundColor: '#1a3a52',
                      borderRadius: 4,
                      barThickness: 28
                    }]
                  }}
                  options={{
                    indexAxis: 'y',
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: {
                        backgroundColor: '#1e293b',
                        padding: 12,
                        titleFont: { size: 14, weight: '600' },
                        bodyFont: { size: 13 },
                        callbacks: {
                          label: (item) => ` Revenue: ₹${item.raw.toLocaleString('en-IN')}`
                        }
                      }
                    },
                    scales: {
                      x: {
                        grid: { color: '#f1f5f9', drawBorder: false },
                        ticks: {
                          callback: (value) => `₹${(value/1000).toFixed(0)}k`,
                          font: { size: 11, weight: '500' },
                          color: '#64748b'
                        }
                      },
                      y: {
                        grid: { display: false },
                        ticks: {
                          font: { size: 12, weight: '600' },
                          color: '#1a3a52',
                          callback: function(value) {
                            const label = this.getLabelForValue(value);
                            return label.length > 25 ? label.substring(0, 22) + '...' : label;
                          }
                        }
                      }
                    },
                    layout: {
                      padding: { left: 10, right: 30, top: 10, bottom: 10 }
                    }
                  }}
                />
              </div>
            </div>

            <div className="analytics-charts-grid">
              <div className="report-chart-card">
                <div className="chart-header">
                  <h3>🏷️ Sales Distribution by Brand</h3>
                </div>
                <div className="chart-main" style={{ height: '320px' }}>
                  <Pie 
                    data={{
                      labels: reportData.brandSales?.slice(0, 5).map(b => b.name || 'Unknown') || [],
                      datasets: [{
                        data: reportData.brandSales?.slice(0, 5).map(b => b.amount) || [],
                        backgroundColor: [
                          '#1a3a52', // Navy
                          '#3b82f6', // Blue
                          '#10b981', // Emerald
                          '#f59e0b', // Amber
                          '#6366f1'  // Indigo
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff'
                      }]
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { 
                          position: 'bottom', 
                          labels: { 
                            usePointStyle: true,
                            pointStyle: 'circle',
                            padding: 20,
                            font: { size: 12, weight: '500' }
                          } 
                        },
                        tooltip: {
                          backgroundColor: '#1e293b',
                          padding: 12
                        }
                      }
                    }}
                  />
                </div>
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
        .analytics-section-end {
          margin-top: 2rem;
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .report-chart-card {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }
        .chart-header {
          margin-bottom: 2rem;
        }
        .chart-header h3 {
          margin: 0;
          color: #1a3a52;
          font-size: 1.25rem;
          font-weight: 700;
        }
        .chart-header p {
          margin: 0.25rem 0 0 0;
          color: #64748b;
          font-size: 0.875rem;
        }
        .analytics-charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 2rem;
        }
        @media (max-width: 1024px) {
          .analytics-charts-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Reports;
