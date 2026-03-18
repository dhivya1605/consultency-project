const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const UserInteraction = require('../models/UserInteraction');
const crypto = require('crypto');
const { sendOrderStatusEmail } = require('../utils/emailService');
const User = require('../models/User');

// Create order from cart
const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { deliveryAddress, phoneNumber, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Build order items with productName, brand
    const orderItems = cart.items.map(item => {
      const productId = item.productId?._id || item.productId;
      return {
        productId,
        productName: item.productName || item.productId?.name || `Product ${productId}`,
        brand: item.brand || item.productId?.brand || '',
        name: item.productName || item.productId?.name || `Product ${productId}`,
        price: item.price,
        quantity: item.quantity
      };
    });

    const order = new Order({
      userId,
      items: orderItems,
      totalAmount: cart.totalPrice,
      deliveryAddress,
      phoneNumber: phoneNumber || '',
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: 'Pending',
      orderStatus: 'Placed',
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });

    await order.save();

    // Save/Update user's default delivery details
    await User.findByIdAndUpdate(userId, {
      savedAddress: deliveryAddress,
      savedPhone: phoneNumber,
      updatedAt: new Date()
    });

    // Reduce stock for each product
    for (const item of orderItems) {
      const product = await Product.findById(item.productId);
      if (product) {
        if ((product.stock || 0) < (item.quantity || 0)) {
          await Order.deleteOne({ _id: order._id });
          return res.status(400).json({
            message: `Not enough stock for ${item.productName}. Available: ${product.stock || 0}`
          });
        }
        product.stock = (product.stock || 0) - (item.quantity || 0);
        await product.save();
      }
    }

    // Clear cart
    await Cart.deleteOne({ userId });

    // Fetch updated user to return
    const updatedUser = await User.findById(userId).select('-password');

    res.status(201).json({ 
      message: 'Order created successfully', 
      order,
      user: updatedUser 
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Simulate online payment — generates a fake transaction ID and marks order Paid
const processSimulatedPayment = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Generate a fake transaction ID
    const transactionId = 'TXN' + crypto.randomBytes(6).toString('hex').toUpperCase();

    order.paymentStatus = 'Paid';
    order.orderStatus = 'Placed';
    order.transactionId = transactionId;
    order.updatedAt = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'Payment successful',
      transactionId,
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment failed', error: error.message });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId }).sort({ orderDate: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

// Legacy: process payment (kept for compatibility)
const processPayment = processSimulatedPayment;

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = {};
    if (status) query.orderStatus = status;

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .sort({ orderDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({ orders, total, pages: Math.ceil(total / limit), currentPage: page });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    const order = await Order.findById(orderId).populate('userId', 'name email');
    if (!order) return res.status(404).json({ message: 'Order not found' });

    const validTransitions = {
      'Placed':           ['Packed', 'Cancelled'],
      'Packed':           ['Shipped', 'Cancelled'],
      'Shipped':          ['Out for Delivery'],
      'Out for Delivery': ['Delivered'],
      'Delivered':        [],
      'Cancelled':        []
    };

    const allowed = validTransitions[order.orderStatus] || [];
    if (!allowed.includes(orderStatus)) {
      return res.status(400).json({
        message: `Cannot move from "${order.orderStatus}" to "${orderStatus}". Allowed: ${allowed.join(', ') || 'none'}`
      });
    }

    order.orderStatus = orderStatus;
    order.updatedAt = new Date();


    await order.save();

    // Send status update email
    if (order.userId && order.userId.email) {
      await sendOrderStatusEmail(order, order.userId);
    }

    res.json({ message: `Order moved to ${orderStatus}`, order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

// Manually mark order as paid (Admin)
const capturePayment = async (req, res) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);
    
    if (!order) return res.status(404).json({ message: 'Order not found' });
    
    order.paymentStatus = order.paymentMethod === 'online' ? 'Paid' : 'Received';
    order.updatedAt = new Date();
    await order.save();
    
    res.json({ message: 'Payment status updated', order });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update payment', error: error.message });
  }
};

// User cancels their own order (within 24 hours)
const cancelOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) return res.status(404).json({ message: 'Order not found' });

    // 1. Check if cancellable status (Strictly 'Placed' only)
    if (order.orderStatus !== 'Placed') {
      return res.status(400).json({ 
        message: `Order is already ${order.orderStatus.toLowerCase()} and cannot be cancelled.` 
      });
    }

    // 2. Check 24-hour window
    const orderTime = new Date(order.orderDate).getTime();
    const currentTime = Date.now();
    const hoursElapsed = (currentTime - orderTime) / (1000 * 60 * 60);

    if (hoursElapsed > 24) {
      return res.status(400).json({ 
        message: 'Order cancellation is only allowed within 24 hours of placement.' 
      });
    }

    // 3. Update status
    order.orderStatus = 'Cancelled';
    order.updatedAt = new Date();
    await order.save();

    // 4. Send cancellation email
    const user = await User.findById(userId);
    if (user && user.email) {
      await sendOrderStatusEmail(order, user);
    }

    // 5. Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.stock = (product.stock || 0) + (item.quantity || 0);
        await product.save();
      }
    }

    res.json({ message: 'Order cancelled successfully', order });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({ message: 'Failed to cancel order', error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  processPayment,
  processSimulatedPayment,
  getAllOrders,
  updateOrderStatus,
  capturePayment,
  cancelOrder
};
