const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  getAllProducts,
  getProductById,
  getTrendingProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateOffer,
  bulkRemoveOffer
} = require('../controllers/productController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

// Public routes
router.get('/', getAllProducts);
router.get('/trending', getTrendingProducts);
router.get('/category/:category', getProductsByCategory);
router.get('/:id', getProductById);

// Admin routes (restricted by role)
// accept multipart/form-data with optional image file
router.post('/', 
  authMiddleware, 
  adminMiddleware, 
  upload.single('image'),
  createProduct
);

router.put('/:id', 
  authMiddleware, 
  adminMiddleware, 
  upload.single('image'),
  updateProduct
);

router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct);

// Bulk offer routes
router.post('/bulk-offer', authMiddleware, adminMiddleware, bulkUpdateOffer);
router.post('/bulk-remove-offer', authMiddleware, adminMiddleware, bulkRemoveOffer);

// Error handling middleware for multer (must be at the end)
const upload_module = require('../middleware/upload');
router.use(upload_module.handleMulterError);

module.exports = router;
