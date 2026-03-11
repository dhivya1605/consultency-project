require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// serve uploaded images
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Connect to MongoDB
const connectDB = async () => {
  console.log(`MONGODB_URI: ${process.env.MONGODB_URI}`);
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/cart', require('./routes/cartRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/ratings', require('./routes/ratingRoutes'));
app.use('/api/ml', async (req, res) => {
  try {
    const endpoint = req.originalUrl.replace('/api/ml', '');
    console.log(`Forwarding ML request to: http://127.0.0.1:8000/api${endpoint}`);
    const flaskResponse = await axios({
      method: req.method,
      url: `http://127.0.0.1:8000/api${endpoint}`,
      data: req.body,
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    res.status(flaskResponse.status).json(flaskResponse.data);
  } catch (error) {
    console.error('Error communicating with Flask API:', error.message);
    res.status(500).json({ error: 'Error communicating with Flask API', details: error.message });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API Running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
