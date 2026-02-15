# Complete API Flow & Architecture

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     USER BROWSER                                 │
│                   React Frontend                                 │
│                (http://localhost:3000)                           │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/AXIOS
                         ↓
┌─────────────────────────────────────────────────────────────────┐
│                  EXPRESS.JS API SERVER                           │
│            (http://localhost:5000)                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Routes → Controllers → Models ↔ MongoDB                │   │
│  │  Middleware: Auth, Validation, Error Handling           │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────┬──────────────────────────┬──────────────────────────┘
              │                          │
              ↓                          ↓
    ┌──────────────────┐      ┌──────────────────────┐
    │  MongoDB         │      │  Flask ML API        │
    │  Database        │      │  (localhost:8000)    │
    │  ecommerce       │      │  - Recommendations   │
    │  ├─ users        │      │  - Trending items    │
    │  ├─ products     │      │  - Frequently bought │
    │  ├─ orders       │      └──────────────────────┘
    │  ├─ cart         │
    │  └─ interactions │
    └──────────────────┘
```

## 📡 API Request/Response Flow

### Example 1: User Registration & Login

```
CLIENT                          SERVER                  DATABASE
  │                               │                        │
  │──POST /api/auth/register──→   │                        │
  │  {                            │                        │
  │   name, email, password,      │──Check if exists──→   │
  │   role                        │  ←─── No, OK ────      │
  │  }                            │                        │
  │                               │──Hash password──→      │
  │                               │  ←─── Done ────        │
  │                               │                        │
  │                               │──Create user─────→    │
  │                               │  ←─── User ID ───      │
  │                               │                        │
  │                               │──Generate JWT──→       │
  │←──201 + token───────────────  │                        │
  │  {                            │                        │
  │   token: "jwt_token",         │                        │
  │   user: {...}                 │                        │
  │  }                            │                        │
  │                               │                        │
  │──POST /api/auth/login───→     │                        │
  │  {                            │                        │
  │   email, password             │──Find user────→       │
  │  }                            │  ←─── Found ───       │
  │                               │                        │
  │                               │──Compare pass──→       │
  │                               │  ←─── Match ───        │
  │                               │                        │
  │                               │──Generate JWT──→       │
  │←──200 + token───────────────  │                        │
  │  {                            │                        │
  │   token: "jwt_token",         │                        │
  │   user: {...}                 │                        │
  │  }                            │                        │
```

### Example 2: Browse Products & Add to Cart

```
CLIENT                          SERVER                  DATABASE
  │                               │                        │
  │──GET /api/products────────→   │                        │
  │  ?category=Laptops&           │──Find products───→    │
  │   sort=price-asc&             │  ←─── Result ───      │
  │   limit=10                    │                        │
  │                               │──Increment views──→   │
  │←──200 products─────────────   │                        │
  │  [{...}, {...}]               │                        │
  │                               │                        │
  │──GET /api/products/:id──────→ │                        │
  │                               │──Find product──→      │
  │                               │  ←─── Product ──      │
  │                               │                        │
  │                               │──Log interaction──→   │
  │                               │  {view} ────          │
  │←──200 product────────────────  │                        │
  │  {...}                        │                        │
  │                               │                        │
  │──POST /api/cart───────────→   │                        │
  │  Header: Authorization        │──Verify JWT────→      │
  │  {                            │  ←─── Valid ───       │
  │   productId: "...",           │                        │
  │   quantity: 1                 │──Find cart─────→      │
  │  }                            │  ←─── Cart ────       │
  │                               │                        │
  │                               │──Add/Update item──→   │
  │                               │  ←─── Done ────       │
  │←──200 cart updated────────────  │                        │
  │  {                            │                        │
  │   items: [...],               │                        │
  │   totalPrice: 45000           │                        │
  │  }                            │                        │
  │                               │                        │
  │──GET /api/recommendations    │                        │
  │   /frequently-bought/prod_id→ │                        │
  │                               │──Query associations──→ │
  │                               │  ←─── Related ──      │
  │←──200 recommendations─────────  │                        │
  │  [{...}, {...}]               │                        │
```

### Example 3: Checkout & Order Creation

```
CLIENT                          SERVER                  DATABASE
  │                               │                        │
  │──POST /api/orders────────→    │                        │
  │  Header: Authorization        │──Verify JWT────→      │
  │  {                            │  ←─── Valid ───       │
  │   deliveryAddress: {...},     │                        │
  │   paymentMethod: "COD"        │──Get user cart───→    │
  │  }                            │  ←─── Items ───       │
  │                               │                        │
  │                               │──Create order──→      │
  │                               │  ←─── Order ID ──     │
  │                               │                        │
  │                               │──Update products──→    │
  │                               │  {purchaseCount}       │
  │                               │  ←─── Updated ──      │
  │                               │                        │
  │                               │──Log interactions──→   │
  │                               │  {purchase}            │
  │                               │  ←─── Done ────       │
  │                               │                        │
  │                               │──Clear cart────→      │
  │                               │  ←─── Cleared ──      │
  │←──201 order created───────────  │                        │
  │  {                            │                        │
  │   orderId: "...",             │                        │
  │   totalAmount: 45000,         │                        │
  │   status: "Pending"           │                        │
  │  }                            │                        │
  │                               │                        │
  │──POST /api/orders/payment    │                        │
  │   /process────────────────→   │                        │
  │  Header: Authorization        │──Verify JWT────→      │
  │  {                            │  ←─── Valid ───       │
  │   orderId: "...",             │                        │
  │   cardDetails: {...}          │──Process payment──→    │
  │  }                            │  (Simulated)           │
  │                               │  ←─── Success ──      │
  │                               │                        │
  │                               │──Update order──→      │
  │                               │  {paymentStatus}       │
  │                               │  ←─── Updated ──      │
  │←──200 payment done────────────  │                        │
  │  {                            │                        │
  │   order: {...},               │                        │
  │   paymentStatus: "Completed"  │                        │
  │  }                            │                        │
```

### Example 4: ML Recommendations

```
CLIENT                          SERVER                 ML API
  │                               │                      │
  │──GET /api/recommendations    │                      │
  │   /personalized──────────→   │                      │
  │  Header: Authorization        │──Get user data──→    │
  │                               │                      │
  │                               │──Get interactions──→  │
  │                               │  ←─── Data ────      │
  │                               │                      │
  │                               │──POST /recommend──→   │
  │                               │  {                  │
  │                               │   userId,           │
  │                               │   purchasedProducts,│
  │                               │   viewedProducts    │
  │                               │  }                  │
  │                               │  ↓                  │
  │                               │  Collaborative    │
  │                               │  Filtering         │
  │                               │  ↓                  │
  │                               │  ←─── Recs ───      │
  │                               │                      │
  │                               │──Fetch products──→   │
  │                               │  ←─── Details ──     │
  │←──200 recommendations─────────  │                      │
  │  [{...}, {...}]               │                      │
```

### Example 5: Admin Analytics

```
CLIENT                          SERVER                  DATABASE
  │                               │                        │
  │──GET /api/admin/analytics──→  │                        │
  │  Header: Authorization        │──Verify admin──→      │
  │                               │  ←─── Valid ───       │
  │                               │                        │
  │                               │──Aggregate sales──→   │
  │                               │  by month ────→       │
  │                               │  ←─── Data ────       │
  │                               │                        │
  │                               │──Aggregate by──→      │
  │                               │  category ────→       │
  │                               │  ←─── Data ────       │
  │                               │                        │
  │                               │──Get top 10──→        │
  │                               │  products ────→       │
  │                               │  ←─── Data ────       │
  │←──200 analytics data───────────  │                        │
  │  {                            │                        │
  │   monthlySales: [...],        │                        │
  │   categoryWiseSales: [...],   │                        │
  │   topProducts: [...]          │                        │
  │  }                            │                        │
```

## 🔐 Authentication Flow

```
1. User Registration/Login
   ↓
2. Server validates credentials
   ↓
3. Server generates JWT token
   token = sign({userId, role}, JWT_SECRET, {expiresIn: '7d'})
   ↓
4. Client stores token in localStorage
   ↓
5. For protected routes, client sends:
   Authorization: Bearer <token>
   ↓
6. Server verifies token in middleware
   jwt.verify(token, JWT_SECRET)
   ↓
7. Token valid → req.userId set → proceed
   Token invalid → 401 Unauthorized
```

## 🗄️ Data Flow from DB to Frontend

```
Database (MongoDB)
   ↓
Models (Mongoose Schema + Methods)
   ↓
Controllers (Business Logic)
   ↓
Routes (API Endpoints)
   ↓
Middleware (Auth, Validation, Error Handling)
   ↓
Express Server Response
   ↓
Axios in Frontend
   ↓
Context API (State Management)
   ↓
React Components (UI)
   ↓
User Browser
```

## 📊 ML Pipeline

```
User Interactions (View, Click, Purchase)
   ↓ (Stored in UserInteraction collection)
↓
Data Processor (data_processor.py)
   ├─ Load interactions
   ├─ Load transactions
   ├─ Feature extraction
   └─ Matrix preparation
   ↓
Recommendation Engine (recommendation_models.py)
   ├─ Collaborative Filtering
   │  ├─ User-based similarity
   │  └─ Product prediction
   ├─ Content-Based Filtering
   │  ├─ Product features
   │  └─ Similarity matrix
   └─ Association Rules
      └─ Frequently bought together
   ↓
Flask API (api/app.py)
   ├─ POST /api/recommend
   ├─ POST /api/frequently-bought
   └─ POST /api/trending
   ↓
Backend Controller (recommendationController.js)
   ├─ Calls ML API
   ├─ Falls back to database if unavailable
   └─ Returns recommendations
   ↓
Frontend Component (Recommendations.js)
   ├─ Displays personalized items
   ├─ Shows frequently bought together
   └─ Shows trending products
   ↓
User Browser
```

## 🔄 Cart Update Flow

```
User clicks "Add to Cart"
   ↓
Frontend calls addToCart() function
   ↓
POST request to /api/cart
   ├─ productId
   ├─ quantity
   └─ JWT token in header
   ↓
Backend authMiddleware validates token
   ↓
cartController.addToCart executes
   ├─ Find product in database
   ├─ Check if cart exists for user
   │  ├─ If yes → Update existing cart
   │  └─ If no → Create new cart
   ├─ Add item to cart or increase quantity
   ├─ Recalculate total price
   └─ Save to database
   ↓
Send response with updated cart
   ├─ cart items array
   └─ total price
   ↓
Frontend updates CartContext state
   ├─ cart object
   └─ user sees updated cart
```

## 📝 Order Processing Flow

```
User clicks "Checkout"
   ↓
User fills delivery address
   ↓
User selects payment method (COD/Online)
   ↓
Frontend POST /api/orders
   ├─ userId (from token)
   ├─ deliveryAddress
   └─ paymentMethod
   ↓
Backend orderController.createOrder
   ├─ Validate cart not empty
   ├─ Get user's cart
   ├─ Create Order document
   │  ├─ Copy items from cart
   │  ├─ Set totalAmount
   │  ├─ Set delivery address
   │  └─ Set estimated delivery (5 days)
   ├─ Update Product.purchaseCount
   ├─ Log user interactions (purchase)
   └─ Delete user's cart
   ↓
Return Order with ID
   ↓
User sees "Order Created" message
   ↓
If COD → Status = Pending
If Online → Proceed to payment
   ↓
Frontend POST /api/orders/payment/process
   ├─ orderId
   └─ cardDetails (simulated)
   ↓
Backend orderController.processPayment
   ├─ Validate order exists
   ├─ Simulate payment processing
   ├─ Update paymentStatus → Completed
   ├─ Update orderStatus → Confirmed
   └─ Save to database
   ↓
Frontend shows "Payment Successful"
   ↓
User can view order in /api/orders
```

## 🎯 Product View Tracking for ML

```
User views product page
   ↓
GET /api/products/:id
   ↓
Backend productController
   ├─ Find product
   ├─ Increment viewCount
   ├─ Log interaction (if user logged in)
   │  └─ Create UserInteraction
   │     ├─ userId
   │     ├─ productId
   │     ├─ interactionType: "view"
   │     └─ timestamp: now()
   └─ Return product details
   ↓
ML system periodically analyzes interactions
   ├─ Identifies popular products
   ├─ Finds user preferences
   ├─ Builds recommendation matrix
   └─ Generates recommendations
```

## 🔗 Component Communication Flow

```
Navigation Component
   │
   ├─→ Uses AuthContext (user state)
   ├─→ Uses CartContext (cart items)
   └─→ Routes user to different pages

ProductList Component
   │
   ├─→ Calls api.getProducts()
   ├─→ Filters and displays results
   └─→ Links to product details

LoginRegister Component
   │
   ├─→ Uses AuthContext (login/register methods)
   ├─→ Updates user state on success
   └─→ Redirects to home page

Cart Component
   │
   ├─→ Uses CartContext (cart state)
   ├─→ Calls cart operations (add, remove, update)
   └─→ Displays cart items and total

Recommendations Component
   │
   ├─→ Uses AuthContext (token for personalized)
   ├─→ Calls api.getPersonalizedRecommendations()
   ├─→ Calls api.getFrequentlyBoughtTogether()
   └─→ Displays ML-generated recommendations

AdminDashboard Component
   │
   ├─→ Uses AuthContext (verify admin role)
   ├─→ Calls api.getAnalytics()
   ├─→ Displays charts and tables
   └─→ Shows business insights
```

---

This comprehensive flow documentation helps understand how all components work together in the system! 🚀
