const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Add to cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, price, productName, brand, image } = req.body;
    const userId = req.userId;

    let product = null;
    let finalPrice = price || 0;
    let originalPrice = price || 0;
    let offerPercentage = 0;
    let pName = productName || '';
    let pBrand = brand || '';
    let pImage = image || '';

    try {
      if (productId.toString().length === 24) {
        product = await Product.findById(productId);
        if (product) {
          originalPrice = product.price;
          offerPercentage = product.hasOffer ? product.offerPercentage : 0;
          
          // Check for offer expiry
          let isOfferValid = product.hasOffer;
          if (product.hasOffer && product.offerExpiry) {
            const expiry = new Date(product.offerExpiry);
            if (new Date() > expiry) {
              isOfferValid = false;
              offerPercentage = 0;
            }
          }

          if (isOfferValid) {
            finalPrice = originalPrice - (originalPrice * offerPercentage / 100);
          } else {
            finalPrice = originalPrice;
          }

          pName = product.name || pName;
          pBrand = product.brand || pBrand;
          pImage = product.image || product.imageUrl || pImage;
        }
      }
    } catch (err) {
      console.log('Product not found as MongoDB ObjectId, using request data');
      finalPrice = price || 0;
      originalPrice = price || 0;
    }

    if (!product && !price) {
      return res.status(400).json({ message: 'Product price is required' });
    }

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [{ 
          productId, 
          quantity, 
          price: finalPrice, 
          originalPrice,
          offerPercentage,
          productName: pName, 
          brand: pBrand, 
          image: pImage 
        }]
      });
    } else {
      const existingIndex = cart.items.findIndex(
        item => item.productId.toString() === productId.toString()
      );

      if (existingIndex > -1) {
        cart.items[existingIndex].quantity += quantity;
        // Update price in case it changed since last add
        cart.items[existingIndex].price = finalPrice;
        cart.items[existingIndex].originalPrice = originalPrice;
        cart.items[existingIndex].offerPercentage = offerPercentage;
      } else {
        cart.items.push({ 
          productId, 
          quantity, 
          price: finalPrice, 
          originalPrice,
          offerPercentage,
          productName: pName, 
          brand: pBrand, 
          image: pImage 
        });
      }
    }

    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();
    await cart.save();

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
    const cart = await Cart.findOne({ userId });

    if (!cart) {
      return res.json({ items: [], totalPrice: 0 });
    }

    res.json(cart);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch cart', error: error.message });
  }
};

// Update cart item quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.userId;
    const { productId, quantity } = req.body;

    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const item = cart.items.find(item => item.productId.toString() === productId);
    if (!item) return res.status(404).json({ message: 'Item not in cart' });

    if (quantity <= 0) {
      cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    } else {
      item.quantity = quantity;
    }

    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();
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
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    cart.totalPrice = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.updatedAt = new Date();
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
      { items: [], totalPrice: 0, updatedAt: new Date() },
      { new: true }
    );
    res.json({ message: 'Cart cleared', cart });
  } catch (error) {
    res.status(500).json({ message: 'Failed to clear cart', error: error.message });
  }
};

module.exports = { addToCart, getCart, updateCartItem, removeFromCart, clearCart };
