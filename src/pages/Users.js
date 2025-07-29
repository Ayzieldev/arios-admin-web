import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { FiUser, FiMail, FiPhone, FiCalendar, FiEye } from 'react-icons/fi';
import '../style/Users.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('🔍 Fetching users with token:', token ? 'Present' : 'Missing');
      
      const response = await api.get('/users/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ Users fetched successfully:', response.data.length, 'users');
      console.log('📊 First user data:', response.data[0]);
      setUsers(response.data);
    } catch (error) {
      console.error('❌ Error fetching users:', error.response?.status, error.response?.data);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const updateUserRole = async (userId, newRole) => {
    const user = users.find(u => u._id === userId);
    const currentRole = user?.role;
    
    console.log('🔄 Role change request:', { userId, userName: user?.name, currentRole, newRole });
    
    if (currentRole === newRole) {
      console.log('⏭️ Same role, skipping update');
      return;
    }
    
    const confirmMessage = `Are you sure you want to change ${user?.name || 'this user'}'s role from ${currentRole.toUpperCase()} to ${newRole.toUpperCase()}?`;
    
    if (!window.confirm(confirmMessage)) {
      console.log('❌ User cancelled role change');
      // Reset the select to the original value
      const selectElement = document.querySelector(`select[data-user-id="${userId}"]`);
      if (selectElement) {
        selectElement.value = currentRole;
      }
      return;
    }
    
    try {
      setUpdatingRole(userId);
      const token = localStorage.getItem('token');
      
      console.log('📡 Sending role update request...');
      const response = await api.put(`/users/${userId}/role`, 
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      console.log('✅ Server response:', response.data);
      
      // Update the user in the local state
      setUsers(users.map(user => 
        user._id === userId ? response.data : user
      ));
      
      console.log('✅ User role updated successfully in UI');
    } catch (error) {
      console.error('❌ Error updating user role:', error.response?.status, error.response?.data);
      alert(error.response?.data?.message || 'Failed to update user role');
      
      // Reset the select to the original value on error
      const selectElement = document.querySelector(`select[data-user-id="${userId}"]`);
      if (selectElement) {
        selectElement.value = currentRole;
      }
    } finally {
      setUpdatingRole(null);
    }
  };

  const getRoleBadge = (role) => {
    const roleColors = {
      admin: '#ef4444',
      customer: '#3b82f6',
      delivery: '#10b981'
    };
    
    return (
      <span 
        className="role-badge" 
        style={{ backgroundColor: roleColors[role] || '#6b7280' }}
      >
        {role.toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="users">
        <div className="users-header">
          <h1>Users</h1>
          <p>Manage customer accounts</p>
        </div>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="users">
        <div className="users-header">
          <h1>Users</h1>
          <p>Manage customer accounts</p>
        </div>
        <div className="error">
          <p>{error}</p>
          <button onClick={fetchUsers} className="btn btn-primary">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="users">
      <div className="users-header">
        <h1>Users</h1>
        <p>Manage customer accounts ({users.length} total)</p>
      </div>

      <div className="users-content">
        {users.length === 0 ? (
          <div className="no-users">
            <FiUser className="no-users-icon" />
            <h3>No Users Found</h3>
            <p>There are no users to display at the moment.</p>
          </div>
        ) : (
          <div className="users-table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td className="user-id">#{user._id.slice(-6)}</td>
                    <td className="user-name">
                      <div className="user-info">
                        <FiUser className="user-icon" />
                        <span>{user.name || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="user-email">
                      <div className="email-info">
                        <FiMail className="email-icon" />
                        <span>{user.email}</span>
                      </div>
                    </td>
                    <td className="user-phone">
                      <div className="phone-info">
                        <FiPhone className="phone-icon" />
                        <span>{user.phone || 'N/A'}</span>
                      </div>
                    </td>
                    <td className="user-role">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="user-joined">
                      <div className="date-info">
                        <FiCalendar className="date-icon" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </td>
                    <td className="user-actions">
                      <div className="action-buttons">
                        <button
                          onClick={() => viewUserDetails(user)}
                          className="btn btn-sm btn-outline"
                          title="View Details"
                        >
                          <FiEye />
                        </button>
                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user._id, e.target.value)}
                          className="role-select"
                          disabled={updatingRole === user._id}
                          title="Change Role"
                          data-user-id={user._id}
                        >
                          <option value="customer">Customer</option>
                          <option value="delivery">Delivery</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>User Details</h2>
              <button onClick={() => setShowModal(false)} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              <div className="user-details">
                <div className="detail-section">
                  <h3>Basic Information</h3>
                  <p><strong>User ID:</strong> #{selectedUser._id.slice(-6)}</p>
                  <p><strong>Name:</strong> {selectedUser.name || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedUser.email}</p>
                  <p><strong>Phone:</strong> {selectedUser.phone || 'N/A'}</p>
                  <p><strong>Role:</strong> {getRoleBadge(selectedUser.role)}</p>
                  <p><strong>Joined:</strong> {formatDate(selectedUser.createdAt)}</p>
                </div>

                <div className="detail-section">
                  <h3>Addresses</h3>
                  {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                    <div className="addresses-list">
                      {selectedUser.addresses.map((address, index) => (
                        <div key={index} className="address-item">
                          <strong>Address {index + 1}:</strong>
                          <p>{address}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No addresses on file</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users; 