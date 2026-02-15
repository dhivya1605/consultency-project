const mongoose = require('mongoose');

const UserInteractionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  interactionType: {
    type: String,
    enum: ['view', 'click', 'purchase', 'addToCart'],
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  sessionId: String
});

module.exports = mongoose.model('UserInteraction', UserInteractionSchema);
