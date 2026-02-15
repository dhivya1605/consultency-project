# E-Commerce MERN Stack with ML Recommendations

A full-stack e-commerce application built with MongoDB, Express, React, and Node.js, enhanced with machine learning capabilities for intelligent product recommendations.

## 🚀 Project Overview

This application provides:
- **User Authentication**: Secure login/registration for customers and admins
- **Product Catalog**: Browse electronic products by category and brand
- **Smart Search**: Find products with keyword and filter-based search
- **Shopping Cart**: Add, update, and manage cart items
- **Order Management**: Place orders with dummy payment processing
- **ML Recommendations**:
  - Personalized product suggestions based on browsing history
  - Frequently bought together recommendations
  - Trending products analysis
- **Admin Dashboard**: Sales analytics and business insights

## 📁 Project Structure

```
consultancy-project/
├── backend/                    # Node.js/Express API
│   ├── models/                 # MongoDB schemas
│   ├── controllers/            # Business logic
│   ├── routes/                 # API endpoints
│   ├── middleware/             # Auth, validation, etc.
│   ├── utils/                  # Helper functions
│   ├── config/                 # Configuration files
│   ├── server.js              # Main server file
│   ├── package.json           # Dependencies
│   └── .env.example           # Environment variables template
│
├── frontend/                   # React application
│   ├── public/                # Static files
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Page components
│   │   ├── context/           # Context (Auth, Cart)
│   │   ├── utils/             # API calls, helpers
│   │   ├── App.js            # Main app component
│   │   └── index.js          # React entry point
│   └── package.json          # Dependencies
│
└── ml-models/                  # Python ML models
    ├── api/                    # Flask API server
    ├── models/                 # ML model implementations
    ├── data/                   # Data processing utilities
    ├── requirements.txt        # Python dependencies
    └── README.md              # ML documentation
```

## 🛠️ Technologies Used

### Backend
- **Node.js & Express**: Server and API
- **MongoDB**: Database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication
- **bcryptjs**: Password hashing

### Frontend
- **React 18**: UI library
- **React Router**: Navigation
- **Axios**: HTTP client
- **Context API**: State management

### ML Models
- **Flask**: Python web framework
- **Scikit-learn**: Machine learning algorithms
- **Pandas & NumPy**: Data processing
- **Collaborative Filtering**: User-based recommendations
- **Content-Based Filtering**: Product similarity

## 📦 Installation

### Prerequisites
- Node.js (v14+)
- Python 3.8+
- MongoDB (local or cloud instance)

### Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
ML_API_URL=http://localhost:8000
```

### Frontend Setup

```bash
cd frontend
npm install
```

### ML Models Setup

```bash
cd ml-models
pip install -r requirements.txt
```

## 🚀 Running the Application

### Start Backend Server
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

### Start Frontend Application
```bash
cd frontend
npm start
```
Application runs on `http://localhost:3000`

### Start ML API Server
```bash
cd ml-models
python api/app.py
```
ML API runs on `http://localhost:8000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - Get all products with filters
- `GET /api/products/:id` - Get product details
- `GET /api/products/trending` - Get trending products
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)

### Cart
- `GET /api/cart` - Get user's cart
- `POST /api/cart` - Add to cart
- `PUT /api/cart` - Update cart item
- `DELETE /api/cart/item` - Remove from cart
- `DELETE /api/cart` - Clear cart

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get user's orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders/payment/process` - Process payment (dummy)

### Recommendations (ML)
- `GET /api/recommendations/personalized` - Personalized recommendations (requires login)
- `GET /api/recommendations/frequently-bought/:productId` - Frequently bought together
- `GET /api/recommendations/related/:productId` - Related products

### Admin
- `GET /api/admin/analytics` - Sales analytics
- `GET /api/admin/overview` - Dashboard overview

### User
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/history` - Purchase history

## 🔐 Authentication Flow

1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Server returns JWT token
3. Token stored in localStorage on frontend
4. Token sent in `Authorization: Bearer <token>` header for protected routes
5. Middleware validates token before allowing access

## 🤖 ML Features

### Personalized Recommendations
- Analyzes user's purchase and browsing history
- Uses collaborative filtering to find similar users
- Recommends products liked by similar users

### Frequently Bought Together
- Identifies products commonly purchased in same order
- Uses transaction data to find product associations
- Suggests complementary items during checkout

### Trending Products
- Tracks recent product views and purchases
- Calculates popularity scores
- Updates trending list in real-time

## 📊 Data Models

### User Schema
```javascript
{
  name, email, password,
  phone, address,
  role (user/admin),
  createdAt, updatedAt
}
```

### Product Schema
```javascript
{
  name, description, price,
  category, brand, image,
  rating, reviews, stock,
  specifications, viewCount, purchaseCount,
  isTrending, externalSource
}
```

### Order Schema
```javascript
{
  userId, items: [{productId, name, price, quantity}],
  totalAmount, deliveryAddress,
  paymentMethod (COD/Online),
  paymentStatus, orderStatus,
  estimatedDelivery, orderDate
}
```

### UserInteraction Schema
```javascript
{
  userId, productId,
  interactionType (view/click/purchase/addToCart),
  timestamp
}
```

## 🔍 Key Features

### Landing Page
- Carousel with seasonal offers
- Product categories display
- Search functionality
- Login options

### Product Discovery
- Category-based browsing
- Brand filtering
- Search by keywords
- Price and rating sorting
- Product view tracking (for ML)

### Shopping Experience
- Product details with specs
- Add to cart
- Quantity management
- Secure checkout
- Delivery address entry
- Dummy payment processing

### Personalization
- Recommended products on homepage
- Similar products suggestions
- Related accessories recommendations
- Purchase history tracking

### Admin Features
- Sales analytics by category
- Monthly sales trends
- Top performing products
- Customer behavior insights
- Order management
- User analytics

## 🔗 External Data Integration

Products can be fetched from external websites:
1. Configure external source URL in product model
2. Use scrapers to fetch product details
3. Store in MongoDB with source attribution
4. Display with proper attribution

## 🔄 Workflow

1. **User Registration**: Users create account with email/password
2. **Product Browsing**: Browse categories or search products
3. **Product Interaction**: Views and clicks tracked for ML
4. **Add to Cart**: Products added to shopping cart
5. **Checkout**: Enter delivery address, select payment method
6. **Order Placement**: Create order, process payment
7. **Recommendations**: Get personalized suggestions based on activity
8. **Admin Analytics**: View sales trends and customer insights

## 🚨 Error Handling

- Validation errors for form inputs
- Authentication errors for protected routes
- MongoDB connection errors handled gracefully
- API timeout fallback to database queries
- Comprehensive error messages in responses

## 📈 Scaling Considerations

- **Database**: MongoDB can be scaled horizontally with sharding
- **API**: Node.js cluster mode for multi-core usage
- **ML Models**: Can be retrained periodically with new data
- **Frontend**: Static assets can be served from CDN
- **Caching**: Redis for frequently accessed data

## 🐛 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### ML Models Testing
```bash
cd ml-models
pytest
```

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/ecommerce
JWT_SECRET=your_secret_key
PORT=5000
NODE_ENV=development
ML_API_URL=http://localhost:8000
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

### ML Models (.env)
```
MONGODB_URI=mongodb://localhost:27017
FLASK_ENV=development
```

## 🔐 Security Best Practices

1. **Password Security**: Bcryptjs for password hashing
2. **JWT Tokens**: Secure token-based authentication
3. **CORS**: Configured for frontend-backend communication
4. **Input Validation**: Express-validator for all inputs
5. **Environment Variables**: Sensitive data in .env files
6. **Admin Only Routes**: Protected with admin middleware

## 📚 Documentation

Detailed documentation for each module:
- [Backend Documentation](./backend/README.md)
- [Frontend Documentation](./frontend/README.md)
- [ML Models Documentation](./ml-models/README.md)

## 🤝 Contributing

1. Create feature branches
2. Make commits with clear messages
3. Push to branches
4. Create pull requests for review

## 📄 License

This project is open source and available for educational purposes.

## 📞 Support

For issues or questions, please refer to the module-specific documentation or create an issue in the repository.

---

**Happy Coding! 🚀**
