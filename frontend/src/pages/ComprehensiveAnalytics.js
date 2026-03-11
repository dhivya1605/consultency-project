import React, { useState, useEffect } from 'react';
import { Bar, Scatter, Line, Pie } from 'react-chartjs-2';
import axios from 'axios';
import './ComprehensiveAnalytics.css';

const ComprehensiveAnalytics = () => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllAnalytics();
  }, []);

  const fetchAllAnalytics = async () => {
    try {
      const endpoints = [
        '/api/category-product-count',
        '/api/brand-product-distribution',
        '/api/price-analysis',
        '/api/stock-analysis',
        '/api/product-popularity',
        '/api/purchase-analysis',
        '/api/conversion-rate',
        '/api/rating-analysis',
        '/api/price-vs-purchase',
        '/api/brand-performance',
        '/api/category-sales-performance',
        '/api/kmeans-clustering',
        '/api/decision-tree-prediction'
      ];

      const results = await Promise.allSettled(
        endpoints.map(ep => axios.get(`http://localhost:5000${ep}`))
      );

      const newData = {};
      results.forEach((result, idx) => {
        if (result.status === 'fulfilled') {
          newData[endpoints[idx]] = result.value.data;
        }
      });

      setData(newData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading analytics...</div>;

  const categoryData = data['/api/category-product-count'];
  const brandData = data['/api/brand-product-distribution'];
  const priceData = data['/api/price-analysis'];
  const stockData = data['/api/stock-analysis'];
  const popularityData = data['/api/product-popularity'];
  const purchaseData = data['/api/purchase-analysis'];
  const conversionData = data['/api/conversion-rate'];
  const ratingData = data['/api/rating-analysis'];
  const scatterData = data['/api/price-vs-purchase'];
  const brandPerfData = data['/api/brand-performance'];
  const catSalesData = data['/api/category-sales-performance'];
  const clusterData = data['/api/kmeans-clustering'];
  const dtData = data['/api/decision-tree-prediction'];

  return (
    <div className="analytics-container">
      <h1>📊 Comprehensive Product Analytics</h1>

      {/* 1. Category-wise Product Analysis */}
      <section className="analysis-section">
        <h2>1️⃣ Category-wise Product Analysis</h2>
        <p className="insight">{categoryData?.insight}</p>
        {categoryData && (
          <Bar
            data={{
              labels: categoryData.labels,
              datasets: [{
                label: 'Product Count',
                data: categoryData.data,
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              }]
            }}
            options={{ responsive: true, plugins: { legend: { display: true } } }}
          />
        )}
      </section>

      {/* 2. Brand-wise Product Distribution */}
      <section className="analysis-section">
        <h2>2️⃣ Brand-wise Product Distribution</h2>
        <p className="insight">{brandData?.insight}</p>
        {brandData && (
          <Bar
            data={{
              labels: brandData.labels,
              datasets: [{
                label: 'Product Count',
                data: brandData.data,
                backgroundColor: 'rgba(153, 102, 255, 0.6)',
                borderColor: 'rgba(153, 102, 255, 1)',
                borderWidth: 1
              }]
            }}
            options={{ responsive: true, indexAxis: 'y' }}
          />
        )}
      </section>

      {/* 3. Price Analysis */}
      <section className="analysis-section">
        <h2>3️⃣ Price Analysis</h2>
        {priceData && (
          <div>
            <div className="price-stats">
              <div className="stat-card">
                <h3>Average Price</h3>
                <p className="stat-value">₹{priceData.avgPrice.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h3>Most Expensive</h3>
                <p className="stat-value">{priceData.maxPriceProduct}</p>
                <p>₹{priceData.maxPrice.toLocaleString()}</p>
              </div>
              <div className="stat-card">
                <h3>Cheapest</h3>
                <p className="stat-value">{priceData.minPriceProduct}</p>
                <p>₹{priceData.minPrice.toLocaleString()}</p>
              </div>
            </div>
            <Bar
              data={{
                labels: priceData.histogram.labels,
                datasets: [{
                  label: 'Product Count',
                  data: priceData.histogram.data,
                  backgroundColor: 'rgba(255, 159, 64, 0.6)',
                  borderColor: 'rgba(255, 159, 64, 1)',
                  borderWidth: 1
                }]
              }}
              options={{ responsive: true }}
            />
          </div>
        )}
      </section>

      {/* 4. Stock Analysis */}
      <section className="analysis-section">
        <h2>4️⃣ Stock Analysis (Low Stock Products)</h2>
        {stockData && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Stock Units</th>
              </tr>
            </thead>
            <tbody>
              {stockData.lowStockProducts.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td className="low-stock">{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 5. Product Popularity */}
      <section className="analysis-section">
        <h2>5️⃣ Product Popularity (Most Viewed)</h2>
        {popularityData && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Views</th>
              </tr>
            </thead>
            <tbody>
              {popularityData.topViewed.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.views}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 6. Purchase Analysis */}
      <section className="analysis-section">
        <h2>6️⃣ Purchase Analysis (Top Selling)</h2>
        {purchaseData && (
          <Bar
            data={{
              labels: purchaseData.topSold.map(p => p.name.substring(0, 15)),
              datasets: [{
                label: 'Purchases',
                data: purchaseData.topSold.map(p => p.purchases),
                backgroundColor: 'rgba(54, 162, 235, 0.6)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 1
              }]
            }}
            options={{ responsive: true, indexAxis: 'y' }}
          />
        )}
      </section>

      {/* 7. Conversion Rate Analysis */}
      <section className="analysis-section">
        <h2>7️⃣ Conversion Rate Analysis</h2>
        {conversionData && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Views</th>
                <th>Purchases</th>
                <th>Conversion Rate</th>
              </tr>
            </thead>
            <tbody>
              {conversionData.conversionData.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td>{item.views}</td>
                  <td>{item.purchases}</td>
                  <td className="conversion-rate">{item.conversionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 8. Rating Analysis */}
      <section className="analysis-section">
        <h2>8️⃣ Rating Analysis</h2>
        {ratingData && (
          <div>
            <div className="rating-card">
              <h3>Highest Rated Product</h3>
              <p className="product-name">{ratingData.highestRatedProduct}</p>
              <p className="rating-value">⭐ {ratingData.highestRating}</p>
            </div>
            <Bar
              data={{
                labels: ratingData.categoryRatings.labels,
                datasets: [{
                  label: 'Average Rating',
                  data: ratingData.categoryRatings.data,
                  backgroundColor: 'rgba(255, 206, 86, 0.6)',
                  borderColor: 'rgba(255, 206, 86, 1)',
                  borderWidth: 1
                }]
              }}
              options={{ responsive: true, scales: { y: { max: 5 } } }}
            />
          </div>
        )}
      </section>

      {/* 9. Price vs Purchase Analysis */}
      <section className="analysis-section">
        <h2>9️⃣ Price vs Purchase Analysis</h2>
        {scatterData && (
          <Scatter
            data={{
              datasets: [{
                label: 'Products',
                data: scatterData.scatterData.map(p => ({
                  x: p.price,
                  y: p.purchases
                })),
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
              }]
            }}
            options={{
              responsive: true,
              scales: {
                x: { title: { display: true, text: 'Price (₹)' } },
                y: { title: { display: true, text: 'Purchases' } }
              }
            }}
          />
        )}
      </section>

      {/* 10. Brand Performance */}
      <section className="analysis-section">
        <h2>🔟 Brand Performance Analysis</h2>
        {brandPerfData && (
          <table className="data-table">
            <thead>
              <tr>
                <th>Brand</th>
                <th>Total Purchases</th>
                <th>Total Views</th>
                <th>Avg Rating</th>
              </tr>
            </thead>
            <tbody>
              {brandPerfData.brandPerformance.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.brand}</td>
                  <td>{item.totalPurchases}</td>
                  <td>{item.totalViews}</td>
                  <td>⭐ {item.avgRating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* 11. Category Sales Performance */}
      <section className="analysis-section">
        <h2>1️⃣1️⃣ Category Sales Performance</h2>
        {catSalesData && (
          <Pie
            data={{
              labels: catSalesData.labels,
              datasets: [{
                data: catSalesData.data,
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
            }}
            options={{ responsive: true }}
          />
        )}
      </section>

      {/* 12. ML Clustering */}
      <section className="analysis-section">
        <h2>1️⃣2️⃣ ML Clustering Analysis (K-Means)</h2>
        {clusterData && (
          <div className="cluster-grid">
            {clusterData.clusters.map((cluster, idx) => (
              <div key={idx} className="cluster-card">
                <h3>{cluster.cluster}</h3>
                <p><strong>Products:</strong> {cluster.productCount}</p>
                <p><strong>Avg Price:</strong> ₹{cluster.avgPrice.toLocaleString()}</p>
                <p><strong>Avg Purchases:</strong> {cluster.avgPurchases.toFixed(0)}</p>
                <p><strong>Avg Rating:</strong> ⭐ {cluster.avgRating.toFixed(2)}</p>
                <p><strong>Top Product:</strong> {cluster.topProduct}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Decision Tree Prediction */}
      <section className="analysis-section">
        <h2>🌳 Decision Tree Prediction</h2>
        {dtData && (
          <div className="dt-stats">
            <div className="stat-card">
              <h3>Model Accuracy</h3>
              <p className="stat-value">{(dtData.accuracy * 100).toFixed(1)}%</p>
            </div>
            <div className="stat-card">
              <h3>High Sales Products</h3>
              <p className="stat-value">{dtData.highSalesProducts}</p>
            </div>
            <div className="stat-card">
              <h3>Low Sales Products</h3>
              <p className="stat-value">{dtData.lowSalesProducts}</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default ComprehensiveAnalytics;
