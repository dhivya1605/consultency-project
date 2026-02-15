const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, price } = req.body;
    const userId = req.userId;

    // Log for debugging
    console.log('Add to Cart - userId:', userId, 'productId:', productId, 'quantity:', quantity, 'price:', price);

    // Try to find product by MongoDB ObjectId first
    let product = null;
    let productPrice = price || 0;
    
    try {
      if (productId.toString().length === 24) { // MongoDB ObjectId length
        product = await Product.findById(productId);
        if (product) {
          productPrice = product.price;
        }
      }
    } catch (err) {
      console.log('Product not found as MongoDB ObjectId, using external product');
    }

    // If no product found in DB, use the price from request (for external API products)
    if (!product && !price) {
      return res.status(400).json({ message: 'Product price is required for external products' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        userId,
        items: [
          {
            productId: productId,
            quantity,
            price: productPrice
          }
        ]
      });
      console.log('Created new cart');
    } else {
      // Check if item already exists
      const existingItemIndex = cart.items.findIndex(
        item => item.productId.toString() === productId.toString()
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        cart.items[existingItemIndex].quantity += quantity;
        console.log('Updated existing item quantity');
      } else {
        // Add new item to cart
        cart.items.push({
          productId: productId,
          quantity,
          price: productPrice
        });
        console.log('Added new item to cart');
      }
    }

    // Calculate total price
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Save cart
    await cart.save();
    console.log('Cart saved successfully');

    res.json({ message: 'Product added to cart', cart });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Failed to add to cart', error: error.message });
  }
};

// Get cart
const getCart = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      return res.json({ items: [], totalPrice: 0 });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
};

// Update cart item
const updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    const item = cart.items.find(item => item.productId.toString() === productId);

    if (!item) {
      return res.status(404).json({ message: 'Item not in cart' });
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    } else {
      item.quantity = quantity;
    }

    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await cart.save();

    res.json({ message: 'Cart updated', cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update cart', error: error.message });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId } = req.body;

    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    await cart.save();

    res.json({ message: 'Item removed from cart', cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove from cart', error: error.message });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.userId;
    const cart = await Cart.findOneAndUpdate(
      { userId },
      { items: [], totalPrice: 0 },
      { new: true }
    );

    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
