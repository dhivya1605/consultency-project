const Rating = require('../models/Rating');
const Order = require('../models/Order');

// Get reviews for a specific product
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    
    // Get all ratings for this product directly
    const reviews = await Rating.find({ productId })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

// Submit rating
const submitRating = async (req, res) => {
  try {
    const { orderId, rating, comment, productId } = req.body;
    const userId = req.userId;

    // Verify the order belongs to the user and contains this product
    const order = await Order.findOne({
      _id: orderId,
      userId: userId,
      'items.productId': productId
    });

    if (!order) {
      return res.status(403).json({ message: 'You can only review products from your orders' });
    }

    const newRating = new Rating({
      userId,
      orderId,
      productId, // Added this field
      rating,
      comment
    });

    await newRating.save();
    res.status(201).json({ message: 'Review submitted successfully', rating: newRating });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit rating', error: error.message });
  }
};

// Get rating analytics for admin
const getRatingAnalytics = async (req, res) => {
  try {
    const totalRatings = await Rating.countDocuments();
    const avgRating = await Rating.aggregate([
      { $group: { _id: null, average: { $avg: '$rating' } } }
    ]);

    const ratingDistribution = await Rating.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    const recentRatings = await Rating.find()
      .populate('userId', 'name')
      .populate('orderId', 'orderDate')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      totalRatings,
      averageRating: avgRating[0]?.average || 0,
      ratingDistribution,
      recentRatings
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch rating analytics', error: error.message });
  }
};

module.exports = {
  submitRating,
  getRatingAnalytics,
  getProductReviews
};