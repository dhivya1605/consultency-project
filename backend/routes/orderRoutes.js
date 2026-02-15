const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  processPayment,
  getAllOrders,
  updateOrderStatus
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware);

// User routes
router.post('/', createOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.post('/payment/process', processPayment);

// Admin routes
router.get('/admin/all', adminMiddleware, getAllOrders);
router.put('/admin/status', adminMiddleware, updateOrderStatus);

module.exports = router;
