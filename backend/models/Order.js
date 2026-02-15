const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      productId: {
        type: mongoose.Schema.Types.Mixed,
        required: true
      },
      name: String,
      price: Number,
      quantity: Number
    }
  ],
  totalAmount: {
    type: Number,
    required: true
  },
  deliveryAddress: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'online', 'scheduled'],
    default: 'cod'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  estimatedDelivery: Date,
  orderDate: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', OrderSchema);
