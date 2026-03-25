const Product = require('../models/Product');
const UserInteraction = require('../models/UserInteraction');
const jwt = require('jsonwebtoken');

// Get all products with filtering
const getAllProducts = async (req, res) => {
  try {
    const { category, brand, search, sort, page = 1, limit = 50 } = req.query;

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
    else if (sort === 'price-desc') products = products.sort({ price: -1 });
    else if (sort === 'rating') products = products.sort({ rating: -1 });
    else products = products.sort({ createdAt: -1 }); // Default: newest first

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
    const { 
      name, description, price, category, brand, image, 
      specifications, externalSource, stock, warranty,
      hasOffer, offerPercentage, offerExpiry, applyTo
    } = req.body;

    // Convert string values from FormData to proper types
    const parsedPrice = parseFloat(price);
    const parsedStock = parseInt(stock, 10) || 0;
    const parsedWarranty = parseInt(warranty, 10) || 0;
    const parsedHasOffer = hasOffer === 'true' || hasOffer === true;
    const parsedOfferPercentage = parseFloat(offerPercentage) || 0;
    
    let parsedSpecifications = specifications;
    if (typeof specifications === 'string') {
      try {
        parsedSpecifications = JSON.parse(specifications);
      } catch (e) {
        console.warn('Could not parse specifications:', e);
      }
    }

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
      specifications: parsedSpecifications,
      externalSource,
      stock: parsedStock,
      warranty: parsedWarranty,
      visible: req.body.visible !== undefined ? (req.body.visible === 'true' || req.body.visible === true) : true,
      hasOffer: parsedHasOffer,
      offerPercentage: parsedOfferPercentage,
      offerExpiry: offerExpiry ? new Date(offerExpiry) : undefined
    });

    console.log('Product object created:', product);
    await product.save();

    // If applyTo is specified (multi-select), apply the same offer to those product IDs
    if (applyTo && Array.isArray(JSON.parse(applyTo)) && JSON.parse(applyTo).length > 0) {
      const applyToIds = JSON.parse(applyTo);
      console.log('Applying offer to multiple products:', applyToIds);
      await Product.updateMany(
        { _id: { $in: applyToIds } },
        { 
          hasOffer: parsedHasOffer, 
          offerPercentage: parsedOfferPercentage, 
          offerExpiry: offerExpiry ? new Date(offerExpiry) : undefined 
        }
      );
    }
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
    
    if (updates.warranty !== undefined) {
      updates.warranty = parseInt(updates.warranty, 10);
    }
    
    if (updates.visible !== undefined) {
      updates.visible = updates.visible === 'true' || updates.visible === true;
    }

    if (updates.hasOffer !== undefined) {
      updates.hasOffer = updates.hasOffer === 'true' || updates.hasOffer === true;
    }

    if (updates.offerPercentage !== undefined) {
      updates.offerPercentage = parseFloat(updates.offerPercentage);
    }

    if (updates.offerExpiry !== undefined && updates.offerExpiry !== '') {
      updates.offerExpiry = new Date(updates.offerExpiry);
    }

    if (updates.specifications !== undefined && typeof updates.specifications === 'string') {
      try {
        updates.specifications = JSON.parse(updates.specifications);
      } catch (e) {
        console.warn('Could not parse specifications:', e);
      }
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

    // If applyTo is specified in update, it might mean the user wants to propagate this offer to others
    if (req.body.applyTo && Array.isArray(JSON.parse(req.body.applyTo)) && JSON.parse(req.body.applyTo).length > 0) {
      const applyToIds = JSON.parse(req.body.applyTo);
      const offerUpdate = {
        hasOffer: updates.hasOffer,
        offerPercentage: updates.offerPercentage,
        offerExpiry: updates.offerExpiry
      };
      console.log('Applying updated offer to multiple products:', applyToIds);
      await Product.updateMany(
        { _id: { $in: applyToIds } },
        offerUpdate
      );
    }

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

// Bulk update offers (Admin only)
const bulkUpdateOffer = async (req, res) => {
  try {
    const { productIds, offerPercentage, offerExpiry } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'No products selected' });
    }

    const updateData = {
      hasOffer: true,
      offerPercentage: parseFloat(offerPercentage) || 0,
      offerExpiry: offerExpiry ? new Date(offerExpiry) : undefined,
      updatedAt: Date.now()
    };

    await Product.updateMany(
      { _id: { $in: productIds } },
      { $set: updateData }
    );

    res.json({ message: `Offer updated for ${productIds.length} products` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update bulk offers', error: error.message });
  }
};

// Bulk remove offers (Admin only)
const bulkRemoveOffer = async (req, res) => {
  try {
    const { productIds } = req.body;

    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'No products selected' });
    }

    await Product.updateMany(
      { _id: { $in: productIds } },
      { 
        $set: { 
          hasOffer: false, 
          offerPercentage: 0, 
          offerExpiry: undefined,
          updatedAt: Date.now()
        } 
      }
    );

    res.json({ message: `Offer removed from ${productIds.length} products` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove bulk offers', error: error.message });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  getTrendingProducts,
  getProductsByCategory,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkUpdateOffer,
  bulkRemoveOffer
};
