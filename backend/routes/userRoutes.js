const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  getUserPurchaseHistory
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);
router.get('/history', getUserPurchaseHistory);

module.exports = router;
