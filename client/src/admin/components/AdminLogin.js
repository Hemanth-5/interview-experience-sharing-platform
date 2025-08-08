import React, { useState } from 'react';
import { createApiUrl } from '../../config/api';
import '../styles/admin.css';
import '../styles/AdminLogin.css';
import '../styles/AdminLogin.css';

const AdminLogin = ({ onAuthenticated }) => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // console.log('Attempting admin login with credentials:', credentials);

    try {
      const response = await fetch(createApiUrl('/api/admin/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        onAuthenticated();
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (error) {
      setError('Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        {/* <div className="admin-login-stats">
          <div className="admin-stat">
            <h4>🛡️</h4>
            <p>Secure Admin Access</p>
          </div>
          <div className="admin-stat">
            <h4>📊</h4>
            <p>Dashboard Analytics</p>
          </div>
          <div className="admin-stat">
            <h4>⚙️</h4>
            <p>System Management</p>
          </div>
        </div> */}
        
        <div className="admin-login-card">
          <div className="admin-login-header">
            <div className="admin-login-logo">
              <i className="fas fa-shield-alt"></i>
            </div>
            <h1>Admin Panel Access</h1>
            <p>Please enter your admin credentials to continue</p>
          </div>

          <form className="admin-login-form" onSubmit={handleSubmit}>
            {error && (
              <div className="admin-error-message">
                <i className="fas fa-exclamation-triangle"></i>
                {error}
              </div>
            )}

            <div className="admin-form-group">
              <label htmlFor="username">Admin Username</label>
              <div className="admin-input-group">
                <i className="fas fa-user admin-input-icon"></i>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={credentials.username}
                  onChange={handleChange}
                  required
                  placeholder="Enter admin username"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="password">Admin Password</label>
              <div className="admin-input-group">
                <i className="fas fa-lock admin-input-icon"></i>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter admin password"
                  disabled={loading}
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="admin-login-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Authenticating...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i>
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="admin-login-footer">
            <p>
              <i className="fas fa-info-circle"></i>
              Contact system administrator for access credentials
            </p>
            <button 
              onClick={() => window.location.href = '/'} 
              className="admin-back-btn"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Main Site
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;