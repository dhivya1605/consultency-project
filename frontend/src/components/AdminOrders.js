import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import './AdminPages.css';

const AdminOrders = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editStatus, setEditStatus] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall.get('/orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchOrders();
  }, [user, navigate, fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await apiCall.put(
        `/orders/admin/status`,
        { orderId, status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      setEditingId(null);
      alert('✅ Order status updated!');
    } catch (err) {
      console.error('Error updating order:', err);
      alert('❌ Failed to update order');
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-container">
      <h1>🛒 Orders Management</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
          <div className="orders-table">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td className="order-id">#{ order._id.slice(-6).toUpperCase()}</td>
                    <td>{order.userId?.name || 'Unknown'}</td>
                    <td className="amount">₹{order.totalAmount?.toLocaleString('en-IN') || 0}</td>
                    <td>
                      <span className={`status ${order.status?.toLowerCase()}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      {editingId === order._id ? (
                        <div className="status-edit">
                          <select 
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                          >
                            <option value="">Select Status</option>
                            <option value="Pending">Pending</option>
                            <option value="Shipped">Shipped</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
                          <button 
                            className="save-btn"
                            onClick={() => handleStatusUpdate(order._id, editStatus)}
                          >
                            ✓
                          </button>
                          <button 
                            className="cancel-btn"
                            onClick={() => setEditingId(null)}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="edit-btn"
                          onClick={() => {
                            setEditingId(order._id);
                            setEditStatus(order.status || 'Pending');
                          }}
                        >
                          ✏️ Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  };

export default AdminOrders;
