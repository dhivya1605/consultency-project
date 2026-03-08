const Product = require('../models/Product');
const UserInteraction = require('../models/UserInteraction');
const jwt = require('jsonwebtoken');

// Get all products with filtering
const getAllProducts = async (req, res) => {
  try {
    const { category, brand, search, sort, page = 1, limit = 10 } = req.query;

    let query = {};

    // hide out-of-stock products for non-admin users
    // attempt to decode token if present to determine role
    const token = req.headers.authorization?.split(' ')[1];
    let callerIsAdmin = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') {
          // admin sees all products
          callerIsAdmin = true;
          console.log('✓ Admin detected via token:', decoded.email);
        }
      } catch (err) {
        // ignore invalid token
        console.log('Token verification failed:', err.message);
      }
    }
    // if ?admin=true is explicitly provided, treat as admin even without token
    const explicitAdmin = req.query.admin === 'true';
    console.log('Admin check: callerIsAdmin=', callerIsAdmin, 'explicitAdmin=', explicitAdmin);
    
    if (!callerIsAdmin && !explicitAdmin) {
      // regular shoppers only see products that are in stock *and* marked visible
      query.stock = { $gt: 0 };
      query.visible = true;
      console.log('Applying customer filters: visible=true, stock>0');
    } else {
      console.log('Admin access granted - returning ALL products');
    }

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

    console.log(`Returning ${result.length} products (total matching query: ${total})`);
    result.forEach(p => {
      if (!p.visible) console.log(`  - ${p.name} (HIDDEN)`);
    });

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
  // ensure only visible items are considered for non-admin callers
  try {
    let search = Product.find();
    // hide invisible for regular users or when no explicit admin flag
    const token = req.headers.authorization?.split(' ')[1];
    let callerIsAdminLocal = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') callerIsAdminLocal = true;
      } catch {}
    }
    const explicitAdminLocal = req.query.admin === 'true';
    if (!callerIsAdminLocal && !explicitAdminLocal) {
      search = search.where({ visible: true });
    }
    const trendingProducts = await search.sort({ purchaseCount: -1, viewCount: -1 }).limit(10);

    res.json(trendingProducts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch trending products', error: error.message });
  }
};

// Get products by category
const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    let query = { category };

    // hide invisible from regular users unless explicit admin query
    const token = req.headers.authorization?.split(' ')[1];
    let callerIsAdmin = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded.role === 'admin') callerIsAdmin = true;
      } catch {}
    }
    const explicitAdmin = req.query.admin === 'true';
    if (!callerIsAdmin && !explicitAdmin) {
      query.visible = true;
      query.stock = { $gt: 0 };
    }

    const products = await Product.find(query);

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch category products', error: error.message });
  }
};

// Create product (Admin only)
const createProduct = async (req, res) => {
  try {
    console.log('Creating product with data:', {
      body: req.body,
      hasFile: !!req.file,
      fileName: req.file?.filename,
      filePath: req.file?.path
    });

    // body fields may come from multipart/form-data
    const { name, description, price, category, brand, image, specifications, externalSource, stock } = req.body;

    // Convert string values from FormData to proper types
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10) || 0;

    if (!name || !price || !category || !brand) {
      console.warn('Missing required fields:', { name, price, category, brand });
      return res.status(400).json({ message: 'Missing required fields: name, price, category, brand' });
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      console.warn('Invalid price:', { price, parsedPrice });
      return res.status(400).json({ message: 'Price must be a valid positive number' });
    }

    if (!req.file && !image) {
      console.warn('No image provided for new product');
      return res.status(400).json({ message: 'Image is required for new products' });
    }

    // Get image URL from local upload
    let imageUrl = image;
    if (req.file) {
      // Local multer diskStorage provides filename in req.file.filename
      imageUrl = `/uploads/${req.file.filename}`;
      if (!imageUrl) {
        console.error('No image filename found in req.file');
        return res.status(400).json({ message: 'Image upload failed - no filename received' });
      }
      console.log('✓ Image uploaded successfully:', imageUrl);
    }

    const product = new Product({
      name,
      description,
      price: parsedPrice,
      category,
      brand,
      image: imageUrl,
      specifications,
      externalSource,
      stock: parsedStock,
      visible: req.body.visible !== undefined ? req.body.visible : true
    });

    console.log('Product object created:', product);
    await product.save();
    console.log('Product saved successfully:', product._id);
    res.status(201).json({ message: 'Product created', product });
  } catch (error) {
    console.error('Error creating product:', error.message, error.stack);
    res.status(500).json({ message: 'Failed to create product', error: error.message });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    console.log('updateProduct called', req.params.id, req.body, req.file && req.file.path);
    // allow stock updates among other fields
    const updates = { ...req.body };
    
    // Convert numeric fields from FormData strings to proper types
    if (updates.price !== undefined) {
      updates.price = parseFloat(updates.price);
      if (isNaN(updates.price) || updates.price <= 0) {
        return res.status(400).json({ message: 'Price must be a valid positive number' });
      }
    }
    
    if (updates.stock !== undefined) {
      updates.stock = parseInt(updates.stock, 10);
    }
    
    if (updates.visible !== undefined) {
      updates.visible = updates.visible === 'true' || updates.visible === true;
    }

    // if new image file uploaded, overwrite with local URL
    if (req.file) {
      const imageUrl = `/uploads/${req.file.filename}`;
      if (!imageUrl) {
        console.error('No image filename found in req.file');
        return res.status(400).json({ message: 'Image upload failed - no filename received' });
      }
      updates.image = imageUrl;
      console.log('✓ Image updated successfully:', imageUrl);
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true }
    );
    console.log('updateProduct result', product);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product updated', product });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product', error: error.message });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete product', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getTrendingProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct
};
