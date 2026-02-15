const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
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
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: Number,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  totalPrice: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Cart', CartSchema);
