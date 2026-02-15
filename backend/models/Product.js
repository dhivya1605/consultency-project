const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  price: {
    type: Number,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['TVs', 'Laptops', 'Refrigerators', 'Washing Machines', 'Accessories']
  },
  brand: String,
  image: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  reviews: {
    type: Number,
    default: 0
  },
  stock: {
    type: Number,
    default: 0
  },
  specifications: mongoose.Schema.Types.Mixed,
  viewCount: {
    type: Number,
    default: 0
  },
  purchaseCount: {
    type: Number,
    default: 0
  },
  isTrending: {
    type: Boolean,
    default: false
  },
  externalSource: {
    url: String,
    sourceWebsite: String
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

module.exports = mongoose.model('Product', ProductSchema);
