# 📊 Reports Page - Visual Structure

## Complete Dashboard Layout

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    REPORTS PAGE - 20 ANALYSES                           │
│                  http://localhost:3000/reports                          │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ SECTION 1: FORECASTING & PREDICTIONS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🤖 Next Month Forecast (Linear Regression)                            │
│  ┌─────────────┬─────────────┬─────────────┬─────────────┐             │
│  │ Current     │ Forecasted  │ Growth      │ Confidence  │             │
│  │ Sales       │ Sales       │ Rate        │             │             │
│  │ ₹XXXXX      │ ₹XXXXX      │ 15%         │ 85%         │             │
│  └─────────────┴─────────────┴─────────────┴─────────────┘             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ SECTION 2: CATEGORY ANALYSIS                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📊 Category Distribution          💰 Average Price by Category         │
│  ┌──────────────────────────┐      ┌──────────────────────────┐        │
│  │      Pie Chart           │      │      Bar Chart           │        │
│  │   TV (30%)               │      │  TV: ₹45,000             │        │
│  │   AC (17%)               │      │  AC: ₹52,000             │        │
│  │   Washing Machine (26%)  │      │  Fridge: ₹48,000         │        │
│  │   Fridge (14%)           │      │  Microwave: ₹35,000      │        │
│  │   Others (13%)           │      │  Fan: ₹8,000             │        │
│  └──────────────────────────┘      └──────────────────────────┘        │
│                                                                         │
│  📈 Monthly Sales Trend                                                │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Line Chart                                          │          │
│  │  Sales over time (Jan - Dec)                             │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  1️⃣ Category-wise Product Count                                        │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Bar Chart                                           │          │
│  │  TV: 8 products, Washing Machine: 5, Fridge: 4, ...     │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  1️⃣1️⃣ Category Sales Performance                                       │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Pie Chart                                           │          │
│  │  Revenue contribution by category                        │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ SECTION 3: BRAND ANALYSIS                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  2️⃣ Brand-wise Product Distribution                                    │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Horizontal Bar Chart                                │          │
│  │  Samsung: 6 products                                     │          │
│  │  LG: 5 products                                          │          │
│  │  Sony: 4 products                                        │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  🏢 Top Brands Performance                                             │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Table                                               │          │
│  │  Brand | Sales | Rating | Price                          │          │
│  │  Samsung | 200 | 4.3 ⭐ | ₹45,000                        │          │
│  │  LG | 150 | 4.2 ⭐ | ₹48,000                             │          │
│  │  Sony | 120 | 4.1 ⭐ | ₹50,000                           │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  🔟 Brand Performance Analysis                                         │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Table                                               │          │
│  │  Brand | Purchases | Views | Avg Rating                  │          │
│  │  Samsung | 200 | 1500 | 4.3 ⭐                           │          │
│  │  LG | 150 | 1200 | 4.2 ⭐                                │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ SECTION 4: PRICE ANALYSIS                                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  💵 Price Range Distribution                                           │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Bar Chart                                           │          │
│  │  0-20k: 45 products                                      │          │
│  │  20k-40k: 120 products                                   │          │
│  │  40k-60k: 95 products                                    │          │
│  │  60k-100k: 80 products                                   │          │
│  │  100k+: 60 products                                      │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  3️⃣ Price Analysis                                                     │
│  ┌─────────────┬─────────────┬─────────────┐                           │
│  │ Avg Price   │ Most Exp.   │ Cheapest    │                           │
│  │ ₹40,000     │ TCL TV      │ Havells Fan │                           │
│  │             │ ₹1,50,000   │ ₹2,500      │                           │
│  └─────────────┴─────────────┴─────────────┘                           │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Histogram                                           │          │
│  │  Price distribution across ranges                        │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  9️⃣ Price vs Purchase Analysis                                        │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Scatter Plot                                        │          │
│  │  X-axis: Price (₹)                                       │          │
│  │  Y-axis: Purchases                                       │          │
│  │  Insight: Medium-priced products sell most               │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ SECTION 5: PRODUCT PERFORMANCE                                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  🏆 Top 15 Best Selling Products                                       │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Table                                               │          │
│  │  Product | Category | Price | Sales | Rating             │          │
│  │  Samsung TV | TV | ₹45,000 | 111 | 4.3 ⭐               │          │
│  │  Bosch WM | Washing | ₹52,000 | 110 | 4.5 ⭐            │          │
│  │  LG Fridge | Fridge | ₹48,000 | 98 | 4.4 ⭐             │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  5️⃣ Product Popularity (Most Viewed)                                  │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Table                                               │          │
│  │  Product | Category | Views                              │          │
│  │  Samsung TV | TV | 393 👀                                │          │
│  │  LG AC | AC | 348 👀                                     │          │
│  │  Sony TV | TV | 320 👀                                   │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  6️⃣ Purchase Analysis (Top Selling)                                   │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Horizontal Bar Chart                                │          │
│  │  Samsung TV: 111 purchases                               │          │
│  │  Bosch WM: 110 purchases                                 │          │
│  │  LG Fridge: 98 purchases                                 │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  7️⃣ Conversion Rate Analysis                                          │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Table                                               │          │
│  │  Product | Views | Purchases | Conversion Rate           │          │
│  │  Bosch WM | 250 | 112 | 44.8% ✅                         │          │
│  │  Samsung TV | 393 | 111 | 28.2% ✅                       │          │
│  │  LG AC | 348 | 85 | 24.4% ✅                             │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ SECTION 6: QUALITY & RATINGS                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ⭐ Rating Distribution                                                │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Doughnut Chart                                      │          │
│  │  4.5 Stars: 120 products                                 │          │
│  │  4.0 Stars: 150 products                                 │          │
│  │  3.5 Stars: 100 products                                 │          │
│  │  3.0 Stars: 30 products                                  │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  8️⃣ Rating Analysis                                                   │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │ Highest Rated: LG Washing Machine                        │           │
│  │ Rating: ⭐⭐⭐⭐⭐ 4.8                                      │           │
│  └─────────────────────────────────────────────────────────┘           │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Bar Chart - Category Ratings                        │          │
│  │  Washing Machine: 4.5 ⭐                                 │          │
│  │  TV: 4.2 ⭐                                              │          │
│  │  AC: 4.1 ⭐                                              │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  4️⃣ Stock Analysis (Low Stock Products)                               │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Table                                               │          │
│  │  Product | Category | Stock                              │          │
│  │  TCL TV | TV | ⚠️ 5                                      │          │
│  │  LG TV | TV | ⚠️ 6                                       │          │
│  │  Samsung AC | AC | ⚠️ 8                                  │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ SECTION 7: DETAILED ANALYSIS                                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  📋 Category Analysis                                                  │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Table                                               │          │
│  │  Category | Avg Price | Min | Max | Sales | Rating       │          │
│  │  TV | ₹45,000 | ₹25,000 | ₹1,50,000 | 210 | 4.2 ⭐      │          │
│  │  AC | ₹52,000 | ₹35,000 | ₹1,20,000 | 120 | 4.1 ⭐      │          │
│  │  Washing Machine | ₹48,000 | ₹30,000 | ₹95,000 | 180 | 4.5 ⭐ │    │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
│  🎯 ML Demand Predictions (Top 10)                                    │
│  ┌──────────────────────────────────────────────────────────┐          │
│  │      Table                                               │          │
│  │  Product | Category | Price | Actual | Predicted         │          │
│  │  Samsung TV | TV | ₹45,000 | 111 | 108                  │          │
│  │  Bosch WM | Washing | ₹52,000 | 110 | 112               │          │
│  │  LG Fridge | Fridge | ₹48,000 | 98 | 95                 │          │
│  │  Accuracy: 85% | RMSE: 12.5                              │          │
│  └──────────────────────────────────────────────────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ SECTION 8: MACHINE LEARNING INSIGHTS                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  1️⃣2️⃣ ML Clustering Analysis (K-Means)                                │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │ Low Demand          │ Medium Demand       │ High Demand │           │
│  │ Products: 150       │ Products: 200       │ Products: 150 │         │
│  │ Avg Price: ₹25k     │ Avg Price: ₹45k     │ Avg Price: ₹65k │       │
│  │ Avg Sales: 20       │ Avg Sales: 60       │ Avg Sales: 120 │        │
│  │ Avg Rating: 3.8 ⭐  │ Avg Rating: 4.1 ⭐  │ Avg Rating: 4.4 ⭐ │     │
│  │ Top: Budget Fan     │ Top: LG AC          │ Top: Samsung TV │       │
│  └─────────────────────────────────────────────────────────┘           │
│                                                                         │
│  🌳 Decision Tree Prediction                                           │
│  ┌─────────────────────────────────────────────────────────┐           │
│  │ Model Accuracy: 87.5%                                   │           │
│  │ High Sales Products: 250                                │           │
│  │ Low Sales Products: 250                                 │           │
│  │ Prediction: Can classify high vs low sales products     │           │
│  └─────────────────────────────────────────────────────────┘           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 Analysis Summary by Category

### Descriptive Analyses (10)
- Category Distribution
- Average Price by Category
- Monthly Sales Trend
- Price Range Distribution
- Rating Distribution
- Top 15 Best Selling Products
- Category-wise Product Count
- Brand-wise Product Distribution
- Product Popularity
- Stock Analysis

### Analytical Analyses (7)
- Category Analysis
- Top Brands Performance
- Price Analysis
- Purchase Analysis
- Conversion Rate Analysis
- Rating Analysis
- Price vs Purchase Analysis
- Brand Performance Analysis
- Category Sales Performance

### Predictive Analyses (3)
- Next Month Forecast (Linear Regression)
- ML Demand Predictions (Linear Regression)
- ML Clustering (K-Means)
- Decision Tree Prediction

---

## 🎯 Key Metrics Displayed

### Cards (Forecast & Clustering)
- Current Month Sales
- Forecasted Sales
- Growth Rate
- Model Confidence
- Cluster Statistics

### Charts
- Category Distribution (Pie)
- Price Distribution (Histogram)
- Sales Trend (Line)
- Product Count (Bar)
- Conversion Rate (Table)
- Price vs Sales (Scatter)

### Tables
- Top Products
- Category Analysis
- Brand Analysis
- Stock Analysis
- Popularity
- Conversion Rate
- Brand Performance

---

**Complete Reports Dashboard with 20 Analyses! 📊**
