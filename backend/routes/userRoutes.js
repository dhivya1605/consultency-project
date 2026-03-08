const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserPurchaseHistory,
  getAllUsers,
  updateUserBlockStatus
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware);

// User routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/history', getUserPurchaseHistory);

// Admin routes
router.get('/admin/all', adminMiddleware, getAllUsers);
router.put('/admin/:id/block', adminMiddleware, updateUserBlockStatus);

module.exports = router;
