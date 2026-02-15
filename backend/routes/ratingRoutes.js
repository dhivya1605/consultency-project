const express = require('express');
const router = express.Router();
const { submitRating, getRatingAnalytics } = require('../controllers/ratingController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.post('/submit', authMiddleware, submitRating);
router.get('/analytics', authMiddleware, adminMiddleware, getRatingAnalytics);

module.exports = router;