const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  processPayment,
  processSimulatedPayment,
  getAllOrders,
  updateOrderStatus,
  capturePayment,
  cancelOrder
} = require('../controllers/orderController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware);

// User routes
router.post('/', createOrder);
router.post('/cancel', cancelOrder);
router.get('/', getUserOrders);
router.get('/:id', getOrderById);

// Simulated payment (replaces Razorpay for now)
router.post('/payment/process', processPayment);
router.post('/payment/simulate', processSimulatedPayment);

// Admin routes
router.get('/admin/all', adminMiddleware, getAllOrders);
router.put('/admin/status', adminMiddleware, updateOrderStatus);
router.put('/admin/capture-payment', adminMiddleware, capturePayment);

module.exports = router;
