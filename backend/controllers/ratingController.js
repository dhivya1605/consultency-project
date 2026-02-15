const Rating = require('../models/Rating');

// Submit rating
const submitRating = async (req, res) => {
  try {
    const { orderId, rating, comment } = req.body;
    const userId = req.userId;

    const newRating = new Rating({
      userId,
      orderId,
      rating,
      comment
    });

    await newRating.save();
    res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
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
  getRatingAnalytics
};