import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiCall } from '../utils/api';
import './AdminPages.css';

const AdminUsers = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiCall.get('/users/admin/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate, fetchUsers]);

  const handleBlockUser = async (userId, currentStatus) => {
    try {
      const newStatus = !currentStatus;
      await apiCall.put(
        `/users/admin/${userId}/block`,
        { isBlocked: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBlocked: newStatus } : u));
      alert(newStatus ? '🚫 User blocked' : '✅ User unblocked');
    } catch (err) {
      console.error('Error updating user:', err);
      alert('❌ Failed to update user');
    }
  };

  if (user?.role !== 'admin') {
    return null;
  }

  return (
    <div className="admin-container">
      <h1>Users Management</h1>

      {loading ? (
        <p>Loading users...</p>
      ) : users.length === 0 ? (
        <p>No users found</p>
      ) : (
          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td className="user-name">
                      <span className="user-avatar"></span>
                      {u.name}
                    </td>
                    <td className="email">{u.email}</td>
                    <td>
                      <span className={`role ${u.role?.toLowerCase()}`}>
                        {u.role || 'User'}
                      </span>
                    </td>
                    <td>
                      <span className={`status ${u.isBlocked ? 'blocked' : 'active'}`}>
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <button 
                        className={`action-btn ${u.isBlocked ? 'unblock' : 'block'}`}
                        onClick={() => handleBlockUser(u._id, u.isBlocked)}
                      >
                        {u.isBlocked ? 'Unblock' : 'Block'}
                      </button>
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

export default AdminUsers;
