const mongoose = require('mongoose');

const ProductAssociationSchema = new mongoose.Schema({
  mainProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  associatedProductId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  associationType: {
    type: String,
    enum: ['accessory', 'similar', 'frequently_bought_together'],
    required: true
  },
  strength: {
    type: Number,
    default: 1,
    min: 0,
    max: 10
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('ProductAssociation', ProductAssociationSchema);
