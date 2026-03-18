import React, { useEffect, useState } from 'react';
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
    return <div className="page-loading">Loading...</div>;
  }

  const estimatedDelivery = new Date();
  estimatedDelivery.setDate(estimatedDelivery.getDate() + 5);

  const formatDate = (d) => {
    return new Date(d).toLocaleDateString('en-IN', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  const isOnline = orderData.paymentMethod === 'online';

  return (
    <div className="confirmation-page">
      <div className="confirmation-card">

        {/* Header */}
        <div className="confirmation-header">
          <div className={`confirmation-checkmark ${isOnline ? 'paid' : 'cod'}`}>✓</div>
          <h1>Order Placed Successfully!</h1>
          <p className="conf-subtext">
            {isOnline ? 'Payment confirmed. Your order is being processed.' : 'Your COD order has been placed successfully.'}
          </p>

          <div className="conf-order-meta">
            <div className="conf-meta-chip">
              Order #{orderData._id?.slice(-6).toUpperCase()}
            </div>
            <div className={`conf-payment-chip ${isOnline ? 'chip-paid' : 'chip-cod'}`}>
              {isOnline ? '💳 Paid Online' : '💵 Cash on Delivery'}
            </div>
          </div>
        </div>

        {/* Status Tracker */}
        <div className="conf-status-banner">
          <div className="conf-status-step active">
            <div className="conf-status-dot">✓</div>
            <span>Placed</span>
          </div>
          <div className="conf-status-line" />
          <div className="conf-status-step">
            <div className="conf-status-dot">2</div>
            <span>Packed</span>
          </div>
          <div className="conf-status-line" />
          <div className="conf-status-step">
            <div className="conf-status-dot">3</div>
            <span>Shipped</span>
          </div>
          <div className="conf-status-line" />
          <div className="conf-status-step">
            <div className="conf-status-dot">4</div>
            <span>Out for Delivery</span>
          </div>
          <div className="conf-status-line" />
          <div className="conf-status-step">
            <div className="conf-status-dot">5</div>
            <span>Delivered</span>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="conf-info-grid">
          <div className="conf-info-block">
            <h4>Delivery Address</h4>
            <p>{orderData.deliveryAddress}</p>
            {orderData.phoneNumber && <p>📞 {orderData.phoneNumber}</p>}
          </div>
          <div className="conf-info-block">
            <h4>Estimated Delivery</h4>
            <p className="conf-delivery-date">{formatDate(estimatedDelivery)}</p>
            <p className="conf-delivery-note">Standard delivery (3-5 business days)</p>
          </div>
        </div>

        {/* Items */}
        <div className="conf-items-section">
          <h3>Items Ordered</h3>
          {orderData.items?.map((item, i) => {
            const image = item.image || item.productId?.image || '';
            
            const getImageUrl = (img) => {
              if (!img) return null;
              if (img.startsWith('http')) return img;
              return `http://localhost:5000${img}`;
            };

            return (
              <div key={i} className="conf-item-row-premium">
                <div className="conf-item-main">
                  {image ? (
                    <div className="conf-item-img">
                      <img src={getImageUrl(image)} alt={item.productName || item.name} />
                    </div>
                  ) : null}
                  <div className="conf-item-details">
                    <span className="conf-item-name">{item.productName || item.name}</span>
                    <div className="conf-item-meta">
                      {item.brand && <span className="conf-item-brand">{item.brand}</span>}
                      <span className="conf-item-qty">Qty: {item.quantity}</span>
                      <span className="conf-item-price">₹{(item.price).toLocaleString('en-IN')} each</span>
                    </div>
                  </div>
                </div>
                <div className="conf-item-pricing">
                  <span className="conf-item-total">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                </div>
              </div>
            );
          })}
          <div className="conf-amount-row">
            <strong>Total Amount</strong>
            <strong className="conf-grand-total">₹{orderData.totalAmount?.toLocaleString('en-IN')}</strong>
          </div>
        </div>

        {/* COD Notice */}
        {!isOnline && (
          <div className="conf-cod-notice">
            <h4>Cash on Delivery</h4>
            <p>Please keep ₹{orderData.totalAmount?.toLocaleString('en-IN')} ready at the time of delivery. Our delivery partner will collect the payment.</p>
          </div>
        )}

        {/* Footer */}
        <div className="conf-footer">
          <p>A confirmation has been sent to <strong>{user?.email}</strong></p>
        </div>

        {/* Actions */}
        <div className="conf-actions">
          <button className="conf-track-btn" onClick={() => navigate('/profile')}>
            Track Order
          </button>
          <button className="conf-shop-btn" onClick={() => navigate('/')}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;
