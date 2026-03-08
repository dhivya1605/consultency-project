const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const UserInteraction = require('../models/UserInteraction');

// Create order
const createOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { deliveryAddress, paymentMethod } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Create order items handling both DB and external products
    const orderItems = cart.items.map(item => {
      // For external API products, productId might be a string/number
      const productId = item.productId?._id || item.productId;
      const productName = item.productId?.name || `Product ${productId}`;
      
      return {
        productId: productId,
        name: productName,
        price: item.price,
        quantity: item.quantity
      };
    });

    // Create order
    const order = new Order({
      userId,
      items: orderItems,
      totalAmount: cart.totalPrice,
      deliveryAddress,
      paymentMethod,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
    });

    await order.save();

    // Reduce stock for each product in the order
    for (const item of orderItems) {
      const productId = item.productId;
      const product = await Product.findById(productId);

      if (product) {
        // Check if enough stock available
        if ((product.stock || 0) < (item.quantity || 0)) {
          // Restore order by deleting it since we don't have enough stock
          await Order.deleteOne({ _id: order._id });
          return res.status(400).json({ 
            message: `Not enough stock for ${item.name}. Available: ${product.stock || 0}, Requested: ${item.quantity || 0}` 
          });
        }
        
        // Reduce stock by the ordered quantity
        product.stock = (product.stock || 0) - (item.quantity || 0);
        await product.save();
        console.log(`Stock reduced for product ${productId}: ${item.quantity} units. New stock: ${product.stock}`);
      }
    }

    // Clear cart
    await Cart.deleteOne({ userId });

    res.status(201).json({
      message: 'Order created successfully',
      order
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ message: 'Failed to create order', error: error.message });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const userId = req.userId;
    const orders = await Order.find({ userId }).populate('items.productId');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.productId');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch order', error: error.message });
  }
};

// Process payment (Dummy payment)
const processPayment = async (req, res) => {
  try {
    const { orderId, cardDetails } = req.body;

    // Get the order and update status
    const order = await Order.findByIdAndUpdate(
      orderId,
      { paymentStatus: 'Completed', orderStatus: 'Confirmed' },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Payment processed successfully',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment processing failed', error: error.message });
  }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    if (status) query.orderStatus = status;

    const skip = (page - 1) * limit;
    const orders = await Order.find(query)
      .populate('userId', 'name email')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch orders', error: error.message });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus, updatedAt: new Date() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    res.json({
      message: 'Order status updated',
      order
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update order', error: error.message });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  processPayment,
  getAllOrders,
  updateOrderStatus
};
