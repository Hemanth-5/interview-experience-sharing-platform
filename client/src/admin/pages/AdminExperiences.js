import React, { useState, useEffect } from 'react';
import { createApiUrl } from '../../config/api';
import '../styles/admin.css';
import '../styles/AdminExperiences.css';

const AdminExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userSearchInput, setUserSearchInput] = useState(''); // Local user search input
  const [companySearchInput, setCompanySearchInput] = useState(''); // Local company search input
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [selectedExperience, setSelectedExperience] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [flagReasonDetails, setFlagReasonDetails] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    flagged: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    userSearch: '',
    companySearch: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        userSearch: userSearchInput,
        companySearch: companySearchInput,
        page: 1
      }));
    }, 500); // Debounce search by 500ms

    return () => clearTimeout(timeoutId);
  }, [userSearchInput, companySearchInput]);

  useEffect(() => {
    fetchExperiences();
  }, [filters]);

  const fetchExperiences = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
      // Clean up empty filters
      const cleanFilters = Object.keys(filters).reduce((acc, key) => {
        if (filters[key] !== '' && filters[key] != null) {
          acc[key] = filters[key];
        }
        return acc;
      }, {});
      
      const params = new URLSearchParams(cleanFilters).toString();
      console.log('Fetching with params:', params); // Debug log
      console.log('Clean filters:', cleanFilters); // Debug log
      const response = await fetch(createApiUrl(`/api/admin/experiences?${params}`), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('API Response:', data); // Debug log
        if (data.success) {
          setExperiences(data.data.experiences || []);
          setPagination({
            currentPage: data.data.pagination?.currentPage || 1,
            totalPages: data.data.pagination?.totalPages || 1,
            total: data.data.pagination?.total || (data.data.experiences || []).length
          });
          
          // Calculate stats
          const expArray = data.data.experiences || [];
          const newStats = {
            total: expArray.length,
            published: expArray.filter(exp => exp.isPublished && !exp.flagged).length,
            draft: expArray.filter(exp => !exp.isPublished && !exp.flagged).length,
            flagged: expArray.filter(exp => exp.flagged).length
          };
          setStats(newStats);
          setError(null); // Clear any previous errors
        } else {
          setError(data.message || 'Failed to fetch experiences');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.message || 'Failed to fetch experiences');
      }
    } catch (err) {
      console.error('Error fetching experiences:', err);
      setError('Failed to fetch experiences. Please try again.');
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleModerate = async (experienceId, action, reason = null, reasonDetails = null) => {
    try {
      const response = await fetch(createApiUrl(`/api/admin/experiences/${experienceId}/moderate`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ action, reason, reasonDetails })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Show success message based on action
          const actionMessages = {
            approve: 'published',
            unpublish: 'unpublished',
            flag: 'flagged',
            unflag: 'unflagged'
          };
          
          alert(`Experience ${actionMessages[action] || action}ed successfully`);
          
          // Refresh the data after successful moderation
          await fetchExperiences(true);
        } else {
          alert(data.message || 'Error moderating experience');
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        alert(errorData.message || 'Error moderating experience');
      }
    } catch (err) {
      console.error('Error moderating experience:', err);
      alert('Error moderating experience. Please try again.');
    }
  };

  const handleFlag = (experience) => {
    setSelectedExperience(experience);
    setShowFlagModal(true);
  };

  const submitFlag = async () => {
    if (!flagReason) {
      alert('Please select a reason for flagging');
      return;
    }
    
    await handleModerate(selectedExperience._id, 'flag', flagReason, flagReasonDetails);
    setShowFlagModal(false);
    setSelectedExperience(null);
    setFlagReason('');
    setFlagReasonDetails('');
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 1 // Only reset page to 1 if it's not a page change
    }));
  };

  const getStatusBadgeClass = (experience) => {
    if (experience.flagged) return 'admin-status-flagged';
    if (experience.isPublished) return 'admin-status-active';
    return 'admin-status-pending';
  };

  const getStatusText = (experience) => {
    if (experience.flagged) return 'Flagged';
    if (experience.isPublished) return 'Published';
    return 'Draft';
  };

  if (loading && experiences.length === 0) {
    return (
      <div className="admin-experiences">
        <div className="admin-experiences-header">
          <h1 className="admin-experiences-title">Experience Management</h1>
        </div>
        <div className="experiences-empty">
          <h3>Loading experiences...</h3>
          <p>Please wait while we fetch the data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-experiences">
      <div className="admin-experiences-header">
        <h1 className="admin-experiences-title">Experience Management</h1>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {(userSearchInput || companySearchInput || filters.status) && (
            <button 
              onClick={() => {
                setUserSearchInput('');
                setCompanySearchInput('');
                setFilters(prev => ({ ...prev, status: '', userSearch: '', companySearch: '', page: 1 }));
              }} 
              className="admin-btn admin-btn-outline"
              style={{ fontSize: '0.9rem', padding: '8px 16px' }}
            >
              Clear Filters
            </button>
          )}
          <button 
            onClick={() => fetchExperiences(true)} 
            className="admin-btn admin-btn-secondary"
            disabled={refreshing}
          >
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Statistics Summary */}
      {/* <div className="experiences-stats">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Experiences</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.published}</div>
            <div className="stat-label">Published</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.draft}</div>
            <div className="stat-label">Draft</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.flagged}</div>
            <div className="stat-label">Flagged</div>
          </div>
        </div>
      </div> */}

      {/* Filters */}
      <div className="admin-filters">
        {/* {(userSearchInput || companySearchInput || filters.status) && (
          <div style={{ 
            marginBottom: '1rem', 
            padding: '8px 16px', 
            background: 'rgba(79, 70, 229, 0.1)', 
            borderRadius: '8px', 
            fontSize: '0.9rem',
            color: 'var(--admin-primary)'
          }}>
            <strong>Active Filters:</strong> 
            {userSearchInput && ` User: "${userSearchInput}"`}
            {companySearchInput && ` Company: "${companySearchInput}"`}
            {filters.status && ` Status: ${filters.status}`}
          </div>
        )} */}
        <div className="admin-filters-grid">
          <div className="admin-filter-group">
            <label className="admin-filter-label">Search Users</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="admin-filter-input"
                placeholder="Search by user name or email..."
                value={userSearchInput}
                onChange={(e) => setUserSearchInput(e.target.value)}
              />
              {userSearchInput && (
                <button
                  onClick={() => setUserSearchInput('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#6b7280'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="admin-filter-group">
            <label className="admin-filter-label">Search Companies</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="admin-filter-input"
                placeholder="Search by company name..."
                value={companySearchInput}
                onChange={(e) => setCompanySearchInput(e.target.value)}
              />
              {companySearchInput && (
                <button
                  onClick={() => setCompanySearchInput('')}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    color: '#6b7280'
                  }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <div className="admin-filter-group">
            <label className="admin-filter-label">Status</label>
            <select
              className="admin-filter-select"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="flagged">Flagged</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="experiences-empty">
          <h3>Error Loading Experiences</h3>
          <p>{error}</p>
          <button 
            onClick={() => fetchExperiences(true)} 
            className="admin-btn admin-btn-primary"
            disabled={refreshing}
          >
            {refreshing ? 'Trying...' : 'Try Again'}
          </button>
        </div>
      )}

      {/* Experiences Table */}
      <div className="admin-experiences-list">
        {refreshing && (
          <div className="experiences-empty" style={{ padding: '2rem', background: 'rgba(79, 70, 229, 0.05)', border: '1px solid rgba(79, 70, 229, 0.1)' }}>
            <h3>Refreshing experiences...</h3>
            <p>Loading latest data...</p>
          </div>
        )}
        {!refreshing && experiences.length > 0 ? (
          <table className="admin-experiences-table">
            <thead>
              <tr>
                {/* <th>Experience</th> */}
                <th>Author</th>
                <th>Company</th>
                {/* <th>Position</th> */}
                <th>Status</th>
                <th>Views</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {experiences.map((experience) => (
                <tr key={experience._id}>
                  {/* <td>
                    <div className="experience-title">
                      {experience.title}
                    </div>
                    <div className="experience-meta">
                      {experience.experience?.substring(0, 100)}...
                    </div>
                  </td> */}
                  <td>
                    <div className="experience-author">
                      {experience.userId?.avatar ? (
                        <img
                          src={experience.userId.avatar}
                          alt={experience.userId.name}
                          className="author-avatar"
                        />
                      ) : (
                        <div className="author-avatar">
                          {experience.userId?.name?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="admin-author-info">
                        <div className="author-name">{experience.userId?.name || 'Unknown'}</div>
                        {/* <div className="author-email">{experience.userId?.email}</div> */}
                        </div>
                        </div>
                        </td>
                        <td>
                          <div className="experience-company">
                            {experience.companyInfo?.companyLogo && (
                              <img
                                src={experience.companyInfo.companyLogo}
                                alt={experience.companyInfo.companyName}
                                className="company-logo"
                                style={{ width: 28, height: 28, objectFit: 'contain', marginRight: 8, verticalAlign: 'middle', borderRadius: 4, background: '#fff', border: '1px solid #eee' }}
                              />
                            )}
                            <span>{experience.companyInfo?.companyName}</span>
                          </div>
                        </td>
                  <td>
                    <div className="experience-status">
                      <span className={`admin-status-badge ${getStatusBadgeClass(experience)}`}>
                        {getStatusText(experience)}
                      </span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--admin-primary)' }}>
                    {experience.views || 0}
                  </td>
                  <td style={{ textAlign: 'center', fontSize: '0.85rem' }}>
                    {new Date(experience.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </td>
                  <td>
                    <div className="experience-actions">
                      {!experience.isPublished && (
                        <button
                          className="action-btn action-btn-approve"
                          onClick={() => handleModerate(experience._id, 'approve')}
                        >
                          Publish
                        </button>
                      )}
                      {experience.isPublished && (
                        <button
                          className="action-btn action-btn-reject"
                          onClick={() => handleModerate(experience._id, 'unpublish')}
                        >
                          Unpublish
                        </button>
                      )}
                      {!experience.flagged ? (
                        <button
                          className="action-btn action-btn-flag"
                          onClick={() => handleFlag(experience)}
                        >
                          Flag
                        </button>
                      ) : (
                        <button
                          className="action-btn action-btn-unflag"
                          onClick={() => handleModerate(experience._id, 'unflag')}
                        >
                          Unflag
                        </button>
                      )}
                      <a
                        href={`/experiences/${experience._id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="action-btn action-btn-view"
                      >
                        View
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : !refreshing && (
          <div className="experiences-empty">
            <h3>No experiences found</h3>
            <p>Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="admin-pagination">
          <div className="pagination-info">
            Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.total)} of {pagination.total} experiences
          </div>
          <div className="pagination-controls">
            <button
              className="pagination-btn"
              disabled={pagination.currentPage <= 1}
              onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
            >
              Previous
            </button>
            
            {/* Page numbers */}
            {Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, i) => {
              let pageNum;
              const totalPages = pagination.totalPages || 1;
              const currentPage = pagination.currentPage || 1;
              
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
              }
              
              // Ensure pageNum is within valid range
              if (pageNum < 1 || pageNum > totalPages) {
                return null;
              }
              
              return (
                <button
                  key={pageNum}
                  className={`pagination-btn ${currentPage === pageNum ? 'active' : ''}`}
                  onClick={() => handleFilterChange('page', pageNum)}
                >
                  {pageNum}
                </button>
              );
            }).filter(Boolean)}
            
            <button
              className="pagination-btn"
              disabled={pagination.currentPage >= pagination.totalPages}
              onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '2rem',
            borderRadius: '12px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 1rem 0', color: '#dc2626' }}>
              Flag Experience
            </h3>
            <p style={{ margin: '0 0 1rem 0', color: '#666' }}>
              Experience by: <strong>{selectedExperience?.userId?.name}</strong><br/>
              Company: <strong>{selectedExperience?.companyInfo?.companyName}</strong>
            </p>
            
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Reason for flagging: <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <select
                value={flagReason}
                onChange={(e) => setFlagReason(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                <option value="">Select a reason...</option>
                <option value="inappropriate_content">Inappropriate Content</option>
                <option value="fake_information">Fake Information</option>
                <option value="spam">Spam</option>
                <option value="offensive_language">Offensive Language</option>
                <option value="copyright_violation">Copyright Violation</option>
                <option value="personal_attacks">Personal Attacks</option>
                <option value="off_topic">Off Topic</option>
                <option value="duplicate_content">Duplicate Content</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                Additional details (optional):
              </label>
              <textarea
                value={flagReasonDetails}
                onChange={(e) => setFlagReasonDetails(e.target.value)}
                placeholder="Provide additional context about why this content is being flagged..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '0.75rem',
                  border: '2px solid #e5e7eb',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                maxLength={500}
              />
              <small style={{ color: '#666' }}>
                {flagReasonDetails.length}/500 characters
              </small>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowFlagModal(false);
                  setSelectedExperience(null);
                  setFlagReason('');
                  setFlagReasonDetails('');
                }}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: '2px solid #e5e7eb',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitFlag}
                style={{
                  padding: '0.75rem 1.5rem',
                  border: 'none',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Flag Experience
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExperiences;
