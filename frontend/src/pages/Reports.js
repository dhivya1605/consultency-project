import React, { useEffect, useState } from 'react';
import { Pie, Bar, Line, Doughnut, Scatter } from 'react-chartjs-2';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import './Reports.css';

import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  ArcElement,
  BarElement,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

function Reports() {
  const { user } = useAuth();
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        const endpoints = [
          'http://localhost:5000/api/ml/analytics',
          'http://localhost:5000/api/ml/ml-demand-prediction',
          'http://localhost:5000/api/ml/category-analysis',
          'http://localhost:5000/api/ml/brand-analysis',
          'http://localhost:5000/api/ml/top-products',
          'http://localhost:5000/api/ml/price-distribution',
          'http://localhost:5000/api/ml/rating-distribution',
          'http://localhost:5000/api/ml/next-month-forecast',
          'http://localhost:5000/api/ml/category-product-count',
          'http://localhost:5000/api/ml/brand-product-distribution',
          'http://localhost:5000/api/ml/price-analysis',
          'http://localhost:5000/api/ml/stock-analysis',
          'http://localhost:5000/api/ml/product-popularity',
          'http://localhost:5000/api/ml/purchase-analysis',
          'http://localhost:5000/api/ml/conversion-rate',
          'http://localhost:5000/api/ml/rating-analysis',
          'http://localhost:5000/api/ml/price-vs-purchase',
          'http://localhost:5000/api/ml/brand-performance',
          'http://localhost:5000/api/ml/category-sales-performance',
          'http://localhost:5000/api/ml/kmeans-clustering',
          'http://localhost:5000/api/ml/decision-tree-prediction'
        ];

        const responses = await Promise.allSettled(endpoints.map(ep => axios.get(ep)));
        const newData = {};

        responses.forEach((response, idx) => {
          if (response.status === 'fulfilled') {
            newData[`data${idx}`] = response.value.data;
          }
        });

        setData(newData);
        setError(null);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [user]);

  if (!user) {
    return (
      <div className="reports-container">
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em' }}>
          <p>🔒 Please login to access analytics</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="reports-container">
        <div style={{ textAlign: 'center', padding: '50px', fontSize: '1.2em', color: '#d32f2f' }}>
          <p>❌ Access Denied</p>
          <p>Only administrators can view analytics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="reports-container"><p>⏳ Loading analytics...</p></div>;
  }

  const cardStyle = {
    background: 'linear-gradient(135deg, #1a3a52 0%, #2d5a80 100%)',
    color: 'white',
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 8px 16px rgba(26, 58, 82, 0.2)',
    marginBottom: '15px'
  };

  const valueStyle = {
    fontSize: '2rem',
    fontWeight: 'bold',
    margin: '0',
    color: '#ffd700'
  };

  return (
    <div className="reports-container">
      <h1>📊 Analytics Dashboard </h1>

      {/* PREVIOUS 8 ANALYSES */}
      
      {/* Forecast */}
      {data.data7 && (
        <div className="chart-section">
          <h2>📈 Next Month Sales Forecast</h2>
          <div className="prediction-cards">
            <div style={cardStyle}>
              <h3>Current Month Sales</h3>
              <p style={valueStyle}>₹{Math.round(data.data7.currentMonthSales * 83)}</p>
            </div>
            <div style={cardStyle}>
              <h3>Forecasted Next Month</h3>
              <p style={valueStyle}>₹{Math.round(data.data7.nextMonthForecast * 83)}</p>
            </div>
            <div style={cardStyle}>
              <h3>Growth Rate</h3>
              <p style={{...valueStyle, color: '#4CAF50'}}>📈 {data.data7.growthRate}</p>
            </div>
            <div style={cardStyle}>
              <h3>Model Confidence</h3>
              <p style={valueStyle}>{(parseFloat(data.data7.confidence) * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Category Distribution */}
      {data.data0?.pie?.labels && (
        <div className="chart-section">
          <h2>📊 Category Distribution</h2>
          <div style={{ position: 'relative', height: '400px' }}>
            <Pie data={data.data0.pie} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      {/* Average Price by Category */}
      {data.data0?.bar?.labels && (
        <div className="chart-section">
          <h2>💰 Average Price by Category</h2>
          <div style={{ position: 'relative', height: '400px' }}>
            <Bar data={data.data0.bar} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      {/* Monthly Sales Trend */}
      {data.data0?.line?.labels && (
        <div className="chart-section">
          <h2>📈 Monthly Sales Trend</h2>
          <div style={{ position: 'relative', height: '400px' }}>
            <Line data={data.data0.line} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      {/* Price Distribution */}
      {data.data5?.ranges && (
        <div className="chart-section">
          <h2>💵 Price Range Distribution</h2>
          <div style={{ position: 'relative', height: '400px' }}>
            <Bar data={{
              labels: data.data5.ranges,
              datasets: [{
                label: 'Number of Products',
                data: data.data5.counts,
                backgroundColor: 'rgba(153, 102, 255, 0.2)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
              }]
            }} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      )}



      {/* Top Products */}
      {data.data4?.topProducts && (
        <div className="chart-section">
          <h2>🏆 Top 15 Best Selling Products</h2>
          <table className="products-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Sales</th>
                <th>Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.data4.topProducts.map((product, idx) => (
                <tr key={idx}>
                  <td>{product.name}</td>
                  <td>{product.category}</td>
                  <td>₹{Math.round(product.price)}</td>
                  <td>{product.sales}</td>
                  <td>⭐ {product.rating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Category Analysis */}
      {data.data2?.categories && (
        <div className="chart-section">
          <h2>📋 Category Analysis</h2>
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Avg Price</th>
                <th>Min Price</th>
                <th>Max Price</th>
                <th>Total Sales</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.data2.categories.map((cat, idx) => (
                <tr key={idx}>
                  <td>{cat.category}</td>
                  <td>₹{Math.round(cat.avgPrice)}</td>
                  <td>₹{Math.round(cat.minPrice)}</td>
                  <td>₹{Math.round(cat.maxPrice)}</td>
                  <td>{cat.totalSales}</td>
                  <td>⭐ {cat.avgRating.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Brand Analysis */}
      {data.data3?.brands && (
        <div className="chart-section">
          <h2>🏢 Top Brands Performance</h2>
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Total Sales</th>
                <th>Avg Rating</th>
                <th>Avg Price</th>
              </tr>
            </thead>
            <tbody>
              {data.data3.brands.map((brand, idx) => (
                <tr key={idx}>
                  <td>{brand.brand}</td>
                  <td>{brand.totalSales}</td>
                  <td>⭐ {brand.avgRating.toFixed(1)}</td>
                  <td>₹{Math.round(brand.avgPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ML Predictions */}
      {data.data1?.results && (
        <div className="chart-section">
          <h2>🎯 ML Demand Predictions (Top 10)</h2>
          <div className="metrics">
            <div className="metric">
              <span>Model Accuracy (R²):</span>
              <strong>{(data.data1.accuracy * 100).toFixed(1)}%</strong>
            </div>
            <div className="metric">
              <span>RMSE:</span>
              <strong>{data.data1.rmse}</strong>
            </div>
          </div>
          <table className="predictions-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Category</th>
                <th>Price</th>
                <th>Actual Sales</th>
                <th>Predicted Sales</th>
              </tr>
            </thead>
            <tbody>
              {data.data1.results.slice(0, 10).map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>₹{Math.round(item.price)}</td>
                  <td>{Math.round(item.actual)}</td>
                  <td className="positive">{Math.round(item.predicted)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

     

      {/* 1. Category Product Count */}
      {data.data8?.labels && (
        <div className="chart-section">
          <h2>1️⃣ Category-wise Product Count</h2>
          <p className="insight">{data.data8.insight}</p>
          <div style={{ position: 'relative', height: '400px' }}>
            <Bar data={{
              labels: data.data8.labels,
              datasets: [{
                label: 'Product Count',
                data: data.data8.data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              }]
            }} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      {/* 2. Brand Product Distribution */}
      {data.data9?.labels && (
        <div className="chart-section">
          <h2>2️⃣ Brand-wise Product Distribution</h2>
          <p className="insight">{data.data9.insight}</p>
          <div style={{ position: 'relative', height: '400px' }}>
            <Bar data={{
              labels: data.data9.labels,
              datasets: [{
                label: 'Product Count',
                data: data.data9.data,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
              }]
            }} options={{ maintainAspectRatio: false, indexAxis: 'y' }} />
          </div>
        </div>
      )}

      {/* 3. Price Analysis */}
      {data.data10 && (
        <div className="chart-section">
          <h2>3️⃣ Price Analysis</h2>
          <div className="price-stats">
            <div style={cardStyle}>
              <h3>Average Price</h3>
              <p style={valueStyle}>₹{Math.round(data.data10.avgPrice)}</p>
            </div>
            <div style={cardStyle}>
              <h3>Most Expensive</h3>
              <p style={{...valueStyle, fontSize: '1.2rem'}}>{data.data10.maxPriceProduct}</p>
              <p style={{color: '#ffd700'}}>₹{Math.round(data.data10.maxPrice)}</p>
            </div>
            <div style={cardStyle}>
              <h3>Cheapest</h3>
              <p style={{...valueStyle, fontSize: '1.2rem'}}>{data.data10.minPriceProduct}</p>
              <p style={{color: '#ffd700'}}>₹{Math.round(data.data10.minPrice)}</p>
            </div>
          </div>
          {data.data10.histogram && (
            <div style={{ position: 'relative', height: '400px', marginTop: '20px' }}>
              <Bar data={{
                labels: data.data10.histogram.labels,
                datasets: [{
                  label: 'Product Count',
                  data: data.data10.histogram.data,
                  backgroundColor: 'rgba(255, 159, 64, 0.6)',
                  borderColor: 'rgba(255, 159, 64, 1)',
                  borderWidth: 1
                }]
              }} options={{ maintainAspectRatio: false }} />
            </div>
          )}
        </div>
      )}

      {/* 4. Stock Analysis */}
      {data.data11?.lowStockProducts && (
        <div className="chart-section">
          <h2>4️⃣ Stock Analysis (Low Stock Products)</h2>
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Stock Units</th>
              </tr>
            </thead>
            <tbody>
              {data.data11.lowStockProducts.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td className="low-stock">⚠️ {item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 5. Product Popularity */}
      {data.data12?.topViewed && (
        <div className="chart-section">
          <h2>5️⃣ Product Popularity (Most Viewed)</h2>
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {data.data12.topViewed.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>👀 {item.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 6. Purchase Analysis */}
      {data.data13?.topSold && (
        <div className="chart-section">
          <h2>6️⃣ Purchase Analysis (Top Selling)</h2>
          <div style={{ position: 'relative', height: '400px' }}>
            <Bar data={{
              labels: data.data13.topSold.map(p => p.name.substring(0, 15)),
              datasets: [{
                label: 'Purchases',
                data: data.data13.topSold.map(p => p.purchases),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }]
            }} options={{ maintainAspectRatio: false, indexAxis: 'y' }} />
          </div>
        </div>
      )}

      {/* 7. Conversion Rate */}
      {data.data14?.conversionData && (
        <div className="chart-section">
          <h2>7️⃣ Conversion Rate Analysis</h2>
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Views</th>
                <th>Purchases</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.data14.conversionData.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.views}</td>
                  <td>{item.purchases}</td>
                  <td className="positive">✅ {item.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 8. Rating Analysis */}
      {data.data15 && (
        <div className="chart-section">
          <h2>8️⃣ Rating Analysis</h2>
          <div style={cardStyle}>
            <h3>Highest Rated Product</h3>
            <p style={{...valueStyle, fontSize: '1.3rem'}}>{data.data15.highestRatedProduct}</p>
            <p style={{color: '#ffd700', fontSize: '1.5rem'}}>⭐ {data.data15.highestRating}</p>
          </div>
          {data.data15.categoryRatings && (
            <div style={{ position: 'relative', height: '400px', marginTop: '20px' }}>
              <Bar data={{
                labels: data.data15.categoryRatings.labels,
                datasets: [{
                  label: 'Average Rating',
                  data: data.data15.categoryRatings.data,
                  backgroundColor: 'rgba(255, 206, 86, 0.6)',
                  borderColor: 'rgba(255, 206, 86, 1)',
                  borderWidth: 1
                }]
              }} options={{ maintainAspectRatio: false, scales: { y: { max: 5 } } }} />
            </div>
          )}
        </div>
      )}

      {/* 9. Price vs Purchase */}
      {data.data16?.scatterData && (
        <div className="chart-section">
          <h2>9️⃣ Price vs Purchase Analysis</h2>
          <div style={{ position: 'relative', height: '400px' }}>
            <Scatter data={{
              datasets: [{
                label: 'Products',
                data: data.data16.scatterData.map(p => ({
                  x: p.price,
                  y: p.purchases
                })),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              }]
            }} options={{
              maintainAspectRatio: false,
              scales: {
                x: { title: { display: true, text: 'Price (₹)' } },
                y: { title: { display: true, text: 'Purchases' } }
              }
            }} />
          </div>
        </div>
      )}

      {/* 10. Brand Performance */}
      {data.data17?.brandPerformance && (
        <div className="chart-section">
          <h2>🔟 Brand Performance Analysis</h2>
          <table className="analysis-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Total Purchases</th>
                <th>Total Views</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {data.data17.brandPerformance.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.brand}</td>
                  <td>{item.totalPurchases}</td>
                  <td>{item.totalViews}</td>
                  <td>⭐ {item.avgRating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 11. Category Sales Performance */}
      {data.data18?.labels && (
        <div className="chart-section">
          <h2>1️⃣1️⃣ Category Sales Performance</h2>
          <div style={{ position: 'relative', height: '400px' }}>
            <Pie data={{
              labels: data.data18.labels,
              datasets: [{
                data: data.data18.data,
                backgroundColor: [
                  'rgba(255, 99, 132, 0.6)',
                  'rgba(54, 162, 235, 0.6)',
                  'rgba(255, 206, 86, 0.6)',
                  'rgba(75, 192, 192, 0.6)',
                  'rgba(153, 102, 255, 0.6)',
                  'rgba(255, 159, 64, 0.6)',
                  'rgba(199, 199, 199, 0.6)'
                ]
              }]
            }} options={{ maintainAspectRatio: false }} />
          </div>
        </div>
      )}

      {/* 12. K-Means Clustering */}
      {data.data19?.clusters && (
        <div className="chart-section">
          <h2>1️⃣2️⃣ ML Clustering Analysis (K-Means)</h2>
          <div className="cluster-grid">
            {data.data19.clusters.map((cluster, idx) => (
              <div key={idx} style={cardStyle}>
                <h3>{cluster.cluster}</h3>
                <p><strong>Products:</strong> {cluster.productCount}</p>
                <p><strong>Avg Price:</strong> ₹{Math.round(cluster.avgPrice)}</p>
                <p><strong>Avg Purchases:</strong> {Math.round(cluster.avgPurchases)}</p>
                <p><strong>Avg Rating:</strong> ⭐ {cluster.avgRating.toFixed(2)}</p>
                <p><strong>Top Product:</strong> {cluster.topProduct}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 13. Decision Tree */}
      {data.data20 && (
        <div className="chart-section">
          <h2>🌳 Sales Performance Prediction</h2>
          <div className="prediction-cards">
            <div style={cardStyle}>
              <h3>Model Accuracy</h3>
              <p style={valueStyle}>{(data.data20.accuracy * 100).toFixed(1)}%</p>
            </div>
            <div style={cardStyle}>
              <h3>High Sales Products</h3>
              <p style={valueStyle}>{data.data20.highSalesProducts}</p>
            </div>
            <div style={cardStyle}>
              <h3>Low Sales Products</h3>
              <p style={valueStyle}>{data.data20.lowSalesProducts}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
