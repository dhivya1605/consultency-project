import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RatingModal from './RatingModal';

const STATUS_STEPS = ['Placed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered'];

const getStatusIndex = (status) => {
  const idx = STATUS_STEPS.indexOf(status);
  return idx === -1 ? 0 : idx;
};

const statusColor = (status) => {
  const map = {
    'Placed':           '#3498db',
    'Packed':           '#9b59b6',
    'Shipped':          '#e67e22',
    'Out for Delivery': '#f39c12',
    'Delivered':        '#27ae60',
    'Cancelled':        '#e74c3c'
  };
  return map[status] || '#95a5a6';
};

const Profile = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState({ show: false });
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user && token) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="tracking-loading"><div className="tracking-spinner"></div><p>Loading your orders...</p></div>;
  }

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Item stock will be restored.')) return;

    try {
      const response = await axios.post('http://localhost:5000/api/orders/cancel', { orderId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(response.data.message);
      // Refresh orders
      const updated = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(updated.data);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const isWithin24Hours = (orderDate) => {
    const placedAt = new Date(orderDate).getTime();
    const now = new Date().getTime();
    const diffHours = (now - placedAt) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  if (!user) return null;

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header-card">
        <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <div className="profile-user-info">
          <h1>{user?.name}</h1>
          <p>{user?.email}</p>
          {user?.phone && <p>📞 {user.phone}</p>}
        </div>
      </div>

      {/* Orders Section */}
      <div className="profile-orders-section">
        <div className="tracking-header">
          <h2>My Orders</h2>
          {orders.length > 0 && (
            <span className="tracking-order-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
          )}
        </div>

        {orders.length === 0 ? (
          <div className="tracking-empty">
            <div className="tracking-empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>You haven't placed any orders. Start shopping!</p>
            <button className="shop-now-btn" onClick={() => navigate('/products')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="tracking-list">
            {orders.map((order, idx) => {
              const orderNum = orders.length - idx;
              const isCancelled = order.orderStatus === 'Cancelled';
              const currentStep = getStatusIndex(order.orderStatus);
              const isExpanded = expanded === order._id;

              return (
                <div key={order._id} className={`tracking-card ${isCancelled ? 'cancelled-card' : ''}`}>
                  {/* Card Header */}
                  <div
                    className="tracking-card-header"
                    onClick={() => setExpanded(isExpanded ? null : order._id)}
                  >
                    <div className="tracking-card-left">
                      <div className="tracking-order-num">Order #{orderNum}</div>
                      <div className="tracking-date">
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                          : 'N/A'}
                      </div>
                      <div className="tracking-item-preview">
                        {order.items?.slice(0, 2).map((item, i) => (
                          <span key={i}>
                            {item.productName || item.name}
                            {order.items.length > 2 && i === 1 ? ` +${order.items.length - 2} more` : ''}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="tracking-card-right">
                      <div className="tracking-total">₹{order.totalAmount?.toLocaleString('en-IN')}</div>
                      <div
                        className="tracking-status-badge"
                        style={{ backgroundColor: statusColor(order.orderStatus) }}
                      >
                        {order.orderStatus || 'Placed'}
                      </div>
                      <div className="tracking-payment-badge" style={{ color: order.paymentStatus === 'Paid' || order.paymentStatus === 'Received' ? '#27ae60' : '#e67e22' }}>
                        {order.paymentMethod === 'online' ? '💳' : '💵'} {order.paymentStatus || 'Pending'}
                      </div>
                      <div className="tracking-expand-icon">{isExpanded ? '▲' : '▼'}</div>
                    </div>
                  </div>

                  {/* Rate Banner - visible without expanding, for delivered orders only */}
                  {order.orderStatus === 'Delivered' && (
                    <div className="rate-order-banner" onClick={e => e.stopPropagation()}>
                      <div className="rate-banner-left">
                        <span className="rate-stars-preview">⭐⭐⭐⭐⭐</span>
                        <span className="rate-banner-text">How was your order? Share your experience!</span>
                      </div>
                      <button
                        className="rate-banner-btn"
                        onClick={() => setShowRatingModal({
                          show: true,
                          productId: order.items?.[0]?.productId,
                          orderId: order._id
                        })}
                      >
                        ✍️ Rate Order
                      </button>
                    </div>
                  )}

                  {/* Expanded Detail */}
                  {isExpanded && (
                    <div className="tracking-card-body">
                      {isCancelled ? (
                        <div className="cancelled-message-box">
                          <span className="cancelled-icon">🚫</span>
                          <div className="cancelled-text">
                            <h4>Order Cancelled</h4>
                            <p>This order was successfully cancelled.</p>
                          </div>
                        </div>
                      ) : (
                        <div className="order-stepper">
                          {STATUS_STEPS.map((step, i) => (
                            <div key={step} className="stepper-item">
                              <div className={`stepper-circle ${i <= currentStep ? 'stepper-done' : ''} ${i === currentStep && order.orderStatus !== 'Delivered' ? 'stepper-current' : ''}`}>
                                {i < currentStep || order.orderStatus === 'Delivered' ? '✓' : i + 1}
                              </div>
                              <div className={`stepper-label ${i === currentStep ? 'stepper-label-active' : ''}`}>
                                {step}
                              </div>
                              {i < STATUS_STEPS.length - 1 && (
                                <div className={`stepper-line ${i < currentStep ? 'stepper-line-done' : ''}`} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Items */}
                      <div className="tracking-items-section">
                        <h4>Items Ordered</h4>
                        {order.items?.map((item, i) => (
                          <div key={i} className="tracking-item-row">
                            <div className="tracking-item-info">
                              <span className="tracking-item-name">{item.productName || item.name}</span>
                              {item.brand && <span className="tracking-item-brand">{item.brand}</span>}
                            </div>
                            <div className="tracking-item-meta">
                              <span>× {item.quantity}</span>
                              <span className="tracking-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        ))}
                        <div className="tracking-total-row">
                          <strong>Total</strong>
                          <strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                        </div>
                      </div>

                      {order.deliveryAddress && (
                        <div className="tracking-detail-grid" style={{ marginTop: '1rem' }}>
                          <div className="tracking-detail-block">
                            <h4>Delivery Address</h4>
                            <p>{order.deliveryAddress}</p>
                            {order.phoneNumber && <p>📞 {order.phoneNumber}</p>}
                          </div>
                          <div className="tracking-detail-block">
                            <h4>Payment</h4>
                            <p>{order.paymentMethod === 'online' ? '💳 Online Payment' : '💵 Cash on Delivery'}</p>
                            <p style={{ fontWeight: 600, color: order.paymentStatus === 'Paid' || order.paymentStatus === 'Received' ? '#27ae60' : '#e67e22' }}>
                              {order.paymentStatus}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Cancel Order Action - strictly 24h + Placed status */}
                      {!isCancelled && order.orderStatus === 'Placed' && isWithin24Hours(order.orderDate) && (
                        <div className="order-actions-footer">
                          <button 
                            className="cancel-order-btn"
                            onClick={() => handleCancelOrder(order._id)}
                          >
                            ❌ Cancel Order
                          </button>
                          <p className="cancel-note">Order can only be cancelled within 24 hours of placement.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {showRatingModal.show && (
              <RatingModal
                orderId={showRatingModal.orderId}
                productId={showRatingModal.productId}
                onClose={() => setShowRatingModal({ show: false })}
                onSubmit={() => {
                  setShowRatingModal({ show: false });
                  fetchOrders();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;