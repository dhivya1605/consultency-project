const axios = require('axios');
const UserInteraction = require('../models/UserInteraction');
const Order = require('../models/Order');
const ProductAssociation = require('../models/ProductAssociation');
const Product = require('../models/Product');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

// Get personalized recommendations for user
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = req.query.limit || 10;

    // Get user's purchase and view history
    const userOrders = await Order.find({ userId })
      .populate('items.productId');

    const userInteractions = await UserInteraction.find({ userId })
      .populate('productId');

    // Get product data for ML model
    const purchasedProductIds = userOrders.flatMap(order =>
      order.items.map(item => item.productId._id.toString())
    );

    const viewedProductIds = userInteractions.map(interaction =>
      interaction.productId._id.toString()
    );

    // Call ML API for recommendations
    try {
      const mlResponse = await axios.post(`${ML_API_URL}/api/recommend`, {
        userId,
        purchasedProducts: purchasedProductIds,
        viewedProducts: viewedProductIds,
        limit
      });

      const recommendedProductIds = mlResponse.data.recommendations;
      const recommendedProducts = await Product.find({
        _id: { $in: recommendedProductIds }
      });

      res.json(recommendedProducts);
    } catch (mlError) {
      // Fallback: if ML API is down, return based on product associations
      const associatedProducts = await ProductAssociation.find({
        mainProductId: { $in: purchasedProductIds }
      })
        .populate('associatedProductId')
        .limit(limit);

      const products = associatedProducts.map(assoc => assoc.associatedProductId);
      res.json(products);
    }
  } catch (error) {
    res.status(500).json({ message: 'Failed to get recommendations', error: error.message });
  }
};

// Get frequently bought together
const getFrequentlyBoughtTogether = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = req.query.limit || 5;

    const associations = await ProductAssociation.find({
      mainProductId: productId,
      associationType: 'frequently_bought_together'
    })
      .populate('associatedProductId')
      .sort({ strength: -1 })
      .limit(limit);

    const products = associations.map(assoc => assoc.associatedProductId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch frequently bought together', error: error.message });
  }
};

// Get related/similar products
const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const limit = req.query.limit || 5;

    const associations = await ProductAssociation.find({
      mainProductId: productId,
      associationType: { $in: ['similar', 'accessory'] }
    })
      .populate('associatedProductId')
      .sort({ strength: -1 })
      .limit(limit);

    const products = associations.map(assoc => assoc.associatedProductId);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch related products', error: error.message });
  }
};

module.exports = {
  getPersonalizedRecommendations,
  getFrequentlyBoughtTogether,
  getRelatedProducts
};
