import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading, removeFromCart, updateCartItem, clearCart } = useCart();
  const [productDetails, setProductDetails] = useState({});

  useEffect(() => {
    const fetchProductDetails = async () => {
      const details = {};
      for (const item of cart.items || []) {
        const productId = item.productId?._id || item.productId;
        if (!item.productName && !item.productId?.name && !details[productId]) {
          try {
            const response = await fetch(`https://fakestoreapi.com/products/${productId}`);
            const product = await response.json();
            details[productId] = product;
          } catch (error) {
            console.error('Failed to fetch product details:', error);
          }
        }
      }
      setProductDetails(details);
    };

    if (cart.items && cart.items.length > 0) {
      fetchProductDetails();
    }
  }, [cart.items]);

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity > 0) {
      const actualProductId = productId?._id || productId;
      updateCartItem(actualProductId, newQuantity);
    }
  };

  const handleRemoveItem = (productId) => {
    const actualProductId = productId?._id || productId;
    removeFromCart(actualProductId);
  };

  const handleCheckout = () => {
    if (!user) {
      alert('Please login to proceed');
      navigate('/auth');
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="cart-loading">
        <div className="cart-loading-spinner"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="empty-cart-page">
        <div className="empty-cart-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <button className="shop-now-btn" onClick={() => navigate('/')}>
          Shop Now
        </button>
      </div>
    );
  }

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.totalPrice || 0;
  
  // Calculate total savings
  const totalSavings = cart.items.reduce((sum, item) => {
    if (item.originalPrice && item.originalPrice > item.price) {
      return sum + ((item.originalPrice - item.price) * item.quantity);
    }
    return sum;
  }, 0);

  const deliveryCharge = subtotal > 500 ? 0 : 49;
  const total = subtotal + deliveryCharge;

  const getImageUrl = (img) => {
    if (!img) return null;
    if (img.startsWith('http')) return img;
    return `http://localhost:5000${img}`;
  };

  return (
    <div className="cart-page">
      <div className="cart-header-bar">
        <h1>Shopping Cart <span className="cart-count-badge">{itemCount} item{itemCount !== 1 ? 's' : ''}</span></h1>
      </div>

      <div className="cart-layout">
        {/* Cart Items */}
        <div className="cart-items-section">
          {cart.items.map(item => {
            const productId = item.productId?._id || item.productId;
            const productName = item.productName || item.productId?.name || productDetails[productId]?.title || 'Product';
            const brand = item.brand || item.productId?.brand || '';
            const image = item.image || item.productId?.image || productDetails[productId]?.image || '';
            const itemTotal = item.price * item.quantity;

            return (
              <div key={productId} className="cart-card">
                <div className="cart-card-image">
                  {image ? (
                    <img src={getImageUrl(image)} alt={productName} />
                  ) : (
                    <div className="cart-card-image-placeholder">
                      <span>📦</span>
                    </div>
                  )}
                </div>

                <div className="cart-card-info">
                  <h3 className="cart-product-name">{productName}</h3>
                  {brand && <p className="cart-product-brand">{brand}</p>}
                  {item.originalPrice && item.originalPrice > item.price ? (
                    <div className="cart-item-price-info">
                      <span className="cart-original-price">₹{item.originalPrice.toLocaleString('en-IN')}</span>
                      <span className="cart-discounted-price">₹{item.price.toLocaleString('en-IN')}</span>
                      <span className="cart-item-offer-badge">{item.offerPercentage}% OFF</span>
                    </div>
                  ) : (
                    <p className="cart-product-price">₹{item.price?.toLocaleString('en-IN')}</p>
                  )}
                </div>

                <div className="cart-card-controls">
                  <div className="qty-control">
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >−</button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    >+</button>
                  </div>
                  <p className="cart-item-total">₹{itemTotal?.toLocaleString('en-IN')}</p>
                  <button
                    className="remove-item-btn"
                    onClick={() => handleRemoveItem(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            );
          })}

          <button className="clear-cart-link" onClick={clearCart}>
            Clear entire cart
          </button>
        </div>

        {/* Order Summary */}
        <div className="cart-summary-panel">
          <h2>Order Summary</h2>

          <div className="summary-lines">
            <div className="summary-line">
              <span>Subtotal ({itemCount} item{itemCount !== 1 ? 's' : ''})</span>
              <span>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div className={`summary-line ${deliveryCharge === 0 ? 'free-delivery' : ''}`}>
              <span>Delivery</span>
              <span>{deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}</span>
            </div>
            {totalSavings > 0 && (
              <div className="summary-line savings-line">
                <span>Offer Savings</span>
                <span>- ₹{totalSavings.toLocaleString('en-IN')}</span>
              </div>
            )}
            {deliveryCharge === 0 && (
              <div className="free-delivery-banner">
                You're saving ₹49 on delivery!
              </div>
            )}
            {deliveryCharge > 0 && (
              <div className="delivery-tip">
                Add ₹{(500 - subtotal).toLocaleString('en-IN')} more for FREE delivery
              </div>
            )}
          </div>

          <div className="summary-total">
            <span>Total</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>

          <button className="checkout-cta-btn" onClick={handleCheckout}>
            Proceed to Checkout →
          </button>

          <button className="continue-shopping-link" onClick={() => navigate('/')}>
            ← Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
