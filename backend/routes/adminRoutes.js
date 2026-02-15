const express = require('express');
const router = express.Router();
const { getSalesAnalytics, getDashboardOverview, getAllUsersWithOrders, getSalesReport } = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

router.use(authMiddleware, adminMiddleware);

router.get('/analytics', getSalesAnalytics);
router.get('/overview', getDashboardOverview);
router.get('/users', getAllUsersWithOrders);
router.get('/sales-report', getSalesReport);

module.exports = router;
