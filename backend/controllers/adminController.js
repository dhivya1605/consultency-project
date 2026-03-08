const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const axios = require('axios');

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

// Get sales analytics
const getSalesAnalytics = async (req, res) => {
  try {
    // Monthly sales
    const monthlySales = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$orderDate' },
            month: { $month: '$orderDate' }
          },
          totalSales: { $sum: '$totalAmount' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Category-wise sales
    const categoryWiseSales = await Order.aggregate([
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.productId',
          foreignField: '_id',
          as: 'product'
        }
      },
      { $unwind: '$product' },
      {
        $group: {
          _id: '$product.category',
          totalSales: { $sum: { $multiply: ['$items.quantity', '$items.price'] } },
          orderCount: { $sum: 1 }
        }
      }
    ]);

    // Top products
    const topProducts = await Product.find({}, { name: 1, purchaseCount: 1, price: 1 })
      .sort({ purchaseCount: -1 })
      .limit(10)
      .lean(); // Convert Mongoose documents to plain JavaScript objects

    // Total metrics
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const totalUsers = await User.countDocuments();

    res.json({
      monthlySales,
      categoryWiseSales,
      topProducts,
      metrics: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        totalUsers
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch analytics', error: error.message });
  }
};

// Get dashboard overview
const getDashboardOverview = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const recentOrders = await Order.find()
      .sort({ orderDate: -1 })
      .limit(5)
      .populate('userId', 'name email');

    res.json({
      totalOrders,
      totalUsers,
      totalProducts,
      totalRevenue: totalRevenue[0]?.total || 0,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch dashboard', error: error.message });
  }
};

// Get sales report with ML predictions
const getSalesReport = async (req, res) => {
  try {
    // Get product sales data
    const productSales = await Order.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          quantity: { $sum: '$items.quantity' },
          amount: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $project: { name: '$_id', quantity: 1, amount: 1, _id: 0 } },
      { $sort: { amount: -1 } }
    ]);

    // Get totals
    const totalOrders = await Order.countDocuments();
    const totalSalesResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalSales = totalSalesResult[0]?.total || 0;

    // Get all orders for ML prediction
    const allOrders = await Order.find().sort({ orderDate: -1 });

    let prediction = null;
    let chartData = null;

    try {
      // Get sales prediction from ML API
      const predictionResponse = await axios.post(`${ML_API_URL}/api/sales-prediction`, {
        salesData: allOrders
      });
      prediction = predictionResponse.data;

      // Use the same productSales data for chart instead of calling ML API
      chartData = {
        chartData: productSales.slice(0, 10).map(item => ({
          product: item.name,
          sales: item.amount,
          percentage: Math.round((item.amount / totalSales) * 100)
        })),
        totalProducts: productSales.length,
        topProduct: productSales[0] ? [productSales[0].name, productSales[0].amount] : null
      };
    } catch (mlError) {
      console.log('ML API not available, using fallback data');
      // Fallback prediction
      prediction = {
        prediction: totalSales * 1.15,
        confidence: 0.6,
        trend: 'upward'
      };
      // Fallback chart data
      chartData = {
        chartData: productSales.slice(0, 5).map(item => ({
          product: item.name,
          sales: item.amount,
          percentage: Math.round((item.amount / totalSales) * 100)
        })),
        topProduct: productSales[0] ? [productSales[0].name, productSales[0].amount] : null
      };
    }

    res.json({
      productSales,
      totalOrders,
      totalSales,
      prediction,
      chartData
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch sales report', error: error.message });
  }
};

// Get all users with their order details
const getAllUsersWithOrders = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    
    const usersWithOrders = await Promise.all(
      users.map(async (user) => {
        const orders = await Order.find({ userId: user._id })
          .populate('items.productId', 'name price')
          .sort({ orderDate: -1 });
        
        return {
          ...user.toObject(),
          orders,
          totalOrders: orders.length,
          totalSpent: orders.reduce((sum, order) => sum + order.totalAmount, 0)
        };
      })
    );

    res.json(usersWithOrders);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

module.exports = {
  getSalesAnalytics,
  getDashboardOverview,
  getAllUsersWithOrders,
  getSalesReport
};
