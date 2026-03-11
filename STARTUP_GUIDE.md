# 🚀 Complete Application Startup Guide

## Prerequisites
- Node.js (v14+)
- Python 3.8+
- MongoDB (local or cloud)

## Step 1: Install Backend Dependencies
```bash
cd backend
npm install
```

## Step 2: Install Frontend Dependencies
```bash
cd frontend
npm install
```

## Step 3: Install ML Models Dependencies
```bash
cd ml_models
pip install -r requirements.txt
```

## Step 4: Setup Environment Variables

### Backend (.env)
Create `backend/.env` file:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
ML_API_URL=http://localhost:8000
```

### Frontend (.env)
Create `frontend/.env` file:
```
REACT_APP_API_URL=http://localhost:5000/api
```

## Step 5: Start MongoDB
```bash
# If using local MongoDB
mongod
```

## Step 6: Start Backend Server
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

## Step 7: Start ML API Server (in a new terminal)
```bash
cd ml_models
python api/app.py
```
ML API runs on `http://localhost:8000`

## Step 8: Start Frontend Application (in a new terminal)
```bash
cd frontend
npm start
```
Application runs on `http://localhost:3000`

## 📊 Access Analytics Dashboard
1. Login as admin or regular user
2. Navigate to `/admin/reports` for admin analytics
3. Navigate to `/reports` for user analytics

## 🔍 Troubleshooting

### Charts not showing?
- Ensure ML API is running on port 8000
- Check browser console for errors
- Verify MongoDB is connected

### "No data available" message?
- ML API will generate synthetic data if Excel file not found
- Check that all three servers are running

### CORS errors?
- Ensure Flask API has CORS enabled
- Check that backend is forwarding requests correctly

## 📈 ML Features
- **Linear Regression**: Demand prediction for next month
- **Category Analysis**: Sales by category
- **Brand Performance**: Top brands analysis
- **Price Distribution**: Product pricing analysis
- **Rating Distribution**: Customer satisfaction metrics
- **Top Products**: Best selling products
- **Growth Forecast**: 15% growth prediction with confidence score

## 🎯 Key Endpoints
- `/api/ml/analytics` - Chart data
- `/api/ml/ml-demand-prediction` - ML predictions
- `/api/ml/category-analysis` - Category stats
- `/api/ml/brand-analysis` - Brand stats
- `/api/ml/top-products` - Top products
- `/api/ml/price-distribution` - Price ranges
- `/api/ml/rating-distribution` - Rating stats
- `/api/ml/next-month-forecast` - Sales forecast
