import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, loading, removeFromCart, updateCartItem, clearCart } = useCart();
  const [productDetails, setProductDetails] = useState({});

  // Fetch product details for external API products
  useEffect(() => {
    const fetchProductDetails = async () => {
      const details = {};
      for (const item of cart.items || []) {
        const productId = item.productId?._id || item.productId;
        if (!item.productId?.name && !details[productId]) {
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
    return <div>Loading cart...</div>;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return <div className="empty-cart">Your cart is empty</div>;
  }

  return (
    <div className="cart-container">
      <h2>Shopping Cart</h2>
      <div className="cart-items">
        {cart.items.map(item => {
          const productId = item.productId?._id || item.productId;
          const productName = item.productId?.name || productDetails[productId]?.title || 'Product';
          
          return (
            <div key={productId} className="cart-item">
              <div className="item-info">
                <h4>{productName}</h4>
                <p>Price: ₹{item.price}</p>
              </div>
              <div className="item-quantity">
                <button onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}>-</button>
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleQuantityChange(item.productId, parseInt(e.target.value))}
                />
                <button onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}>+</button>
              </div>
              <div className="item-total">
                ₹{item.price * item.quantity}
              </div>
              <button onClick={() => handleRemoveItem(item.productId)} className="remove-btn">Remove</button>
            </div>
          );
        })}
      </div>
      <div className="cart-summary">
        <h3>Total: ₹{cart.totalPrice}</h3>
        <button onClick={handleCheckout} className="checkout-btn">Proceed to Checkout</button>
        <button onClick={clearCart} className="clear-btn">Clear Cart</button>
      </div>
    </div>
  );
};

export default Cart;
