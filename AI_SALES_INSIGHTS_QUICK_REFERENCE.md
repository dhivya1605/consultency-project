# 🚀 ML Integration - Quick Reference

## Start All Services

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Flask ML API
cd mlproject
python flask_app.py

# Terminal 3 - React Frontend
cd frontend
npm start
```

## Access Points

| Service | URL | Port |
|---------|-----|------|
| React Dashboard | http://localhost:3000 | 3000 |
| Flask ML API | http://localhost:5001 | 5001 |
| Backend API | http://localhost:5000 | 5000 |
| MongoDB | mongodb://localhost:27017 | 27017 |

## Navigation

1. **Admin Dashboard:** http://localhost:3000/admin
2. **AI Sales Insights:** http://localhost:3000/ai-sales-insights
3. **Alternative:** Click "🤖 AI Sales Insights" button in dashboard

## Key Files

### React Components
```
frontend/src/pages/AnalyticsPage.jsx       # Main analytics component
frontend/src/App.js                         # Routes configuration
frontend/src/components/AdminDashboardMain.js  # Dashboard with AI button
```

### Flask API
```
mlproject/flask_app.py                      # ML API server
mlproject/requirements.txt                  # Python dependencies
mlproject/revenue_model_joblib.pkl         # Revenue prediction model
mlproject/sales_model_joblib.pkl           # Sales demand model
```

### Database
```
MongoDB: electronic (database)
Collections:
  - orders        (READ ONLY for ML)
  - products
  - users
  - ratings
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/status` | GET | Model & data status |
| `/api/dashboard-data` | GET | All data + predictions |
| `/api/analytics/monthly-revenue` | GET | Monthly revenue |
| `/api/analytics/monthly-sales` | GET | Monthly sales |
| `/api/analytics/top-brands` | GET | Top brands |
| `/api/predict/revenue` | GET | Revenue prediction |
| `/api/predict/sales` | GET | Sales prediction |

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/electronic
JWT_SECRET=your_secure_key
```

### Flask
- Configuration in `flask_app.py`
- MongoDB: `electronic` database
- Port: 5001
- Debug: True

## Features Implemented

- ✅ Linear Regression (Revenue Prediction)
- ✅ Random Forest (Demand Forecasting)
- ✅ Decision Tree (Top Brand Classification)
- ✅ React JSX components
- ✅ Chart.js visualizations
- ✅ MongoDB READ ONLY
- ✅ Full error handling
- ✅ Responsive design
- ✅ Admin-only access
- ✅ Real-time data refresh

## Testing

```bash
# Test Flask API
curl http://localhost:5001/health
curl http://localhost:5001/status
curl http://localhost:5001/api/dashboard-data

# Test React
- Open browser: http://localhost:3000
- Login as admin
- Click "🤖 AI Sales Insights"
- Verify charts load
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| API not connecting | Check Flask running on 5001 |
| Models not loaded | Verify .pkl files in mlproject/ |
| MongoDB error | Check mongod is running |
| Charts not showing | Check browser console for errors |
| No data displayed | Verify orders collection has data |

## Database Safety

- ✅ No write operations to MongoDB
- ✅ No data deletion
- ✅ All operations READ ONLY
- ✅ Original data preserved
- ✅ CSV fallback available

## ML Algorithms

1. **Linear Regression** → Revenue forecast
2. **Random Forest** → Demand prediction
3. **Decision Tree** → Top brand classification

## Performance Tips

- Flask caches data: refresh to get latest
- React frontend caches state
- Chart.js: performance optimized
- MongoDB: using indexes on orderDate

---

**Version:** 1.0 | **Updated:** March 17, 2026
