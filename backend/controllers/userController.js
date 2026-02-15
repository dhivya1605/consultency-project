const User = require('../models/User');
const UserInteraction = require('../models/UserInteraction');
const Order = require('../models/Order');
const axios = require('axios');

// Get user profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
};

// Update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;

    const user = await User.findByIdAndUpdate(
      req.userId,
      { name, phone, address, updatedAt: new Date() },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// Get user purchase history
const getUserPurchaseHistory = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .populate('items.productId');

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch history', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserPurchaseHistory
};
