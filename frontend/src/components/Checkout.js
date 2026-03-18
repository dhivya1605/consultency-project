import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const { cart, clearCart } = useCart();

  // — All hooks must be declared before any conditional returns —
  const [step, setStep] = useState(1); // 1=Address, 2=Payment, 3=Review
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.savedAddress || '');
  const [phoneNumber, setPhoneNumber] = useState(user?.savedPhone || '');
  const [phoneError, setPhoneError] = useState('');
  const [addressError, setAddressError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.savedAddress) setDeliveryAddress(user.savedAddress);
      if (user.savedPhone) setPhoneNumber(user.savedPhone);
    }
  }, [user]);

  // Phone validation: 10 digits, starts with 6-9 (Indian mobile)
  const validatePhone = (phone) => {
    if (!phone.trim()) return 'Phone number is required';
    if (!/^[6-9][0-9]{9}$/.test(phone)) return 'Enter a valid 10-digit mobile number (starts with 6–9)';
    return '';
  };

  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(val);
    setPhoneError(validatePhone(val));
  };

  const handleAddressChange = (e) => {
    const val = e.target.value;
    setDeliveryAddress(val);
    setAddressError(val.trim() ? '' : 'Delivery address is required');
  };

  // Guard: redirect if not logged in or cart is empty
  if (!user) {
    navigate('/auth');
    return null;
  }
  if (!cart || !cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const subtotal = cart.totalPrice || 0;
  const deliveryCharge = subtotal > 500 ? 0 : 49;
  const total = subtotal + deliveryCharge;

  const handleStepOneNext = () => {
    const pErr = validatePhone(phoneNumber);
    const aErr = !deliveryAddress.trim() ? 'Delivery address is required' : '';
    setPhoneError(pErr);
    setAddressError(aErr);
    if (pErr || aErr) return;
    setStep(2);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const orderData = { deliveryAddress, phoneNumber, paymentMethod };
      const response = await axios.post('http://localhost:5000/api/orders', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const createdOrder = response.data.order;

      // Update local user data if returned
      if (response.data.user) {
        updateUser(response.data.user);
      }

      if (paymentMethod === 'online') {
        navigate('/payment', { state: { order: createdOrder, total } });
      } else {
        await clearCart();
        navigate('/order-confirmation', { state: { orderData: createdOrder } });
      }
    } catch (error) {
      console.error('Failed to place order:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const steps = ['Delivery', 'Payment', 'Review'];

  return (
    <div className="checkout-page">
      {/* Step indicator */}
      <div className="checkout-steps-bar">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <div className={`checkout-step ${step === i + 1 ? 'active' : step > i + 1 ? 'done' : ''}`}>
              <div className="step-circle">{step > i + 1 ? '✓' : i + 1}</div>
              <span className="step-label">{s}</span>
            </div>
            {i < steps.length - 1 && <div className="step-connector" />}
          </React.Fragment>
        ))}
      </div>

      <div className="checkout-body">
        <div className="checkout-main">

          {/* Step 1: Delivery */}
          {step === 1 && (
            <div className="checkout-form-card">
              <h2>Delivery Details</h2>

              <div className="form-field">
                <label>Full Delivery Address *</label>
                <textarea
                  placeholder="House No., Street, City, State, Pincode"
                  value={deliveryAddress}
                  onChange={handleAddressChange}
                  rows={3}
                  className={`checkout-textarea ${addressError ? 'input-field-error' : deliveryAddress.trim() ? 'input-field-valid' : ''}`}
                />
                {addressError && <p className="field-error-msg">{addressError}</p>}
              </div>

              <div className="form-field">
                <label>Phone Number *</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile number (e.g. 9876543210)"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  className={`checkout-input ${phoneError ? 'input-field-error' : phoneNumber.length === 10 && !phoneError ? 'input-field-valid' : ''}`}
                  maxLength={10}
                />
                {phoneError && <p className="field-error-msg">{phoneError}</p>}
                {!phoneError && phoneNumber.length === 10 && (
                  <p className="field-valid-msg">✓ Valid phone number</p>
                )}
              </div>

              <button className="checkout-next-btn" onClick={handleStepOneNext}>
                Continue to Payment →
              </button>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="checkout-form-card">
              <h2>Choose Payment Method</h2>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                  />
                  <div className="payment-option-content">
                    <div className="payment-option-icon">💵</div>
                    <div>
                      <strong>Cash on Delivery</strong>
                      <p>Pay at your doorstep when the order arrives</p>
                    </div>
                  </div>
                </label>
                <label className={`payment-option ${paymentMethod === 'online' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={() => setPaymentMethod('online')}
                  />
                  <div className="payment-option-content">
                    <div className="payment-option-icon">💳</div>
                    <div>
                      <strong>Online Payment</strong>
                      <p>Pay securely with Card, UPI, Net Banking</p>
                    </div>
                    <span className="instant-confirm-tag">Instant Confirmation</span>
                  </div>
                </label>
              </div>
              <div className="checkout-nav-row">
                <button className="checkout-back-btn" onClick={() => setStep(1)}>← Back</button>
                <button className="checkout-next-btn" onClick={() => setStep(3)}>Review Order →</button>
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === 3 && (
            <div className="checkout-form-card">
              <h2>Review Your Order</h2>
              <div className="review-section">
                <div className="review-header">
                  <span>Delivery To</span>
                  <button className="edit-link" onClick={() => setStep(1)}>Edit</button>
                </div>
                <p className="review-value">{deliveryAddress}</p>
                <p className="review-value">📞 {phoneNumber}</p>
              </div>
              <div className="review-section">
                <div className="review-header">
                  <span>Payment</span>
                  <button className="edit-link" onClick={() => setStep(2)}>Edit</button>
                </div>
                <p className="review-value">
                  {paymentMethod === 'cod' ? '💵 Cash on Delivery' : '💳 Online Payment'}
                </p>
              </div>
              <div className="review-section">
                <div className="review-header"><span>Items ({cart.items.length})</span></div>
                {cart.items.map((item, idx) => {
                  const name = item.productName || item.productId?.name || 'Product';
                  const brand = item.brand || item.productId?.brand || '';
                  const image = item.image || item.productId?.image || '';
                  
                  const getImageUrl = (img) => {
                    if (!img) return null;
                    if (img.startsWith('http')) return img;
                    return `http://localhost:5000${img}`;
                  };

                  return (
                    <div key={idx} className="review-item-row-premium">
                      <div className="review-item-main">
                        <div className="review-item-img">
                          {image ? <img src={getImageUrl(image)} alt={name} /> : <div className="placeholder">📦</div>}
                        </div>
                        <div className="review-item-details">
                          <span className="review-item-name">{name}</span>
                          {brand && <span className="review-item-brand">{brand}</span>}
                          <span className="review-item-qty">Qty: {item.quantity}</span>
                        </div>
                      </div>
                      <span className="review-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>
              <div className="checkout-nav-row">
                <button className="checkout-back-btn" onClick={() => setStep(2)}>← Back</button>
                <button
                  className="place-order-btn"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading
                    ? 'Placing Order...'
                    : paymentMethod === 'online'
                      ? `Proceed to Pay ₹${total.toLocaleString('en-IN')}`
                      : 'Place Order'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary Sidebar */}
        <div className="checkout-summary-sidebar">
          <h3>Price Details</h3>
          <div className="sidebar-line">
            <span>Price ({cart.items.length} item{cart.items.length !== 1 ? 's' : ''})</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="sidebar-line">
            <span>Delivery Charges</span>
            <span className={deliveryCharge === 0 ? 'free-text' : ''}>
              {deliveryCharge === 0 ? 'FREE' : `₹${deliveryCharge}`}
            </span>
          </div>
          <div className="sidebar-total">
            <span>Total Amount</span>
            <span>₹{total.toLocaleString('en-IN')}</span>
          </div>
          {deliveryCharge === 0 && (
            <div className="sidebar-saving">You save ₹49 on delivery!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Checkout;
