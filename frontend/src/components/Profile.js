import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import RatingModal from './RatingModal';

const Profile = () => {
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRatingModal, setShowRatingModal] = useState({ show: false });

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
                  <h3>Order #{order._id}</h3>
                  <p>Date: {new Date(order.createdAt).toLocaleDateString()}</p>
                  <p>Total: ₹{order.total}</p>
                  <p>Payment: {order.paymentMethod}</p>
                  <p>Status: {order.status}</p>
                </div>
                <div className="order-items">
                  <h4>Items:</h4>
                  {order.items.map(item => (
                    <div key={item.productId} className="order-item">
                      <p>Product: {item.productName}</p>
                      <p>Qty: {item.quantity} × ₹{item.price}</p>
                      <button
                        className="rate-btn"
                        onClick={() => setShowRatingModal({ show: true, productId: item.productId, orderId: order._id })}
                      >
                        Rate Product
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {showRatingModal.show && (
              <RatingModal
                orderId={showRatingModal.orderId}
                productId={showRatingModal.productId}
                onClose={() => setShowRatingModal({ show: false })}
                onSubmit={() => {
                  setShowRatingModal({ show: false });
                  fetchOrders(); // Refresh orders after rating
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