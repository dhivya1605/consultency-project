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
      console.log('Fetching orders...');
      const res = await apiCall.get('/orders/admin/all', {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log('Orders fetched successfully:', res.data.orders);
      setOrders(res.data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
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
      const response = await apiCall.put(
        '/orders/admin/status',
        { orderId, orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedOrder = response.data.order;

      setOrders(prevOrders =>
        prevOrders.map(order =>
          order._id === updatedOrder._id ? { ...order, orderStatus: updatedOrder.orderStatus } : order
        )
      );

      alert('✅ Order status updated!');
      setEditingId(null);
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('❌ Failed to update order status.');
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
                      <span className={`status ${order.orderStatus?.toLowerCase()}`}>
                        {order.orderStatus || 'Pending'}
                      </span>
                    </td>
                    <td>{order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-IN') : 'Date not available'}</td>
                    <td>
                      {editingId === order._id ? (
                        <div className="status-edit">
                          <select
                            value={editStatus}
                            onChange={(e) => setEditStatus(e.target.value)}
                          >
                            <option value="">Select Status</option>
                            <option value="Pending" disabled={order.orderStatus !== 'Pending'}>Pending</option>
                            <option value="Shipped" disabled={order.orderStatus !== 'Pending'}>Shipped</option>
                            <option value="Delivered" disabled={order.orderStatus !== 'Shipped'}>Delivered</option>
                            <option value="Cancelled" disabled={order.orderStatus === 'Shipped' || order.orderStatus === 'Delivered'}>Cancelled</option>
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
                            setEditStatus(order.orderStatus || 'Pending');
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
