import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

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

const paymentStatusLabel = (ps) => {
  const map = {
    'Pending':  { label: 'Pending',  color: '#e67e22' },
    'Paid':     { label: 'Paid',     color: '#27ae60' },
    'Received': { label: 'Received', color: '#27ae60' },
    'Failed':   { label: 'Failed',   color: '#e74c3c' }
  };
  return map[ps] || { label: ps, color: '#95a5a6' };
};

const OrderTracking = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    const fetchOrders = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/orders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user, token, navigate]);

  if (loading) {
    return (
      <div className="tracking-loading">
        <div className="tracking-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="tracking-empty">
        <div className="tracking-empty-icon">📦</div>
        <h2>No orders yet</h2>
        <p>You haven't placed any orders. Start shopping!</p>
        <button className="shop-now-btn" onClick={() => navigate('/')}>
          Shop Now
        </button>
      </div>
    );
  }

  return (
    <div className="tracking-page">
      <div className="tracking-header">
        <h1>My Orders</h1>
        <span className="tracking-order-count">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="tracking-list">
        {orders.map((order, idx) => {
          const orderNum = orders.length - idx;
          const currentStep = getStatusIndex(order.orderStatus);
          const isCancelled = order.orderStatus === 'Cancelled';
          const isExpanded = expanded === order._id;
          const ps = paymentStatusLabel(order.paymentStatus);

          return (
            <div key={order._id} className={`tracking-card ${isCancelled ? 'cancelled-card' : ''}`}>
              {/* Card Header */}
              <div className="tracking-card-header" onClick={() => setExpanded(isExpanded ? null : order._id)}>
                <div className="tracking-card-left">
                  <div className="tracking-order-num">Order #{orderNum}</div>
                  <div className="tracking-date">
                    {order.orderDate
                      ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                      : 'N/A'}
                  </div>
                  <div className="tracking-item-preview">
                    {order.items?.slice(0, 2).map((item, i) => (
                      <span key={i}>{item.productName || item.name}{order.items.length > 2 && i === 1 ? ` +${order.items.length - 2} more` : ''}</span>
                    ))}
                  </div>
                </div>
                <div className="tracking-card-right">
                  <div className="tracking-total">₹{order.totalAmount?.toLocaleString('en-IN')}</div>
                  <div
                    className="tracking-status-badge"
                    style={{ backgroundColor: statusColor(order.orderStatus) }}
                  >
                    {order.orderStatus}
                  </div>
                  <div className="tracking-payment-badge" style={{ color: ps.color }}>
                    {order.paymentMethod === 'online' ? '💳' : '💵'} {ps.label}
                  </div>
                  <div className="tracking-expand-icon">{isExpanded ? '▲' : '▼'}</div>
                </div>
              </div>

              {/* Expanded Detail */}
              {isExpanded && (
                <div className="tracking-card-body">

                  {/* Status Stepper */}
                  {!isCancelled ? (
                    <div className="order-stepper">
                      {STATUS_STEPS.map((step, i) => (
                        <div key={step} className="stepper-item">
                          <div className={`stepper-circle ${i <= currentStep ? 'stepper-done' : ''} ${i === currentStep ? 'stepper-current' : ''}`}>
                            {i < currentStep ? '✓' : i + 1}
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
                  ) : (
                    <div className="cancelled-banner">
                      Order Cancelled
                    </div>
                  )}

                  {/* Delivery & Payment Info */}
                  <div className="tracking-detail-grid">
                    <div className="tracking-detail-block">
                      <h4>Delivery Address</h4>
                      <p>{order.deliveryAddress}</p>
                      {order.phoneNumber && <p>📞 {order.phoneNumber}</p>}
                    </div>
                    <div className="tracking-detail-block">
                      <h4>Payment</h4>
                      <p>{order.paymentMethod === 'online' ? '💳 Online Payment' : '💵 Cash on Delivery'}</p>
                      <p style={{ color: ps.color, fontWeight: 600 }}>{order.paymentStatus}</p>
                      {order.transactionId && (
                        <p className="txn-id">Txn: {order.transactionId}</p>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="tracking-items-section">
                    <h4>Items Ordered</h4>
                    {order.items?.map((item, i) => {
                      const image = item.image || item.productId?.image || '';
                      
                      const getImageUrl = (img) => {
                        if (!img) return null;
                        if (img.startsWith('http')) return img;
                        return `http://localhost:5000${img}`;
                      };

                      return (
                        <div key={i} className="tracking-item-row-premium">
                          <div className="tracking-item-main">
                            <div className="tracking-item-img">
                              {image ? <img src={getImageUrl(image)} alt={item.productName || item.name} /> : <div className="placeholder">📦</div>}
                            </div>
                            <div className="tracking-item-details">
                              <span className="tracking-item-name">{item.productName || item.name}</span>
                              {item.brand && <span className="tracking-item-brand">{item.brand}</span>}
                              <span className="tracking-item-qty">Qty: {item.quantity}</span>
                            </div>
                          </div>
                          <span className="tracking-item-price">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                        </div>
                      );
                    })}
                    <div className="tracking-total-row">
                      <strong>Total</strong>
                      <strong>₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTracking;
