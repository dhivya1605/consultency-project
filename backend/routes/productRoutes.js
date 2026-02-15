const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getTrendingProducts,
  getProductsByCategory,
  createProduct,
  updateProduct
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/', getAllProducts);
router.get('/trending', getTrendingProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Admin routes
router.post('/', authMiddleware, adminMiddleware, createProduct);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct);

module.exports = router;
