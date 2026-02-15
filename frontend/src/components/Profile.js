import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user && token) {
      fetchOrders();
    }
  }, [user, token, authLoading, navigate]);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders for user:', user.id, 'with token:', token);
      const response = await axios.get('http://localhost:5000/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Orders fetched:', response.data);
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="loading">Loading your orders...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="user-info">
          <h2>{user?.name}</h2>
          <p>{user?.email}</p>
          {user?.phone && <p>Phone: {user.phone}</p>}
        </div>
      </div>

      <div className="orders-section">
        <h2>My Orders ({orders.length})</h2>
        
        {orders.length === 0 ? (
          <div className="no-orders">
            <p>You haven't placed any orders yet.</p>
            <button onClick={() => navigate('/products')} className="shop-now-btn">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => (
              <div key={order._id} className="order-card">
                <div className="order-header">
                  <div className="order-id">
                    <strong>Order #{order._id.slice(-8)}</strong>
                  </div>
                  <div className="order-status">
                    <span className={`status ${order.orderStatus.toLowerCase()}`}>
                      {order.orderStatus}
                    </span>
                  </div>
                </div>
                
                <div className="order-details">
                  <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                  <p><strong>Total:</strong> ₹{Math.round(order.totalAmount * 83)}</p>
                  <p><strong>Payment:</strong> {order.paymentMethod}</p>
                  <p><strong>Status:</strong> {order.paymentStatus}</p>
                </div>

                <div className="order-items">
                  <h4>Items ({order.items.length}):</h4>
                  {order.items.map((item, index) => (
                    <div key={index} className="order-item">
                      <span className="item-name">{item.name}</span>
                      <span className="item-details">
                        Qty: {item.quantity} × ₹{Math.round(item.price * 83)}
                      </span>
                    </div>
                  ))}
                </div>

                {order.deliveryAddress && (
                  <div className="delivery-address">
                    <h4>Delivery Address:</h4>
                    <p>{order.deliveryAddress}</p>
                  </div>
                )}

                {order.estimatedDelivery && (
                  <div className="estimated-delivery">
                    <p><strong>Estimated Delivery:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;