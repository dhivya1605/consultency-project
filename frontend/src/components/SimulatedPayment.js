import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const SimulatedPayment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const { clearCart } = useCart();

  const { order, total } = location.state || {};

  const [paymentMode, setPaymentMode] = useState('card'); // card | upi
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');
  const [upiId, setUpiId] = useState('');
  const [step, setStep] = useState('form'); // form | otp | success
  const [otp, setOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!order) {
    navigate('/cart');
    return null;
  }

  const formatCardNumber = (val) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) return raw.slice(0, 2) + '/' + raw.slice(2);
    return raw;
  };

  const handlePayNow = () => {
    setError('');
    if (paymentMode === 'card') {
      if (!cardNumber || !expiry || !cvv || !cardName) {
        setError('Please fill in all card details');
        return;
      }
      if (cardNumber.replace(/\s/g, '').length < 16) {
        setError('Please enter a valid 16-digit card number');
        return;
      }
    } else {
      if (!upiId || !upiId.includes('@')) {
        setError('Please enter a valid UPI ID (e.g., name@upi)');
        return;
      }
    }

    // Generate a random 6-digit OTP
    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(generatedOtp);
    setStep('otp');
  };

  const handleVerifyOtp = async () => {
    if (enteredOtp !== otp) {
      setError('Invalid OTP. Please try again.');
      return;
    }

    setProcessing(true);
    setError('');
    try {
      await axios.post(
        'http://localhost:5000/api/orders/payment/simulate',
        { orderId: order._id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      await clearCart();
      setStep('success');
    } catch (err) {
      setError('Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (step === 'success') {
    return (
      <div className="payment-success-page">
        <div className="payment-success-card">
          <div className="success-animation">
            <div className="success-circle">✓</div>
          </div>
          <h1>Payment Successful!</h1>
          <p className="success-amount">₹{total?.toLocaleString('en-IN')}</p>
          <p className="success-message">Your order has been confirmed. We'll keep you updated!</p>
          <div className="success-actions">
            <button
              className="track-order-btn"
              onClick={() => navigate('/profile')}
            >
              Track Order
            </button>
            <button
              className="continue-shopping-btn-sm"
              onClick={() => navigate('/')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'otp') {
    return (
      <div className="payment-page">
        <div className="payment-card">
          <div className="payment-card-header">
            <div className="bank-logo">🔒</div>
            <h2>OTP Verification</h2>
          </div>
          <p className="otp-info">
            A 6-digit OTP has been sent to your registered mobile number.
          </p>

          {/* Demo box showing the OTP */}
          <div className="demo-otp-box">
            <span>Demo OTP (for testing):</span>
            <strong>{otp}</strong>
          </div>

          <div className="otp-input-group">
            <label>Enter OTP</label>
            <input
              type="text"
              maxLength={6}
              value={enteredOtp}
              onChange={e => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="• • • • • •"
              className="otp-input"
            />
          </div>

          {error && <p className="payment-error">{error}</p>}

          <button
            className="pay-now-btn"
            onClick={handleVerifyOtp}
            disabled={processing}
          >
            {processing ? 'Verifying...' : 'Confirm Payment'}
          </button>

          <button className="back-to-form" onClick={() => { setStep('form'); setEnteredOtp(''); setError(''); }}>
            ← Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-page">
      <div className="payment-layout">
        <div className="payment-card">
          <div className="payment-card-header">
            <div className="secure-badge">🔒 Secure Payment</div>
            <div className="payment-amount-display">₹{total?.toLocaleString('en-IN')}</div>
          </div>

          {/* Payment Mode Tabs */}
          <div className="payment-mode-tabs">
            <button
              className={`payment-tab ${paymentMode === 'card' ? 'active' : ''}`}
              onClick={() => setPaymentMode('card')}
            >
              💳 Card
            </button>
            <button
              className={`payment-tab ${paymentMode === 'upi' ? 'active' : ''}`}
              onClick={() => setPaymentMode('upi')}
            >
              📱 UPI
            </button>
          </div>

          {paymentMode === 'card' && (
            <div className="card-form">
              <div className="card-preview">
                <div className="card-preview-number">
                  {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="card-preview-bottom">
                  <span>{cardName || 'CARD HOLDER'}</span>
                  <span>{expiry || 'MM/YY'}</span>
                </div>
              </div>

              <div className="form-field">
                <label>Card Number</label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                  className="payment-input"
                  maxLength={19}
                />
              </div>
              <div className="form-field">
                <label>Cardholder Name</label>
                <input
                  type="text"
                  placeholder="Name as on card"
                  value={cardName}
                  onChange={e => setCardName(e.target.value.toUpperCase())}
                  className="payment-input"
                />
              </div>
              <div className="payment-row">
                <div className="form-field">
                  <label>Expiry</label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={expiry}
                    onChange={e => setExpiry(formatExpiry(e.target.value))}
                    className="payment-input"
                    maxLength={5}
                  />
                </div>
                <div className="form-field">
                  <label>CVV</label>
                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    className="payment-input"
                    maxLength={3}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMode === 'upi' && (
            <div className="upi-form">
              <div className="upi-logos">
                <span>GPay</span>
                <span>PhonePe</span>
                <span>Paytm</span>
                <span>BHIM</span>
              </div>
              <div className="form-field">
                <label>UPI ID</label>
                <input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  className="payment-input"
                />
              </div>
            </div>
          )}

          {error && <p className="payment-error">{error}</p>}

          <button className="pay-now-btn" onClick={handlePayNow}>
            Pay ₹{total?.toLocaleString('en-IN')} →
          </button>

          <p className="payment-disclaimer">
            🔒 256-bit SSL encrypted. Your payment details are safe.
          </p>
        </div>

        {/* Order Info */}
        <div className="payment-order-info">
          <h3>Order Summary</h3>
          <p className="payment-order-id">Order #{order?._id?.slice(-6).toUpperCase()}</p>
          {order?.items?.map((item, i) => (
            <div key={i} className="payment-item-row">
              <span>{item.productName || item.name} × {item.quantity}</span>
              <span>₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="payment-total-row">
            <strong>Total</strong>
            <strong>₹{total?.toLocaleString('en-IN')}</strong>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimulatedPayment;
