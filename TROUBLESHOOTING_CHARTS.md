# 🔧 Troubleshooting Guide - Charts Not Displaying

## ✅ Checklist to Display Charts with Dataset

### Step 1: Verify All 3 Servers Are Running

**Terminal 1 - Backend (Node.js)**
```bash
cd backend
npm run dev
```
Expected output: `Server running on port 5000`

**Terminal 2 - ML API (Flask/Python)**
```bash
cd ml_models
python api/app.py
```
Expected output: `Running on http://0.0.0.0:8000`

**Terminal 3 - Frontend (React)**
```bash
cd frontend
npm start
```
Expected output: `Compiled successfully!` and opens `http://localhost:3000`

### Step 2: Test ML API is Working

Run the test script:
```bash
cd ml_models
python test_ml_api.py
```

Expected output:
```
✅ /analytics
✅ /ml-demand-prediction
✅ /category-analysis
✅ /brand-analysis
✅ /top-products
✅ /price-distribution
✅ /rating-distribution
✅ /next-month-forecast
```

### Step 3: Check Browser Console

1. Open `http://localhost:3000/admin/reports`
2. Press `F12` to open Developer Tools
3. Go to **Console** tab
4. Look for messages like:
   - `✓ chartData loaded:` - Charts data received
   - `✓ predictions loaded:` - ML predictions received
   - `✓ categoryAnalysis loaded:` - Category data received

### Step 4: Verify Data is Being Fetched

In Console, you should see:
```
Starting to fetch analytics data...
✓ chartData loaded: {pie: {...}, bar: {...}, line: {...}}
✓ predictions loaded: {accuracy: 0.85, rmse: 12.34, results: [...]}
✓ categoryAnalysis loaded: {categories: [...]}
✓ brandAnalysis loaded: {brands: [...]}
✓ topProducts loaded: {topProducts: [...]}
✓ priceDistribution loaded: {ranges: [...], counts: [...]}
✓ ratingDistribution loaded: {ratings: [...], counts: [...]}
✓ forecast loaded: {currentMonthSales: 5000, nextMonthForecast: 5750, ...}
```

## 🐛 Common Issues & Solutions

### Issue 1: "No data available" Message
**Cause:** ML API is not running or not responding
**Solution:**
```bash
# Terminal 2
cd ml_models
python api/app.py
```

### Issue 2: Charts Sections Show But No Charts Render
**Cause:** Chart.js not properly initialized or data format incorrect
**Solution:**
1. Check browser console for errors
2. Verify all 3 servers are running
3. Refresh page: `Ctrl+F5` (hard refresh)

### Issue 3: "Connection Error (Flask API not running?)"
**Cause:** Flask server not started
**Solution:**
```bash
cd ml_models
pip install -r requirements.txt
python api/app.py
```

### Issue 4: CORS Errors in Console
**Cause:** Flask API CORS not configured
**Solution:** Already configured in `app.py` with `CORS(app)`

### Issue 5: "Error: 500 - Error communicating with Flask API"
**Cause:** Backend can't reach Flask API
**Solution:**
1. Ensure Flask is running on port 8000
2. Check firewall settings
3. Verify `http://localhost:8000/api/analytics` works directly

## 📊 What Should Display

Once all servers are running and data is loaded:

1. **🤖 Next Month Forecast Cards**
   - Current Month Sales
   - Forecasted Next Month
   - Growth Rate (15%)
   - Model Confidence (85%)

2. **📦 Category-wise Sales Forecast Table**
   - 7 categories with current/forecasted sales

3. **📊 Category Distribution (Pie Chart)**
   - Shows product distribution across categories

4. **💰 Average Price by Category (Bar Chart)**
   - Price comparison across categories

5. **📈 Monthly Sales Trend (Line Chart)**
   - Sales over time

6. **💵 Price Range Distribution (Bar Chart)**
   - Products in different price ranges

7. **⭐ Rating Distribution (Doughnut Chart)**
   - Customer ratings breakdown

8. **🏆 Top 15 Best Selling Products (Table)**
   - Product names, categories, prices, sales, ratings

9. **📋 Category Analysis (Table)**
   - Detailed category statistics

10. **🏢 Top Brands Performance (Table)**
    - Brand sales and ratings

11. **🎯 ML Demand Predictions (Table)**
    - Model accuracy and top 10 predictions

## 🚀 Quick Start Command

Run all 3 servers in one go (requires 3 terminals):

**Terminal 1:**
```bash
cd backend && npm run dev
```

**Terminal 2:**
```bash
cd ml_models && python api/app.py
```

**Terminal 3:**
```bash
cd frontend && npm start
```

Then navigate to: `http://localhost:3000/admin/reports`

## ✨ Expected Result

All charts, tables, and prediction cards should display with real data from the synthetic dataset (or your Excel file if it exists at the specified path).

If you still see "No data available", check the browser console for specific error messages and follow the troubleshooting steps above.
