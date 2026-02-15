const Product = require('../models/Product');
const UserInteraction = require('../models/UserInteraction');

// Get all products with filtering
const getAllProducts = async (req, res) => {
  try {
    const { category, brand, search, sort, page = 1, limit = 10 } = req.query;

    let query = {};

    if (category) query.category = category;
    if (brand) query.brand = brand;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    let products = Product.find(query);

    if (sort === 'price-asc') products = products.sort({ price: 1 });
    if (sort === 'price-desc') products = products.sort({ price: -1 });
    if (sort === 'rating') products = products.sort({ rating: -1 });

    const skip = (page - 1) * limit;
    products = products.skip(skip).limit(parseInt(limit));

    const result = await products.exec();
    const total = await Product.countDocuments(query);

    res.json({
      products: result,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch products', error: error.message });
  }
};

// Get single product by ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Record user interaction if logged in
    if (req.userId) {
      new UserInteraction({
        userId: req.userId,
        productId: product._id,
        interactionType: 'view'
      }).save();
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch product', error: error.message });
  }
};

// Get trending/popular products
const getTrendingProducts = async (req, res) => {
  try {
    const trendingProducts = await Product.find()
      .sort({ purchaseCount: -1, viewCount: -1 })
      .limit(10);

    res.json(trendingProducts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trending products', error: error.message });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const products = await Product.find({ category });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category products', error: error.message });
  }
};

// Create product (Admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, image, specifications, externalSource } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      brand,
      image,
      specifications,
      externalSource
    });

    await product.save();
    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated', product });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getTrendingProducts,
  getProductsByCategory,
  createProduct,
  updateProduct
};
