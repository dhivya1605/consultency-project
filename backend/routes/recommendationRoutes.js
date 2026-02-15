const express = require('express');
const router = express.Router();
const {
  getPersonalizedRecommendations,
  getFrequentlyBoughtTogether,
  getRelatedProducts
} = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/authMiddleware');

// Get personalized recommendations (requires login)
router.get('/personalized', authMiddleware, getPersonalizedRecommendations);

// Get frequently bought together (public)
router.get('/frequently-bought/:productId', getFrequentlyBoughtTogether);

// Get related products (public)
router.get('/related/:productId', getRelatedProducts);

module.exports = router;
