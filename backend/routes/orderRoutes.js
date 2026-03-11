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
router.put('/update-status/:id', async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Define valid status transitions
    const validTransitions = {
      Pending: ['Processing', 'Cancelled'],
      Processing: ['Shipped'],
      Shipped: ['Delivered'],
      Delivered: []
    };

    // Check if the transition is valid
    if (!validTransitions[order.orderStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from ${order.orderStatus} to ${status}`
      });
    }

    // Update the status
    order.orderStatus = status;
    order.updatedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating status',
      error: error.message
    });
  }
});

module.exports = router;
