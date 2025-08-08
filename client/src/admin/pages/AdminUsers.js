import React, { useState, useEffect } from 'react';
import { createApiUrl } from '../../config/api';
import '../styles/admin.css';
import '../styles/AdminUsers.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    role: '',
    search: '',
    page: 1,
    limit: 20
  });
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const response = await fetch(createApiUrl(`/api/admin/users?${params}`), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.data.users || []);
          setPagination(data.data.pagination || {});
        }
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const response = await fetch(createApiUrl(`/api/admin/users/${userId}/role`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: newRole })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update user in local state
          setUsers(users.map(user => 
            user._id === userId ? { ...user, role: newRole } : user
          ));
          alert('Role updated successfully');
        }
      } else {
        alert('Error updating role');
      }
    } catch (err) {
      alert('Error updating role');
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset to first page on filter change
    }));
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'admin-status-flagged';
      case 'Moderator': return 'admin-status-pending';
      default: return 'admin-status-active';
    }
  };

  if (loading && users.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="admin-users">
      <div className="admin-card-header">
        <h2 className="admin-card-title">User Management</h2>
        <button onClick={fetchUsers} className="admin-btn admin-btn-secondary">
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-filters-row">
          <div className="admin-filter-group">
            <label>Search Users</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
          <div className="admin-filter-group">
            <label>Filter by Role</label>
            <select
              className="form-control"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="Student">Student</option>
              <option value="Moderator">Moderator</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
        </div>
      )}

      {/* Users Table */}
      <div className="admin-card">
        <div className="admin-card-content">
          {users.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Experiences</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary-color)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: '600'
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <strong>{user.name}</strong>
                            {user.university && (
                              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                {user.university}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`admin-status-badge ${getRoleBadgeClass(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td>
                        {new Date(user.joinedAt || user.createdAt).toLocaleDateString()}
                      </td>
                      <td>{user.stats?.experiencesShared || 0}</td>
                      <td>
                        <div className="admin-actions">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                            className="form-control"
                            style={{ minWidth: '120px' }}
                          >
                            <option value="Student">Student</option>
                            <option value="Moderator">Moderator</option>
                            <option value="Admin">Admin</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No users found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="admin-card">
          <div className="admin-card-content">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                className="admin-btn admin-btn-secondary"
                disabled={pagination.currentPage <= 1}
                onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
              >
                Previous
              </button>
              <span style={{ padding: '8px 16px', color: 'var(--text-muted)' }}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                className="admin-btn admin-btn-secondary"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
