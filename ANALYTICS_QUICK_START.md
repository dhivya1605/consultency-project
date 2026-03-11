# 🚀 Quick Start Guide - Comprehensive Analytics

## Prerequisites
- Node.js v14+
- Python 3.8+
- MongoDB (local or cloud)

## Installation

### 1. Backend Setup
```bash
cd backend
npm install
```

Create `.env`:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
ML_API_URL=http://localhost:8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
```

### 3. ML Models Setup
```bash
cd ml_models
pip install -r requirements.txt
```

---

## Running All Services

### Terminal 1: Start ML API (Port 8000)
```bash
cd ml_models
python api/app.py
```

Expected output:
```
 * Running on http://0.0.0.0:8000
```

### Terminal 2: Start Backend (Port 5000)
```bash
cd backend
npm run dev
```

Expected output:
```
Server running on port 5000
```

### Terminal 3: Start Frontend (Port 3000)
```bash
cd frontend
npm start
```

Expected output:
```
Compiled successfully!
You can now view the app in the browser.
```

---

## Accessing the Analytics

1. Open browser: `http://localhost:3000`
2. Click "Analytics" in navigation menu
3. All 12 analyses load automatically

---

## 12 Analyses Available

| # | Analysis | Endpoint | Visualization |
|---|----------|----------|---------------|
| 1 | Category Products | `/api/category-product-count` | Bar Chart |
| 2 | Brand Distribution | `/api/brand-product-distribution` | Bar Chart |
| 3 | Price Analysis | `/api/price-analysis` | Histogram |
| 4 | Stock Analysis | `/api/stock-analysis` | Table |
| 5 | Product Popularity | `/api/product-popularity` | Table |
| 6 | Purchase Analysis | `/api/purchase-analysis` | Bar Chart |
| 7 | Conversion Rate | `/api/conversion-rate` | Table |
| 8 | Rating Analysis | `/api/rating-analysis` | Chart |
| 9 | Price vs Purchase | `/api/price-vs-purchase` | Scatter Plot |
| 10 | Brand Performance | `/api/brand-performance` | Table |
| 11 | Category Sales | `/api/category-sales-performance` | Pie Chart |
| 12 | K-Means Clustering | `/api/kmeans-clustering` | Cards |
| 13 | Decision Tree | `/api/decision-tree-prediction` | Cards |

---

## Testing Individual Endpoints

### Using curl:
```bash
# Category Analysis
curl http://localhost:5000/api/category-product-count

# Brand Distribution
curl http://localhost:5000/api/brand-product-distribution

# Price Analysis
curl http://localhost:5000/api/price-analysis

# Stock Analysis
curl http://localhost:5000/api/stock-analysis

# Product Popularity
curl http://localhost:5000/api/product-popularity

# Purchase Analysis
curl http://localhost:5000/api/purchase-analysis

# Conversion Rate
curl http://localhost:5000/api/conversion-rate

# Rating Analysis
curl http://localhost:5000/api/rating-analysis

# Price vs Purchase
curl http://localhost:5000/api/price-vs-purchase

# Brand Performance
curl http://localhost:5000/api/brand-performance

# Category Sales
curl http://localhost:5000/api/category-sales-performance

# K-Means Clustering
curl http://localhost:5000/api/kmeans-clustering

# Decision Tree
curl http://localhost:5000/api/decision-tree-prediction
```

---

## Troubleshooting

### ML API not responding
```bash
# Check if port 8000 is in use
netstat -an | grep 8000

# Kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

### Backend connection error
```bash
# Verify MongoDB is running
mongod

# Check backend logs for errors
npm run dev
```

### Frontend not loading charts
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# Check console for errors
# Open DevTools: F12
```

### Synthetic data not generating
```bash
# Ensure Excel file path is correct in app.py
# Or let it auto-generate synthetic data
# Check ml_models/api/app.py line 15
```

---

## File Structure

```
consultancy-project/
├── backend/
│   ├── models/
│   ├── controllers/
│   ├── routes/
│   ├── server.js
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── ComprehensiveAnalytics.js (NEW)
│   │   │   ├── ComprehensiveAnalytics.css (NEW)
│   │   │   └── Reports.js
│   │   ├── components/
│   │   │   └── Navigation.js (UPDATED)
│   │   └── App.js (UPDATED)
│   └── package.json
│
└── ml_models/
    ├── api/
    │   └── app.py (UPDATED with 13 endpoints)
    ├── requirements.txt
    └── README.md
```

---

## Key Features

✅ **13 ML Endpoints** - All analyses available via REST API
✅ **Real-time Visualizations** - Charts update automatically
✅ **Responsive Design** - Works on desktop, tablet, mobile
✅ **Error Handling** - Graceful fallbacks if API fails
✅ **Synthetic Data** - Auto-generates if Excel not found
✅ **ML Models** - Linear Regression, K-Means, Decision Tree

---

## Performance Tips

1. **First Load:** May take 5-10 seconds to fetch all 13 endpoints
2. **Caching:** Browser caches data for faster subsequent loads
3. **Large Dataset:** If using 1000+ products, consider pagination
4. **ML Models:** Retrain periodically with new data

---

## Next Steps

1. ✅ Run all 3 servers
2. ✅ Navigate to `/analytics`
3. ✅ Explore all 12 analyses
4. ✅ Check COMPREHENSIVE_ANALYTICS_GUIDE.md for details
5. ✅ Use insights for business decisions

---

## Support

For issues:
1. Check TROUBLESHOOTING_CHARTS.md
2. Check COMPREHENSIVE_ANALYTICS_GUIDE.md
3. Review console logs (F12)
4. Verify all 3 servers are running

---

**Happy Analyzing! 📊**
