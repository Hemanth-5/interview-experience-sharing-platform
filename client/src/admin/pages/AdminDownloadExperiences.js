import React, { useState, useEffect } from 'react';
import { fetchWithAdminAuth } from '../utils/adminAuth';
import '../styles/admin.css';
import './AdminDownloadExperiences.css';

const AdminDownloadExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExperiences, setSelectedExperiences] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [stats, setStats] = useState({});
  
  // Filters
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    company: '',
    role: '',
    finalResult: '',
    internshipType: '',
    location: '',
    startDate: '',
    endDate: '',
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [filterOptions, setFilterOptions] = useState({
    companies: [],
    roles: [],
    internshipTypes: [],
    locations: [],
    finalResults: []
  });
  
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalExperiences: 0,
    hasNext: false,
    hasPrev: false
  });

  const [activeTab, setActiveTab] = useState('browse'); // browse, bulk, filtered
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      fetchExperiences();
      fetchStats();
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);

  useEffect(() => {
    if (!isInitialLoad) {
      fetchExperiences();
    }
  }, [filters.page, filters.sortBy, filters.sortOrder, filters.limit]);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (!isInitialLoad) {
        if (filters.page === 1) {
          fetchExperiences();
        } else {
          // Reset to page 1 when filters change
          setFilters(prev => ({ ...prev, page: 1 }));
        }
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [filters.company, filters.role, filters.finalResult, filters.internshipType, 
      filters.location, filters.startDate, filters.endDate, filters.search]);

  const fetchExperiences = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          queryParams.append(key, value);
        }
      });

      // console.log('Fetching experiences with params:', Object.fromEntries(queryParams));

      const response = await fetchWithAdminAuth(`/api/admin/download/experiences?${queryParams}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setExperiences(data.data.experiences);
          setPagination(data.data.pagination);
          setFilterOptions(data.data.filterOptions);
          // console.log('Pagination data:', data.data.pagination);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch experiences');
      }
    } catch (err) {
      console.error('Error fetching experiences:', err);
      setError('Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetchWithAdminAuth('/api/admin/download/stats');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset to page 1 when changing filters (except for page itself)
      page: key === 'page' ? value : 1
    }));
    
    // Clear selections when filters change (except for page, sortBy, sortOrder, limit)
    if (!['page', 'sortBy', 'sortOrder', 'limit'].includes(key)) {
      setSelectedExperiences(new Set());
      setSelectAll(false);
    }
  };

  const handleSelectExperience = (experienceId) => {
    const newSelected = new Set(selectedExperiences);
    if (newSelected.has(experienceId)) {
      newSelected.delete(experienceId);
    } else {
      newSelected.add(experienceId);
    }
    setSelectedExperiences(newSelected);
    setSelectAll(newSelected.size === experiences.length && experiences.length > 0);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedExperiences(new Set());
    } else {
      setSelectedExperiences(new Set(experiences.map(exp => exp._id)));
    }
    setSelectAll(!selectAll);
  };

  const downloadSingleExperience = async (experienceId) => {
    setDownloadLoading(true);
    try {
      const response = await fetchWithAdminAuth('/api/admin/download/experiences/single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experienceId })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `experience_${experienceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Download failed');
      }
    } catch (err) {
      console.error('Error downloading experience:', err);
      setError('Download failed');
    } finally {
      setDownloadLoading(false);
    }
  };

  const downloadBulkExperiences = async () => {
    if (selectedExperiences.size === 0) {
      setError('Please select at least one experience');
      return;
    }

    setDownloadLoading(true);
    try {
      const response = await fetchWithAdminAuth('/api/admin/download/experiences/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          experienceIds: Array.from(selectedExperiences) 
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulk_experiences_${Date.now()}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        // Clear selection after successful download
        setSelectedExperiences(new Set());
        setSelectAll(false);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Bulk download failed');
      }
    } catch (err) {
      console.error('Error downloading bulk experiences:', err);
      setError('Bulk download failed');
    } finally {
      setDownloadLoading(false);
    }
  };

  const downloadFilteredExperiences = async () => {
    setDownloadLoading(true);
    try {
      const filterData = {
        company: filters.company,
        role: filters.role,
        finalResult: filters.finalResult,
        internshipType: filters.internshipType,
        location: filters.location,
        startDate: filters.startDate,
        endDate: filters.endDate,
        search: filters.search,
        maxResults: 50
      };

      const response = await fetchWithAdminAuth('/api/admin/download/experiences/filtered', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterData)
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `filtered_experiences_${Date.now()}.${blob.type.includes('zip') ? 'zip' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Filtered download failed');
      }
    } catch (err) {
      console.error('Error downloading filtered experiences:', err);
      setError('Filtered download failed');
    } finally {
      setDownloadLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 20,
      company: '',
      role: '',
      finalResult: '',
      internshipType: '',
      location: '',
      startDate: '',
      endDate: '',
      search: '',
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSelectedExperiences(new Set());
    setSelectAll(false);
  };

  const renderStatsCards = () => (
    <div className="dlexp-stats-grid">
      <div className="dlexp-stat-card">
        <div className="dlexp-stat-number">{stats.totalExperiences || 0}</div>
        <div className="dlexp-stat-label">Total Experiences</div>
      </div>
      <div className="dlexp-stat-card">
        <div className="dlexp-stat-number">{selectedExperiences.size}</div>
        <div className="dlexp-stat-label">Selected</div>
      </div>
      <div className="dlexp-stat-card">
        <div className="dlexp-stat-number">{experiences.length}</div>
        <div className="dlexp-stat-label">Current Page</div>
      </div>
      <div className="dlexp-stat-card">
        <div className="dlexp-stat-number">{pagination.totalPages}</div>
        <div className="dlexp-stat-label">Total Pages</div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="dlexp-filters-section">
      <h3>🔍 Filters & Search</h3>
      <div className="dlexp-filters-grid">
        <div className="dlexp-filter-group">
          <label>Search</label>
          <input
            type="text"
            placeholder="Search company, role, or content..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="dlexp-filter-input"
          />
        </div>
        
        <div className="dlexp-filter-group">
          <label>Company</label>
          <select
            value={filters.company}
            onChange={(e) => handleFilterChange('company', e.target.value)}
            className="dlexp-filter-select"
          >
            <option value="">All Companies</option>
            {filterOptions.companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>

        <div className="dlexp-filter-group">
          <label>Role</label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="dlexp-filter-select"
          >
            <option value="">All Roles</option>
            {filterOptions.roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="dlexp-filter-group">
          <label>Final Result</label>
          <select
            value={filters.finalResult}
            onChange={(e) => handleFilterChange('finalResult', e.target.value)}
            className="dlexp-filter-select"
          >
            <option value="">All Results</option>
            {filterOptions.finalResults.map(result => (
              <option key={result} value={result}>{result}</option>
            ))}
          </select>
        </div>

        <div className="dlexp-filter-group">
          <label>Internship Type</label>
          <select
            value={filters.internshipType}
            onChange={(e) => handleFilterChange('internshipType', e.target.value)}
            className="dlexp-filter-select"
          >
            <option value="">All Types</option>
            {filterOptions.internshipTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="dlexp-filter-group">
          <label>Location</label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="dlexp-filter-select"
          >
            <option value="">All Locations</option>
            {filterOptions.locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        <div className="dlexp-filter-group">
          <label>Start Date</label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="dlexp-filter-input"
          />
        </div>

        <div className="dlexp-filter-group">
          <label>End Date</label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="dlexp-filter-input"
          />
        </div>
      </div>
      
      <div className="dlexp-filter-actions">
        <button 
          onClick={clearFilters} 
          className="dlexp-btn dlexp-btn-secondary"
        >
          Clear Filters
        </button>
        <button 
          onClick={downloadFilteredExperiences}
          disabled={downloadLoading}
          className="dlexp-btn dlexp-btn-primary"
        >
          {downloadLoading ? 'Downloading...' : 'Download Filtered Results'}
        </button>
      </div>
    </div>
  );

  const renderExperiencesList = () => (
    <div className="dlexp-experiences-section">
      <div className="dlexp-experiences-header">
        <div className="dlexp-selection-controls">
          <label className="dlexp-checkbox-label">
            <input
              type="checkbox"
              checked={selectAll}
              onChange={handleSelectAll}
              disabled={experiences.length === 0}
            />
            Select All ({experiences.length})
          </label>
          
          {selectedExperiences.size > 0 && (
            <button
              onClick={downloadBulkExperiences}
              disabled={downloadLoading}
              className="dlexp-btn dlexp-btn-accent"
            >
              {downloadLoading ? 'Downloading...' : `Download Selected (${selectedExperiences.size})`}
            </button>
          )}
        </div>

        <div className="dlexp-sort-controls">
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', e.target.value)}
            className="dlexp-sort-select"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
            <option value="100">100 per page</option>
          </select>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
            className="dlexp-sort-select"
          >
            <option value="createdAt">Created Date</option>
            <option value="overallRating">Rating</option>
            <option value="companyInfo.companyName">Company</option>
            <option value="companyInfo.role">Role</option>
          </select>
          <select
            value={filters.sortOrder}
            onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
            className="dlexp-sort-select"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="dlexp-loading">
          <div className="dlexp-spinner"></div>
          <p>Loading experiences...</p>
        </div>
      ) : experiences.length === 0 ? (
        <div className="dlexp-no-data">
          <p>No experiences found matching your criteria.</p>
        </div>
      ) : (
        <>
          <div className="dlexp-experiences-grid">
            {experiences.map(experience => (
              <div key={experience._id} className="dlexp-experience-card">
                <div className="dlexp-card-header">
                  <label className="dlexp-checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectedExperiences.has(experience._id)}
                      onChange={() => handleSelectExperience(experience._id)}
                    />
                  </label>
                  <div className="dlexp-card-title">
                    <h4>{experience.companyInfo.companyName}</h4>
                    <span className="dlexp-role">{experience.companyInfo.role}</span>
                  </div>
                  <button
                    onClick={() => downloadSingleExperience(experience._id)}
                    disabled={downloadLoading}
                    className="dlexp-btn dlexp-btn-sm dlexp-btn-primary"
                    title="Download this experience"
                  >
                    📄
                  </button>
                </div>
                
                <div className="dlexp-card-content">
                  <div className="dlexp-card-details">
                    <span className="dlexp-detail-item">
                      <strong>Author:</strong> {experience.userId?.name || 'N/A'}
                    </span>
                    <span className="dlexp-detail-item">
                      <strong>Type:</strong> {experience.companyInfo.internshipType}
                    </span>
                    <span className="dlexp-detail-item">
                      <strong>Location:</strong> {experience.companyInfo.location}
                    </span>
                    <span className="dlexp-detail-item">
                      <strong>Result:</strong> 
                      <span className={`dlexp-result dlexp-result-${experience.finalResult.toLowerCase()}`}>
                        {experience.finalResult}
                      </span>
                    </span>
                    <span className="dlexp-detail-item">
                      <strong>Rating:</strong> 
                      <span className="dlexp-rating">
                        {'⭐'.repeat(experience.overallRating)} ({experience.overallRating}/5)
                      </span>
                    </span>
                  </div>
                  
                  <div className="dlexp-card-meta">
                    <span className="dlexp-rounds-count">
                      {experience.rounds?.length || 0} Rounds
                    </span>
                    <span className="dlexp-created-date">
                      {new Date(experience.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="dlexp-pagination">
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={!pagination.hasPrev || loading}
              className="dlexp-btn dlexp-btn-secondary"
            >
              ← Previous
            </button>
            
            <div className="dlexp-pagination-info">
              <span>
                Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalExperiences} total)
              </span>
            </div>
            
            <button
              onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={!pagination.hasNext || loading}
              className="dlexp-btn dlexp-btn-secondary"
            >
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="dlexp-admin-container">
      <div className="dlexp-header">
        <h1>Download Experiences</h1>
        <p>Export interview experiences as PDF documents</p>
      </div>

      {error && (
        <div className="dlexp-error-banner">
          <strong>Error:</strong> {error}
          <button onClick={() => setError(null)} className="dlexp-error-close">×</button>
        </div>
      )}

      {renderStatsCards()}
      {renderFilters()}
      {renderExperiencesList()}
    </div>
  );
};

export default AdminDownloadExperiences;
