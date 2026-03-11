# E-Commerce MERN Stack - ML Algorithms & Modules Guide

## Project Architecture Overview

```
consultancy-project/
├── backend/          (Node.js/Express API)
├── frontend/         (React UI)
└── ml-models/        (Python Flask ML API)
```

---

## 1. PROJECT MODULES

### A. Backend Module (Node.js/Express)
**Location:** `backend/`

**Components:**
- **Authentication** (`controllers/authController.js`) - User login/registration with JWT
- **Products** (`controllers/productController.js`) - CRUD operations, filtering, visibility
- **Cart** (`controllers/cartController.js`) - Shopping cart management
- **Orders** (`controllers/orderController.js`) - Order creation, status tracking
- **Users** (`controllers/userController.js`) - User profiles, purchase history
- **Admin** (`controllers/adminController.js`) - Sales analytics, dashboard
- **Ratings** (`controllers/ratingController.js`) - Product reviews and ratings
- **Recommendations** (`controllers/recommendationController.js`) - ML-based suggestions

**Database:** MongoDB with Mongoose ODM

---

### B. Frontend Module (React)
**Location:** `frontend/src/`

**Components:**
- **ProductList** - Browse and filter products
- **ProductDetail** - View product details, reviews, add to cart
- **Cart** - Manage shopping cart
- **Checkout** - Order placement with delivery options
- **AdminDashboard** - Admin panel with analytics
- **AdminProducts** - Product management (CRUD)
- **AdminOrders** - Order management
- **AdminUsers** - User management
- **Profile** - User profile and order history
- **Reports** - Comprehensive analytics dashboard

**State Management:** Context API (Auth, Cart)

---

### C. ML Models Module (Python/Flask)
**Location:** `ml-models/`

**Purpose:** Advanced analytics and predictions using machine learning

---

## 2. MACHINE LEARNING ALGORITHMS

### Algorithm 1: Linear Regression
**Type:** Supervised Learning  
**Purpose:** Demand Prediction (Sales Forecasting)

#### How It Works:
- Predicts next month's sales based on historical sales data
- Uses price, views, purchases as features
- Outputs: Forecasted sales amount, growth rate, confidence score

#### Code Location:
**Backend:** `backend/controllers/adminController.js` (Line ~80-100)
```javascript
// getSalesReport() function calls ML API for prediction
const predictionResponse = await axios.post(`${ML_API_URL}/api/sales-prediction`, {
  salesData: allOrders
});
```

**Frontend Display:** `frontend/src/pages/Reports.js` (Line ~150-170)
```javascript
{data.data7 && (
  <div className="chart-section">
    <h2>🤖 Next Month Forecast (Linear Regression)</h2>
    <div className="prediction-cards">
      <div>Current Month Sales: ₹{data.data7.currentMonthSales}</div>
      <div>Forecasted Next Month: ₹{data.data7.nextMonthForecast}</div>
      <div>Growth Rate: {data.data7.growthRate}</div>
      <div>Model Confidence: {data.data7.confidence}%</div>
    </div>
  </div>
)}
```

#### ML Implementation (Python):
**File:** `ml-models/models/linear_regression_model.py`
```python
from sklearn.linear_model import LinearRegression
import numpy as np

# Features: price, views, purchases
X = product_data[['price', 'viewCount', 'purchaseCount']]
y = product_data['sales']

model = LinearRegression()
model.fit(X, y)

# Predict next month sales
next_month_prediction = model.predict(new_data)
```

---

### Algorithm 2: K-Means Clustering
**Type:** Unsupervised Learning  
**Purpose:** Product Segmentation (Group similar products)

#### How It Works:
- Clusters products into 3-4 groups based on price, rating, and sales
- Identifies product segments: Premium, Mid-range, Budget, etc.
- Helps in targeted marketing and inventory management

#### Code Location:
**Backend:** `backend/controllers/adminController.js` (Line ~120-140)
```javascript
// ML API call for clustering
const clusterResponse = await axios.post(`${ML_API_URL}/api/kmeans-clustering`, {
  products: allProducts
});
```

**Frontend Display:** `frontend/src/pages/Reports.js` (Line ~450-480)
```javascript
{data.data19?.clusters && (
  <div className="chart-section">
    <h2>1️⃣2️⃣ ML Clustering Analysis (K-Means)</h2>
    <div className="cluster-grid">
      {data.data19.clusters.map((cluster, idx) => (
        <div key={idx} className="cluster-card">
          <h3>{cluster.cluster}</h3>
          <p>Products: {cluster.productCount}</p>
          <p>Avg Price: ₹{cluster.avgPrice}</p>
          <p>Avg Purchases: {cluster.avgPurchases}</p>
          <p>Avg Rating: {cluster.avgRating}</p>
          <p>Top Product: {cluster.topProduct}</p>
        </div>
      ))}
    </div>
  </div>
)}
```

#### ML Implementation (Python):
**File:** `ml-models/models/kmeans_clustering.py`
```python
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler

# Features: price, rating, purchases
features = product_data[['price', 'rating', 'purchaseCount']]

# Standardize features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(features)

# Apply K-Means with 3 clusters
kmeans = KMeans(n_clusters=3, random_state=42)
clusters = kmeans.fit_predict(X_scaled)

# Results: Premium, Mid-range, Budget segments
```

#### Output Example:
```
Cluster 0 (Premium):
  - Products: 15
  - Avg Price: ₹45,000
  - Avg Rating: 4.8
  - Top Product: Samsung 65" 4K TV

Cluster 1 (Mid-range):
  - Products: 32
  - Avg Price: ₹18,000
  - Avg Rating: 4.2
  - Top Product: LG Washing Machine

Cluster 2 (Budget):
  - Products: 28
  - Avg Price: ₹5,000
  - Avg Rating: 3.9
  - Top Product: Basic Fan
```

---

### Algorithm 3: Decision Tree
**Type:** Supervised Learning  
**Purpose:** High vs Low Sales Classification

#### How It Works:
- Classifies products as "High Sales" or "Low Sales"
- Uses features: price, rating, stock, category
- Provides decision rules for sales prediction
- Helps identify which products will perform well

#### Code Location:
**Backend:** `backend/controllers/adminController.js` (Line ~160-180)
```javascript
// ML API call for decision tree prediction
const dtResponse = await axios.post(`${ML_API_URL}/api/decision-tree-prediction`, {
  products: allProducts
});
```

**Frontend Display:** `frontend/src/pages/Reports.js` (Line ~500-520)
```javascript
{data.data20 && (
  <div className="chart-section">
    <h2>🌳 Decision Tree Prediction</h2>
    <div className="prediction-cards">
      <div>Model Accuracy: {(data.data20.accuracy * 100).toFixed(1)}%</div>
      <div>High Sales Products: {data.data20.highSalesProducts}</div>
      <div>Low Sales Products: {data.data20.lowSalesProducts}</div>
    </div>
  </div>
)}
```

#### ML Implementation (Python):
**File:** `ml-models/models/decision_tree_model.py`
```python
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split

# Features: price, rating, stock, category
X = product_data[['price', 'rating', 'stock', 'category_encoded']]
y = product_data['sales_category']  # 0: Low, 1: High

# Split data
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# Train decision tree
dt_model = DecisionTreeClassifier(max_depth=5, random_state=42)
dt_model.fit(X_train, y_train)

# Predictions
accuracy = dt_model.score(X_test, y_test)
predictions = dt_model.predict(new_products)
```

#### Decision Rules Example:
```
IF price < ₹10,000 AND rating > 4.0 THEN High Sales
IF price > ₹40,000 AND stock < 5 THEN Low Sales
IF category == 'TV' AND rating > 4.5 THEN High Sales
```

---

## 3. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
│  - ProductList, AdminDashboard, Reports                     │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP Requests
                     ▼
┌─────────────────────────────────────────────────────────────┐
│              Backend (Node.js/Express)                      │
│  - API Routes, Controllers, Database                        │
│  - Forwards ML requests to Python API                       │
└────────────────────┬────────────────────────────────────────┘
                     │ axios.post() to ML API
                     ▼
┌─────────────────────────────────────────────────────────────┐
│           ML Models (Python/Flask)                          │
│  - Linear Regression (Demand Prediction)                    │
│  - K-Means Clustering (Product Segmentation)                │
│  - Decision Tree (Sales Classification)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 4. API ENDPOINTS FOR ML

### Backend Routes:
```javascript
// Forward ML requests to Python API
app.use('/api/ml', async (req, res) => {
  const endpoint = req.originalUrl.replace('/api/ml', '');
  const flaskResponse = await axios({
    method: req.method,
    url: `http://127.0.0.1:8000/api${endpoint}`,
    data: req.body
  });
  res.json(flaskResponse.data);
});
```

### Available ML Endpoints:
- `/api/ml/analytics` - General analytics
- `/api/ml/ml-demand-prediction` - Linear Regression forecast
- `/api/ml/kmeans-clustering` - K-Means clustering results
- `/api/ml/decision-tree-prediction` - Decision Tree classification
- `/api/ml/price-analysis` - Price statistics
- `/api/ml/rating-analysis` - Rating distribution
- `/api/ml/brand-performance` - Brand analytics

---

## 5. KEY FEATURES USING ML

### Feature 1: Sales Forecasting
**Algorithm:** Linear Regression  
**Location:** `frontend/src/pages/Reports.js` (Line 150-170)  
**Shows:** Next month sales prediction with confidence score

### Feature 2: Product Recommendations
**Algorithm:** Collaborative Filtering (in recommendations controller)  
**Location:** `backend/controllers/recommendationController.js`  
**Shows:** Personalized product suggestions based on user history

### Feature 3: Product Segmentation
**Algorithm:** K-Means Clustering  
**Location:** `frontend/src/pages/Reports.js` (Line 450-480)  
**Shows:** Products grouped by price range and performance

### Feature 4: Sales Classification
**Algorithm:** Decision Tree  
**Location:** `frontend/src/pages/Reports.js` (Line 500-520)  
**Shows:** Which products will have high/low sales

---

## 6. RUNNING THE ML MODELS

### Start ML API Server:
```bash
cd ml-models
python api/app.py
# Runs on http://localhost:8000
```

### Start Backend:
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

### Start Frontend:
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

---

## 7. ANALYTICS DASHBOARD

**Location:** `frontend/src/pages/Reports.js`

**Displays 20+ Analytics:**
1. Category Distribution (Pie Chart)
2. Average Price by Category (Bar Chart)
3. Monthly Sales Trend (Line Chart)
4. Price Range Distribution
5. Rating Distribution
6. Top 15 Best Selling Products
7. Category Analysis Table
8. Brand Performance Analysis
9. ML Demand Predictions
10. K-Means Clustering Results
11. Decision Tree Predictions
12. And more...

---

## 8. SUMMARY TABLE

| Algorithm | Type | Purpose | Location | Output |
|-----------|------|---------|----------|--------|
| Linear Regression | Supervised | Demand Prediction | `adminController.js` | Next month sales forecast |
| K-Means Clustering | Unsupervised | Product Segmentation | `adminController.js` | 3-4 product clusters |
| Decision Tree | Supervised | Sales Classification | `adminController.js` | High/Low sales prediction |

---

## 9. TECHNOLOGY STACK

**Backend:** Node.js, Express, MongoDB, Mongoose  
**Frontend:** React, Context API, Axios  
**ML:** Python, Flask, Scikit-learn, Pandas, NumPy  
**Authentication:** JWT, bcryptjs  
**File Upload:** Multer, Cloudinary  

---

## 10. NEXT STEPS FOR ENHANCEMENT

1. Add more ML algorithms (Random Forest, SVM)
2. Implement real-time predictions
3. Add model retraining pipeline
4. Create A/B testing framework
5. Add customer segmentation
6. Implement anomaly detection for fraud

