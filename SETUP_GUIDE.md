# Setup and Deployment Guide

## Quick Start

### 1. Clone/Setup Repository
```bash
# Navigate to project directory
cd d:\consultancy-project
```

### 2. Install Backend Dependencies
```bash
cd backend
npm install
```

### 3. Setup MongoDB
```bash
# Install MongoDB or use MongoDB Atlas cloud service
# Update .env with your MongoDB connection string
```

### 4. Configure Backend Environment
```bash
# Create .env file in backend directory
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_very_secret_jwt_key_here_change_this
PORT=5000
NODE_ENV=development
ML_API_URL=http://localhost:8000
```

### 5. Install Frontend Dependencies
```bash
cd ../frontend
npm install
```

### 6. Install ML Models Dependencies
```bash
cd ../ml-models
pip install -r requirements.txt
```

## Running the Application

### Terminal 1: Backend Server
```bash
cd backend
npm run dev
```
Expected output: `Server running on port 5000`

### Terminal 2: Frontend Application
```bash
cd frontend
npm start
```
Expected output: Opens `http://localhost:3000` in browser

### Terminal 3: ML API Server
```bash
cd ml-models
python api/app.py
```
Expected output: `Running on http://0.0.0.0:8000`

## Testing the Application

### 1. Register User
- Navigate to `http://localhost:3000`
- Click "Login / Register"
- Fill registration form
- Select role (user/admin)
- Submit

### 2. Login
- Use registered credentials
- Get JWT token stored in localStorage

### 3. Browse Products
- View product list
- Apply filters (category, brand, sort)
- Search by keywords
- Click "View Details"

### 4. Add to Cart
- Click "Add to Cart" on products
- Manage cart (update qty, remove items)
- View total price

### 5. Checkout
- Click "Proceed to Checkout"
- Enter delivery address
- Select payment method (COD or Online)
- Place order

### 6. View Recommendations
- After purchase, see personalized recommendations
- View frequently bought together on product pages
- See trending products on homepage

### 7. Admin Dashboard (if registered as admin)
- Navigate to `/admin`
- View sales analytics
- Check category-wise performance
- See top products
- Monitor recent orders

## Database Setup

### Using MongoDB Locally
```bash
# Install MongoDB
# Start MongoDB service
mongod

# Connect with connection string
mongodb://localhost:27017/ecommerce
```

### Using MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create cluster
3. Get connection string
4. Update MONGODB_URI in .env with your connection string

### Database Initialization
When you start the backend, MongoDB collections are created automatically.

## Fetching External Products

To populate your database with products from external sources:

```javascript
// Create a script to fetch and insert products
// File: backend/scripts/seedProducts.js

const Product = require('../models/Product');
const axios = require('axios');

const seedProducts = async () => {
  try {
    // Example: Fetch from external API or scrape website
    const products = [
      {
        name: 'Product Name',
        description: 'Description',
        price: 9999,
        category: 'TVs',
        brand: 'Brand Name',
        image: 'image_url',
        externalSource: {
          url: 'source_url',
          sourceWebsite: 'website_name'
        }
      }
      // Add more products
    ];

    await Product.insertMany(products);
    console.log('Products seeded successfully');
  } catch (error) {
    console.error('Error seeding products:', error);
  }
};

seedProducts();
```

Run with: `node backend/scripts/seedProducts.js`

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: 
- Ensure MongoDB is running
- Check MONGODB_URI is correct in .env
- Use MongoDB Atlas cloud if local installation issues

### Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Solution**:
- Change PORT in .env file
- Or kill existing process on that port

### CORS Error
```
Access to XMLHttpRequest blocked by CORS policy
```
**Solution**:
- Backend CORS is configured for http://localhost:3000
- Update CORS if frontend runs on different URL

### JWT Authentication Error
```
Error: Invalid token
```
**Solution**:
- Clear localStorage and login again
- Ensure JWT_SECRET is same across requests
- Check token expiry (7 days)

### ML API Not Connecting
```
Error: Failed to call ML API
```
**Solution**:
- Ensure ML API is running on port 8000
- Check ML_API_URL in backend .env
- API calls have fallback to database queries

## Production Deployment

### Environment Setup for Production
```bash
# Backend .env
NODE_ENV=production
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=your_production_secret
PORT=5000
ML_API_URL=http://ml-api-server:8000
```

### Frontend Build
```bash
cd frontend
npm run build
```
Creates optimized build in `build/` folder

### Deployment Options

#### Option 1: Heroku
```bash
# Backend
heroku create your-app-name
git push heroku main

# Configure environment variables on Heroku dashboard
```

#### Option 2: AWS
- Backend: AWS EC2 + Node.js
- Frontend: AWS S3 + CloudFront
- Database: AWS MongoDB Atlas
- ML Models: AWS EC2 or Lambda

#### Option 3: DigitalOcean
- Droplet for Node.js backend
- Droplet for Python ML API
- Spaces for frontend static files
- Managed MongoDB database

### Docker Deployment

Create `Dockerfile` for backend:
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

Create `docker-compose.yml`:
```yaml
version: '3'
services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - MONGODB_URI=mongodb://mongo:27017/ecommerce
  mongo:
    image: mongo:5
    ports:
      - "27017:27017"
  ml-api:
    build: ./ml-models
    ports:
      - "8000:8000"
```

Run with: `docker-compose up`

## Performance Optimization

1. **Database Indexing**
   - Create indexes on frequently searched fields
   - Index user IDs and product IDs

2. **API Caching**
   - Cache trending products
   - Cache category lists
   - Use Redis for session storage

3. **Frontend Optimization**
   - Lazy load product images
   - Code splitting with React Router
   - Minimize bundle size

4. **ML Model Optimization**
   - Pre-compute recommendations periodically
   - Cache recommendation results
   - Use model serving frameworks

## Monitoring and Maintenance

### Logging
- Backend: Use Winston or Morgan for logs
- Frontend: Use browser console + error tracking (Sentry)
- ML API: Flask logging

### Database Maintenance
- Regular backups (MongoDB Atlas handles automatically)
- Monitor disk usage
- Clean up old interactions (optional archival)

### Performance Monitoring
- Track API response times
- Monitor error rates
- Track user sessions
- ML model accuracy metrics

---

**Application is now ready for use! 🎉**
