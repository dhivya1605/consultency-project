import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const OrderConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (location.state?.orderData) {
      setOrderData(location.state.orderData);
    } else {
      navigate('/');
    }
  }, [location, navigate]);

  if (!orderData) {
    return <div>Loading...</div>;
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(
    estimatedDelivery.getDate() + (orderData.deliveryType === 'express' ? 2 : 5)
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  };

  return (
    <div className="confirmation-container">
      <div className="confirmation-card">
        <div className="confirmation-header">
          <div className="checkmark">✓</div>
          <h1>Order Placed Successfully!</h1>
          <p className="order-id">Order ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
        </div>

        <div className="confirmation-section">
          <h2>Order Summary</h2>
          <div className="order-details">
            <div className="detail-row">
              <span>Delivery Address:</span>
              <span className="detail-value">{orderData.deliveryAddress}</span>
            </div>
            <div className="detail-row">
              <span>Phone Number:</span>
              <span className="detail-value">{orderData.phoneNumber}</span>
            </div>
            <div className="detail-row">
              <span>Delivery Type:</span>
              <span className="detail-value">
                {orderData.deliveryType === 'express' ? '⚡ Express (1-2 days)' : '📦 Standard (3-5 days)'}
              </span>
            </div>
            <div className="detail-row">
              <span>Payment Method:</span>
              <span className="detail-value">
                {orderData.paymentMethod === 'cod' 
                  ? '💵 Cash on Delivery' 
                  : '📅 Scheduled Payment'}
              </span>
            </div>
            <div className="detail-row">
              <span>Estimated Delivery:</span>
              <span className="detail-value">{formatDate(estimatedDelivery)}</span>
            </div>
          </div>
        </div>

        <div className="confirmation-section">
          <h2>Items Ordered</h2>
          <div className="items-list">
            {orderData.items && orderData.items.map((item, index) => (
              <div key={index} className="confirmation-item">
                <span>{item.name || item.title}</span>
                <span className="item-amount">₹{item.price}</span>
              </div>
            ))}
          </div>
          <div className="total-amount">
            <span>Total Amount:</span>
            <span>₹{orderData.totalAmount}</span>
          </div>
        </div>

        {orderData.paymentMethod === 'scheduled' && (
          <div className="payment-notice">
            <h3>📧 Payment Instructions</h3>
            <p>You will receive a payment link via email/SMS before delivery.</p>
            <p>Payment must be made within 48 hours of delivery.</p>
          </div>
        )}

        {orderData.paymentMethod === 'cod' && (
          <div className="cod-notice">
            <h3>💰 Cash on Delivery</h3>
            <p>Please have the exact amount ready at the time of delivery.</p>
            <p>Our delivery partner will collect the payment.</p>
          </div>
        )}

        <div className="confirmation-actions">
          <button onClick={() => navigate('/')} className="continue-btn">
            Continue Shopping
          </button>
          <button onClick={() => navigate('/my-orders')} className="track-btn">
            Track Order
          </button>
        </div>

        <div className="confirmation-footer">
          <p>✓ A confirmation email has been sent to {user?.email}</p>
          <p>Need help? Contact us at support@sunelectronics.com or call 1-800-SUN-ELECTRONICS</p>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
