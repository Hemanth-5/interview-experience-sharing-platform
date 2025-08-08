import React, { useState, useEffect } from 'react';
import { createApiUrl } from '../../config/api';
import { fetchWithAdminAuth } from '../utils/adminAuth';
import '../styles/admin.css';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch admin dashboard stats
      const response = await fetchWithAdminAuth('/api/admin/dashboard');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
          // console.log('Dashboard stats:', data.data);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load dashboard data');
        return;
      }

      // Fetch recent experiences
      const expResponse = await fetchWithAdminAuth('/api/admin/experiences?limit=5&sortBy=createdAt&sortOrder=desc');
      
      if (expResponse.ok) {
        const expData = await expResponse.json();
        if (expData.success) {
          setRecentActivity(expData.data.experiences || []);
        }
      }

    } catch (err) {
      if (err.message !== 'Admin authentication required') {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3 className="error-title">Error Loading Dashboard</h3>
        <p className="error-message">{error}</p>
        <button onClick={fetchDashboardData} className="admin-btn admin-btn-primary">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-card-header">
        <h2 className="admin-card-title">Dashboard Overview</h2>
        <button onClick={fetchDashboardData} className="admin-btn admin-btn-secondary">
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          {/* <div className="admin-stat-icon">👥</div> */}
          <div className="admin-stat-value">{stats.totalUsers || 0}</div>
          <div className="admin-stat-label">Total Users</div>
        </div>

        <div className="admin-stat-card">
          {/* <div className="admin-stat-icon">📝</div> */}
          <div className="admin-stat-value">{stats.totalExperiences || 0}</div>
          <div className="admin-stat-label">Total Experiences</div>
        </div>

        <div className="admin-stat-card">
          {/* <div className="admin-stat-icon">🏢</div> */}
          <div className="admin-stat-value">{stats.totalCompanies || 0}</div>
          <div className="admin-stat-label">Companies</div>
        </div>

        {/* <div className="admin-stat-card">
          <div className="admin-stat-icon">👁️</div>
          <div className="admin-stat-value">{stats.totalViews || 0}</div>
          <div className="admin-stat-label">Total Views</div>
        </div> */}

        <div className="admin-stat-card">
          {/* <div className="admin-stat-icon">📊</div> */}
          <div className="admin-stat-value">{stats.todayExperiences || 0}</div>
          <div className="admin-stat-label">Today's Experiences</div>
        </div>

        {/* <div className="admin-stat-card">
          <div className="admin-stat-icon">📈</div>
          <div className="admin-stat-value">{stats.weeklyGrowth || '0%'}</div>
          <div className="admin-stat-label">Weekly Growth</div>
        </div> */}
      </div>

      {/* Recent Activity */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Recent Experiences</h3>
        </div>
        <div className="admin-card-content">
          {recentActivity.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    {/* <th>Title</th> */}
                    <th>Company</th>
                    <th>Author</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((experience) => (
                    <tr key={experience._id}>
                      <td>
                        {experience.companyInfo?.companyLogo && (
                          <img
                            src={experience.companyInfo.companyLogo}
                            alt={experience.companyInfo.companyName || 'Company Logo'}
                            className="admin-company-logo"
                            style={{ width: 32, height: 32, objectFit: 'contain', marginRight: 8, verticalAlign: 'middle' }}
                          />
                        )}
                        {experience.companyInfo?.companyName}
                      </td>
                      <td>{experience.userId?.name || 'Unknown'}</td>
                      <td>
                        {new Date(experience.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <span className={`admin-status-badge ${
                          experience.isPublished ? 'admin-status-active' : 'admin-status-pending'
                        }`}>
                          {experience.isPublished ? 'Published' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <p>No recent activity found.</p>
            </div>
          )}
        </div>
        {/* <div className="admin-card-content">
          <div className="admin-actions">
            <a href="/admin/experiences" className="admin-btn admin-btn-primary">
              📝 Review Experiences ({stats.pendingExperiences || 0} pending)
            </a>
            <a href="/admin/users" className="admin-btn admin-btn-secondary">
              👥 Manage Users ({stats.totalUsers || 0} total)
            </a>
            {stats.flaggedExperiences > 0 && (
              <a href="/admin/experiences?status=flagged" className="admin-btn admin-btn-warning">
                ⚠️ Handle Reports ({stats.flaggedExperiences} flagged)
              </a>
            )}
            <a href="/admin/analytics" className="admin-btn admin-btn-success">
              📈 View Analytics
            </a>
          </div>
        </div> */}
      </div> 

      {/* Platform Health */}
      <div className="admin-card">
        <div className="admin-card-header">
          <h3 className="admin-card-title">Platform Health</h3>
        </div>
        <div className="admin-card-content">
          <div className="admin-stats-grid">
            <div className="admin-stat-card">
              {/* <div className="admin-stat-icon">✅</div> */}
              <div className="admin-stat-value">{stats.publishedExperiences || 0}</div>
              <div className="admin-stat-label">Published Experiences</div>
            </div>
            <div className="admin-stat-card">
              {/* <div className="admin-stat-icon">⏳</div> */}
              <div className="admin-stat-value">{stats.pendingExperiences || 0}</div>
              <div className="admin-stat-label">Pending Review</div>
            </div>
            <div className="admin-stat-card">
              {/* <div className="admin-stat-icon">🚩</div> */}
              <div className="admin-stat-value">{stats.flaggedExperiences || 0}</div>
              <div className="admin-stat-label">Flagged Content</div>
            </div>
            <div className="admin-stat-card">
              {/* <div className="admin-stat-icon">📅</div> */}
              <div className="admin-stat-value">{stats.todayUsers || 0}</div>
              <div className="admin-stat-label">New Users Today</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
