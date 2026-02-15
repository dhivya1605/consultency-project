# Quick Commands Reference

## 📦 Installation Commands

### Backend Setup
```bash
cd d:\consultancy-project\backend
npm install
```

### Frontend Setup
```bash
cd d:\consultancy-project\frontend
npm install
```

### ML Models Setup
```bash
cd d:\consultancy-project\ml-models
pip install -r requirements.txt
```

## 🚀 Running the Application

### Start Backend Server (Terminal 1)
```bash
cd d:\consultancy-project\backend
npm run dev
# Expected: "Server running on port 5000"
```

### Start Frontend Application (Terminal 2)
```bash
cd d:\consultancy-project\frontend
npm start
# Expected: Opens http://localhost:3000
```

### Start ML API Server (Terminal 3)
```bash
cd d:\consultancy-project\ml-models
python api/app.py
# Expected: "Running on http://0.0.0.0:8000"
```

## 📋 Environment Setup

### Create Backend .env File
```bash
cd d:\consultancy-project\backend
# Create .env file with:
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_secret_key_here_change_this
PORT=5000
NODE_ENV=development
ML_API_URL=http://localhost:8000
```

## 🔍 Useful API Testing Commands

### Test Backend Health
```bash
# Windows PowerShell
Invoke-WebRequest -Uri http://localhost:5000 -Method GET

# Or using curl
curl http://localhost:5000
```

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\",\"role\":\"user\"}"
```

### Login User
```bash
curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"
```

### Get All Products
```bash
curl -X GET http://localhost:5000/api/products?category=Laptops
```

## 🛠️ Useful Development Commands

### View Logs (Backend)
```bash
# Nodemon should show auto-restart logs
# Just run: npm run dev
```

### Check if Ports are in Use
```bash
# Windows PowerShell
netstat -ano | findstr :5000   # Backend port
netstat -ano | findstr :3000   # Frontend port
netstat -ano | findstr :8000   # ML API port
```

### Kill Process on Specific Port
```bash
# Windows PowerShell
# Get process ID from netstat output, then:
taskkill /PID <PID> /F

# Example for port 5000:
(Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process -Force
```

## 🗄️ MongoDB Commands

### Connect to MongoDB Locally
```bash
# Open MongoDB shell
mongo

# Connect to ecommerce database
use ecommerce

# View all collections
show collections

# View all users
db.users.find()

# View all products
db.products.find()

# Count documents
db.products.countDocuments()
```

## 📱 Frontend Development

### Build Optimized Production Bundle
```bash
cd d:\consultancy-project\frontend
npm run build
```

### Run Frontend in Development Mode
```bash
cd d:\consultancy-project\frontend
npm start
```

### Clear Frontend Cache
```bash
cd d:\consultancy-project\frontend
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

## 🐍 Python ML Commands

### Install ML Dependencies
```bash
cd d:\consultancy-project\ml-models
pip install -r requirements.txt
```

### Run Flask Development Server
```bash
cd d:\consultancy-project\ml-models
python api/app.py
```

### Run Flask Production Server
```bash
cd d:\consultancy-project\ml-models
python -m flask run --host 0.0.0.0 --port 8000
```

## 🧪 Testing APIs

### Using Postman/Insomnia

1. **Create User (Register)**
   - Method: POST
   - URL: http://localhost:5000/api/auth/register
   - Body (JSON):
   ```json
   {
     "name": "Test User",
     "email": "test@example.com",
     "password": "password123",
     "role": "user"
   }
   ```

2. **Get Products**
   - Method: GET
   - URL: http://localhost:5000/api/products?page=1&limit=10&category=Laptops

3. **Add to Cart (Auth Required)**
   - Method: POST
   - URL: http://localhost:5000/api/cart
   - Headers: Authorization: Bearer <token>
   - Body (JSON):
   ```json
   {
     "productId": "product_id_here",
     "quantity": 1
   }
   ```

## 📊 Database Seeding

### Add Sample Products
```javascript
// Create file: backend/scripts/seedProducts.js
const Product = require('../models/Product');

const products = [
  {
    name: 'Samsung 55" Smart TV',
    description: '4K Ultra HD Smart TV',
    price: 45000,
    category: 'TVs',
    brand: 'Samsung',
    image: 'https://example.com/image.jpg',
    specifications: { resolution: '4K', hdr: true },
    stock: 10
  }
  // Add more products
];

Product.insertMany(products).then(() => {
  console.log('Products added');
  process.exit(0);
}).catch(err => console.error(err));
```

Run with: `node backend/scripts/seedProducts.js`

## 🔐 Generate JWT Token

```bash
# Using Node.js REPL
node
> const jwt = require('jsonwebtoken');
> const token = jwt.sign({userId: '123', role: 'user'}, 'your_secret', {expiresIn: '7d'});
> console.log(token);
```

## 📈 Monitor Application

### Check Network Requests (Browser DevTools)
1. Open browser DevTools (F12)
2. Go to Network tab
3. Perform actions in application
4. View API calls and responses

### Check Console Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for any JavaScript errors
4. Check network errors

## 🔄 Restart Services

### Restart All Services
```bash
# Kill all services (Windows)
taskkill /F /IM node.exe
taskkill /F /IM python.exe

# Then restart in new terminals
```

## 📚 File Structure Quick Reference

```
consultancy-project/
├── backend/              → npm install → npm run dev
├── frontend/             → npm install → npm start
├── ml-models/            → pip install -r requirements.txt → python api/app.py
├── README.md             → Project documentation
├── SETUP_GUIDE.md        → Detailed setup steps
└── PROJECT_SUMMARY.md    → This summary
```

## 🆘 Common Issues & Solutions

### Issue: MongoDB connection error
```bash
# Solution: Make sure MongoDB is running
mongod  # Start MongoDB
```

### Issue: Port already in use
```bash
# Solution: Change port in .env or kill process using port
# Kill process using port 5000:
taskkill /F /PID <process_id>
```

### Issue: npm packages not found
```bash
# Solution: Clear cache and reinstall
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

### Issue: CORS error
```bash
# Solution: Check backend CORS configuration
# In server.js, verify CORS settings match frontend URL
```

### Issue: JWT token invalid
```bash
# Solution: 
# 1. Clear localStorage in browser
# 2. Login again to get new token
# 3. Ensure JWT_SECRET is same in .env
```

## 📞 Quick Test Checklist

- [ ] Backend server starts on port 5000
- [ ] Frontend loads on port 3000
- [ ] ML API runs on port 8000
- [ ] Can register new user
- [ ] Can login with credentials
- [ ] Can view products
- [ ] Can add to cart
- [ ] Can view cart
- [ ] Can create order
- [ ] Admin can view dashboard

---

**Keep this file handy for quick reference during development! 🚀**
