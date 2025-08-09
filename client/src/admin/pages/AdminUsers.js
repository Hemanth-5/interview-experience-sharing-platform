import React, { useState, useEffect } from 'react';
import { createApiUrl } from '../../config/api';
import PSGNotification from '../../components/PSGNotification';
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
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });


  // Always use the latest filters when fetching users
  useEffect(() => {
    fetchUsers(filters);
  }, [filters]);

  // Fetch users with given filters
  const fetchUsers = async (customFilters = filters) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(customFilters).toString();
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

  // Modal state for admin creds
  const [showAdminCredsModal, setShowAdminCredsModal] = useState(false);
  const [adminCredsMode, setAdminCredsMode] = useState('new'); // 'new' or 'existing'
  const [adminCredsUser, setAdminCredsUser] = useState(null); // user object
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [existingCreds, setExistingCreds] = useState([]);
  const [selectedCredId, setSelectedCredId] = useState('');
  const [adminCredsLoading, setAdminCredsLoading] = useState(false);
  const [adminCredsError, setAdminCredsError] = useState('');

  // Intercept role change to Admin for Student
  const handleRoleUpdate = async (userId, newRole, userObj) => {
    if (userObj.role === 'Student' && newRole === 'Admin') {
      // Show modal for admin creds
      setAdminCredsUser(userObj);
      setShowAdminCredsModal(true);
      setAdminCredsMode('new');
      setAdminUsername('');
      setAdminPassword('');
      setAdminCredsError('');
      setSelectedCredId('');
      // Fetch existing creds for dropdown
      try {
        setAdminCredsLoading(true);
        // Fetch all available admin creds (for demo, you may need to adjust endpoint)
        const res = await fetch(createApiUrl('/api/admin/auth/all'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          }
        });
        if (res.ok) {
          const data = await res.json();
          setExistingCreds(data.data || []);
        } else {
          setExistingCreds([]);
        }
      } catch (e) {
        setExistingCreds([]);
      } finally {
        setAdminCredsLoading(false);
      }
      return;
    }
    // Normal role update
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
          setUsers(users.map(user => 
            user._id === userId ? { ...user, role: newRole } : user
          ));
          setNotification({ open: true, message: 'Role updated successfully', type: 'success' });
        }
      } else {
        setNotification({ open: true, message: 'Error updating role', type: 'error' });
      }
    } catch (err) {
      setNotification({ open: true, message: 'Error updating role', type: 'error' });
    }
  };

  // Handle admin creds modal submit
  const handleAdminCredsSubmit = async (e) => {
    e.preventDefault();
    setAdminCredsLoading(true);
    setAdminCredsError('');
    try {
      let result;
      if (adminCredsMode === 'new') {
        // Create new admin creds using /bootstrap
        const res = await fetch(createApiUrl('/api/admin/auth/bootstrap'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: adminCredsUser._id,
            adminUsername,
            adminPassword
          })
        });
        result = await res.json();
        if (!result.success) throw new Error(result.message || 'Failed to create admin credentials');
      } else {
        // Assign existing creds (you may need to implement this endpoint in backend)
        result = await fetch(createApiUrl(`/api/admin/auth/assign`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          },
          body: JSON.stringify({ userId: adminCredsUser._id, adminCredId: selectedCredId })
        });
        result = await result.json();
        if (!result.success) throw new Error(result.message || 'Failed to assign admin creds');
      }
      // Now update user role
      await fetch(createApiUrl(`/api/admin/users/${adminCredsUser._id}/role`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ role: 'Admin' })
      });
      setUsers(users.map(user => 
        user._id === adminCredsUser._id ? { ...user, role: 'Admin' } : user
      ));
      setNotification({ open: true, message: 'Admin credentials assigned and role updated!', type: 'success' });
      setShowAdminCredsModal(false);
    } catch (err) {
      setAdminCredsError(err.message || 'Failed to assign admin credentials');
    } finally {
      setAdminCredsLoading(false);
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
      <PSGNotification
        open={notification.open}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, open: false })}
      />
      <div className="admin-card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 16 }}>
        <h2 className="admin-card-title" style={{ margin: 0 }}>User Management</h2>
        <button
          onClick={() => fetchUsers()}
          className="admin-btn admin-btn-secondary"
          style={{ minWidth: 110 }}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="admin-filters" style={{ marginBottom: 20 }}>
        <div className="admin-filters-row" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div className="admin-filter-group" style={{ minWidth: 220 }}>
            <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Search Users</label>
            <input
              type="text"
              className="form-control"
              placeholder="Search by name or email..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #e5e7eb', fontSize: 15 }}
            />
          </div>
          <div className="admin-filter-group" style={{ minWidth: 180 }}>
            <label style={{ fontWeight: 600, marginBottom: 4, display: 'block' }}>Filter by Role</label>
            <select
              className="form-control"
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1.5px solid #e5e7eb', fontSize: 15 }}
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
      <div className="admin-card" style={{ marginTop: 12 }}>
        <div className="admin-card-content">
          {users.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table" style={{ minWidth: 900, borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '12px 8px', fontWeight: 700, fontSize: 15 }}>User</th>
                    <th style={{ padding: '12px 8px', fontWeight: 700, fontSize: 15 }}>Email</th>
                    <th style={{ padding: '12px 8px', fontWeight: 700, fontSize: 15 }}>Role</th>
                    <th style={{ padding: '12px 8px', fontWeight: 700, fontSize: 15 }}>Joined</th>
                    <th style={{ padding: '12px 8px', fontWeight: 700, fontSize: 15 }}>Experiences</th>
                    <th style={{ padding: '12px 8px', fontWeight: 700, fontSize: 15 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '10px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #e5e7eb' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'var(--primary-color, #6366f1)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '14px',
                                fontWeight: '600',
                                border: '1.5px solid #e5e7eb'
                              }}
                            >
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <strong style={{ fontSize: 15 }}>{user.name}</strong>
                            {user.university && (
                              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                                {user.university}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: 15 }}>{user.email}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <span className={`admin-status-badge ${getRoleBadgeClass(user.role)}`} style={{ fontSize: 14, padding: '4px 12px', borderRadius: 6 }}>
                          {user.role}
                        </span>
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: 15 }}>
                        {new Date(user.joinedAt || user.createdAt).toLocaleDateString()}
                      </td>
                      <td style={{ padding: '10px 8px', fontSize: 15 }}>{user.stats?.experiencesShared || 0}</td>
                      <td style={{ padding: '10px 8px' }}>
                        <div className="admin-actions">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleUpdate(user._id, e.target.value, user)}
                            className="form-control"
                            style={{ minWidth: '120px', padding: '6px 10px', borderRadius: 6, border: '1.5px solid #e5e7eb', fontSize: 15 }}
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
            <div className="empty-state" style={{ padding: '2rem 0', textAlign: 'center', color: '#6b7280' }}>
              <p>No users found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        // <div className="admin-card">
          <div className="admin-card-content">
            <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
              <button
                className="admin-btn admin-btn-secondary"
                disabled={loading || pagination.currentPage <= 1}
                onClick={() => {
                  if (!loading && pagination.currentPage > 1) {
                    setFilters(prev => ({ ...prev, page: pagination.currentPage - 1 }));
                  }
                }}
              >
                Previous
              </button>
              <span style={{ padding: '8px 16px', color: 'var(--text-muted)' }}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                className="admin-btn admin-btn-secondary"
                disabled={loading || pagination.currentPage >= pagination.totalPages}
                onClick={() => {
                  if (!loading && pagination.currentPage < pagination.totalPages) {
                    setFilters(prev => ({ ...prev, page: pagination.currentPage + 1 }));
                  }
                }}
              >
                Next
              </button>
            </div>
          </div>
        // </div>
      )}
      {/* Admin Creds Modal */}
      {showAdminCredsModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="modal-card" style={{
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 10px 32px rgba(0,0,0,0.18)',
            maxWidth: 420,
            width: '95%',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            position: 'relative',
          }}>
            <h3 style={{ color: '#4f46e5', marginBottom: 12 }}>Assign Admin Credentials</h3>
            <p style={{ color: '#374151', marginBottom: 18 }}>
              Assign credentials for <b>{adminCredsUser?.name}</b> to become an Admin.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 18 }}>
              <button
                onClick={() => setAdminCredsMode('new')}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: 6,
                  border: adminCredsMode === 'new' ? '2px solid #4f46e5' : '1px solid #d1d5db',
                  background: adminCredsMode === 'new' ? '#eef2ff' : '#f3f4f6',
                  color: '#374151',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >Create New</button>
              <button
                onClick={() => setAdminCredsMode('existing')}
                style={{
                  padding: '0.5rem 1.2rem',
                  borderRadius: 6,
                  border: adminCredsMode === 'existing' ? '2px solid #4f46e5' : '1px solid #d1d5db',
                  background: adminCredsMode === 'existing' ? '#eef2ff' : '#f3f4f6',
                  color: '#374151',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >Select Existing</button>
            </div>
            <form onSubmit={handleAdminCredsSubmit}>
              {adminCredsMode === 'new' ? (
                <>
                  <input
                    type="text"
                    placeholder="Admin Username"
                    value={adminUsername}
                    onChange={e => setAdminUsername(e.target.value)}
                    required
                    minLength={3}
                    maxLength={50}
                    style={{ width: '100%', marginBottom: 12, padding: '10px', borderRadius: 6, border: '1.5px solid #e5e7eb', fontSize: 15 }}
                  />
                  <input
                    type="password"
                    placeholder="Admin Password"
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    required
                    minLength={8}
                    style={{ width: '100%', marginBottom: 12, padding: '10px', borderRadius: 6, border: '1.5px solid #e5e7eb', fontSize: 15 }}
                  />
                </>
              ) : (
                <>
                  {adminCredsLoading ? (
                    <div style={{ marginBottom: 12 }}>Loading credentials...</div>
                  ) : (
                    <select
                      value={selectedCredId}
                      onChange={e => setSelectedCredId(e.target.value)}
                      required
                      style={{ width: '100%', marginBottom: 12, padding: '10px', borderRadius: 6, border: '1.5px solid #e5e7eb', fontSize: 15 }}
                    >
                      <option value="">Select existing admin credentials</option>
                      {/* {console.log(existingCreds)} */}
                      {existingCreds.map(cred => (
                        <option key={cred._id} value={cred._id}>{cred.adminUsername}</option>
                      ))}
                    </select>
                  )}
                </>
              )}
              {adminCredsError && <div style={{ color: '#dc2626', marginBottom: 10 }}>{adminCredsError}</div>}
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowAdminCredsModal(false)}
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: 6,
                    border: '1px solid #d1d5db',
                    background: '#f3f4f6',
                    color: '#374151',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                  disabled={adminCredsLoading}
                >Cancel</button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.5rem',
                    borderRadius: 6,
                    border: 'none',
                    background: '#4f46e5',
                    color: 'white',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                  disabled={adminCredsLoading || (adminCredsMode === 'existing' && !selectedCredId)}
                >{adminCredsLoading ? 'Assigning...' : 'Assign'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
