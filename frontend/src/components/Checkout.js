import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { cart, clearCart } = useCart();
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliveryType, setDeliveryType] = useState('standard');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const deliveryCost = deliveryType === 'express' ? 99 : 0;
  const subtotal = cart.totalPrice || 0;
  const total = subtotal + (subtotal > 500 ? 0 : deliveryCost);

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim() || !phoneNumber.trim()) {
      alert('Please fill in all delivery details');
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        deliveryAddress: deliveryAddress,
        paymentMethod: paymentMethod
      };

      const response = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      await clearCart();
      navigate('/order-confirmation', { state: { orderData: response.data.order } });
    } catch (error) {
      console.error('Failed to place order:', error);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div className="checkout-wrapper">
        <h1>Checkout</h1>

        {/* Cart Summary */}
        <div className="checkout-section">
          <h2>Order Summary</h2>
          <div className="order-items">
            {cart.items && cart.items.length > 0 ? (
              cart.items.map((item, index) => (
                <div key={index} className="order-item">
                  <span>{item.name || item.title}</span>
                  <span>₹{Math.round(item.price * 83)}</span>
                </div>
              ))
            ) : (
              <p>No items in cart</p>
            )}
          </div>
          <div className="order-summary">
            <div className="summary-row">
              <span>Subtotal:</span>
              <span>₹{Math.round(subtotal * 83)}</span>
            </div>
            {subtotal > 500 ? (
              <div className="summary-row discount">
                <span>✓ Free Delivery (Orders > ₹500)</span>
                <span>-₹0</span>
              </div>
            ) : (
              <div className="summary-row">
                <span>Delivery Charge:</span>
                <span>₹{deliveryCost}</span>
              </div>
            )}
            <div className="summary-row total">
              <span>Total:</span>
              <span>₹{Math.round(total * 83)}</span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div className="checkout-section">
          <h2>Delivery Address</h2>
          <input
            type="text"
            placeholder="Enter delivery address"
            value={deliveryAddress}
            onChange={(e) => setDeliveryAddress(e.target.value)}
            className="form-input"
          />
          <input
            type="tel"
            placeholder="Phone number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="form-input"
          />
        </div>

        {/* Delivery Type */}
        <div className="checkout-section">
          <h2>Delivery Type</h2>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="standard"
                checked={deliveryType === 'standard'}
                onChange={(e) => setDeliveryType(e.target.value)}
              />
              <span className="radio-text">📦 Standard Delivery (3-5 days) - FREE</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="express"
                checked={deliveryType === 'express'}
                onChange={(e) => setDeliveryType(e.target.value)}
              />
              <span className="radio-text">⚡ Express Delivery (1-2 days) - ₹99</span>
            </label>
          </div>
        </div>

        {/* Payment Method */}
        <div className="checkout-section">
          <h2>Payment Method</h2>
          <div className="radio-group">
            <label className="radio-label">
              <input
                type="radio"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="radio-text">💵 Cash on Delivery (Pay at doorstep)</span>
            </label>
            <label className="radio-label">
              <input
                type="radio"
                value="scheduled"
                checked={paymentMethod === 'scheduled'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span className="radio-text">📅 Scheduled Payment (Pay later)</span>
            </label>
          </div>

          {paymentMethod === 'scheduled' && (
            <div className="payment-info">
              <p>🔔 You will receive a payment link via email/SMS before delivery.</p>
              <p>Payment due within 48 hours of delivery.</p>
            </div>
          )}
        </div>

        {/* Place Order Button */}
        <div className="checkout-actions">
          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? 'Processing...' : '🛒 Place Order'}
          </button>
          <button
            className="continue-shopping-btn"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
