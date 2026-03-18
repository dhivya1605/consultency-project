import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import './AdminPages.css';


const VALID_NEXT = {
  'Pending':          ['Placed', 'Packed', 'Cancelled'], // Added for compatibility
  'Placed':           ['Packed', 'Cancelled'],
  'Packed':           ['Shipped', 'Cancelled'],
  'Shipped':          ['Out for Delivery'],
  'Out for Delivery': ['Delivered'],
  'Delivered':        [],
  'Cancelled':        []
};

const statusColors = {
  'Pending':          '#95a5a6', // Gray for legacy pending status
  'Placed':           '#3498db',
  'Packed':           '#9b59b6',
  'Shipped':          '#e67e22',
  'Out for Delivery': '#f39c12',
  'Delivered':        '#27ae60',
  'Cancelled':        '#e74c3c'
};

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
    if (!newStatus) {
      alert('Please select a status');
      return;
    }
    try {
      const response = await apiCall.put(
        '/orders/admin/status',
        { orderId, orderStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrder = response.data.order;
      setOrders(prev =>
        prev.map(o => o._id === updatedOrder._id ? { ...o, orderStatus: updatedOrder.orderStatus, paymentStatus: updatedOrder.paymentStatus } : o)
      );
      alert('Order status updated!');
      setEditingId(null);
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to update status';
      alert(msg);
    }
  };

  const handleCapturePayment = async (orderId) => {
    if (!window.confirm('Mark this order as PAYMENT COLLECTED?')) return;
    try {
      const response = await apiCall.put(
        '/orders/admin/capture-payment',
        { orderId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updatedOrder = response.data.order;
      setOrders(prev =>
        prev.map(o => o._id === updatedOrder._id ? { ...o, paymentStatus: updatedOrder.paymentStatus } : o)
      );
      alert('Payment confirmed!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update payment');
    }
  };

  if (user?.role !== 'admin') return null;

  return (
    <div className="admin-container">
      <h1>Orders Management</h1>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <div className="orders-table">
          <table>
            <thead>
              <tr>
                <th>Order No.</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Payment</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order, index) => {
                const nextStatuses = VALID_NEXT[order.orderStatus] || [];
                return (
                  <tr key={order._id}>
                    <td className="order-id">#{orders.length - index}</td>
                    <td>{order.userId?.name || 'Unknown'}<br /><small>{order.userId?.email || ''}</small></td>
                    <td className="amount">₹{order.totalAmount?.toLocaleString('en-IN') || 0}</td>
                    <td>
                      <div>
                        <span style={{ fontSize: '0.8rem' }}>{order.paymentMethod === 'online' ? '💳 Online' : '💵 COD'}</span><br />
                        <span style={{
                          fontSize: '0.75rem',
                          color: order.paymentStatus === 'Paid' || order.paymentStatus === 'Received' ? '#27ae60' : '#e67e22',
                          fontWeight: 600
                        }}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className="order-status-badge" style={{ backgroundColor: statusColors[order.orderStatus] || '#95a5a6' }}>
                        {order.orderStatus || 'Placed'}
                      </span>
                    </td>
                    <td>
                      {order.orderDate
                        ? new Date(order.orderDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                        : 'N/A'}
                    </td>
                    <td>
                      <div className="admin-actions-cell">
                        {editingId === order._id ? (
                          <div className="status-edit">
                            <select value={editStatus} onChange={e => setEditStatus(e.target.value)}>
                              <option value="">Select next status</option>
                              {nextStatuses.map(s => (
                                <option key={s} value={s}>{s}</option>
                              ))}
                              {nextStatuses.length === 0 && (
                                <option disabled>No further updates</option>
                              )}
                            </select>
                            <button
                              className="save-btn"
                              onClick={() => handleStatusUpdate(order._id, editStatus)}
                              disabled={!editStatus}
                            >✓</button>
                            <button className="cancel-btn" onClick={() => setEditingId(null)}>✕</button>
                          </div>
                        ) : (
                          <button
                            className="edit-btn"
                            onClick={() => { setEditingId(order._id); setEditStatus(''); }}
                            disabled={nextStatuses.length === 0}
                            title={nextStatuses.length === 0 ? 'No further status changes' : 'Update status'}
                          >
                            {nextStatuses.length === 0 ? 'Done' : 'Edit'}
                          </button>
                        )}
                        
                        {/* Manual Payment Verification for COD (Strictly manual now) */}
                        {order.paymentMethod === 'cod' && (order.paymentStatus === 'Pending' || order.paymentStatus === 'Processing') && (
                          <button 
                            className="payment-capture-btn"
                            onClick={() => handleCapturePayment(order._id)}
                            title={order.orderStatus === 'Delivered' ? "Confirm cash received after delivery" : "Click if payment collected manually"}
                            style={order.orderStatus === 'Delivered' ? { boxShadow: '0 0 10px rgba(39, 174, 96, 0.3)', border: '2px solid #27ae60', background: 'white', color: '#27ae60' } : {}}
                          >
                            {order.orderStatus === 'Delivered' ? '💰 Confirm Cash' : '💰 Paid'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
