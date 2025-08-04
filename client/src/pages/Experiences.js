import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createApiUrl } from '../config/api';
import axios from 'axios';
import CompanyLogo from '../components/CompanyLogo';
import './Experiences.css';

const Experiences = () => {
  // const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    company: searchParams.get('company') || '',
    role: searchParams.get('role') || '',
    finalResult: searchParams.get('finalResult') || '',
    internshipType: searchParams.get('internshipType') || '',
    location: searchParams.get('location') || '',
    rating: searchParams.get('rating') || '',
    yearOfStudy: searchParams.get('yearOfStudy') || '',
    sortBy: searchParams.get('sortBy') || 'recent'
  });
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const internshipTypeOptions = ['Summer', 'Winter', 'Full-time', 'Part-time', 'PPO', 'Contract'];
  const locationOptions = ['Remote', 'On-site', 'Hybrid'];
  const resultOptions = ['Selected', 'Rejected', 'Withdrawn', 'Pending'];
  const yearOfStudyOptions = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Postgraduate'];
  const sortOptions = [
    { value: 'recent', label: 'Newest First' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'views', label: 'Most Viewed' }
  ];

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchExperiences();
  }, [filters, pagination.page]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (pagination.page > 1) params.set('page', pagination.page.toString());
    setSearchParams(params);
  }, [filters, pagination.page, setSearchParams]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      
      // Clean filters - remove empty values
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value && value.trim() !== '') {
          acc[key] = value;
        }
        return acc;
      }, {});
      
      const queryParams = new URLSearchParams({
        ...cleanFilters,
        page: pagination.page.toString(),
        limit: pagination.limit.toString()
      });

      // console.log('Fetching experiences with params:', queryParams.toString());
      const apiUrl = createApiUrl(`/api/experiences?${queryParams}`);
      // console.log('API URL:', apiUrl);

      const response = await axios.get(apiUrl, {
        withCredentials: true
      });
      
      // console.log('Response:', response.data);
      
      if (response.data.success) {
        setExperiences(response.data.data || []);
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination?.totalDocuments || 0,
          totalPages: response.data.pagination?.totalPages || 0
        }));
        setError(null);
      } else {
        throw new Error(response.data.message || 'Failed to fetch experiences');
      }
    } catch (error) {
      // console.error('Error fetching experiences:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      company: '',
      role: '',
      finalResult: '',
      internshipType: '',
      location: '',
      rating: '',
      yearOfStudy: '',
      sortBy: 'recent'
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const renderExperienceCard = (experience) => (
    <Link 
      key={experience._id} 
      to={`/experiences/${experience._id}`}
      className="exp-experience-card"
    >
      <div className="exp-experience-header">
        <div className="exp-company-info">
          <div className="exp-company-logo-container">
            <CompanyLogo 
              companyName={experience.companyInfo?.companyName || 'Unknown Company'} 
              size={40}
            />
          </div>
          <div className="exp-company-details">
            <h3 className="exp-company-name">{experience.companyInfo?.companyName || 'Unknown Company'}</h3>
            <p className="exp-role">{experience.companyInfo?.role || 'Unknown Role'}</p>
          </div>
        </div>
        <span className={`exp-result-badge ${experience.finalResult?.toLowerCase() || 'pending'}`}>
          {experience.finalResult || 'Pending'}
        </span>
      </div>
      
      <div className="exp-experience-meta">
        <div className="exp-experience-details">
          <span className="exp-department">{experience.companyInfo?.department || 'N/A'}</span>
          <span className="exp-location">{experience.companyInfo?.location || 'N/A'}</span>
        </div>
        <div className="exp-experience-stats">
          <span className="exp-rating">⭐ {experience.overallRating || 0}/5</span>
          <span className="exp-rounds">{experience.rounds?.length || 0} rounds</span>
        </div>
      </div>
    </Link>
  );

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="exp-pagination">
        <button
          className="exp-pagination-btn"
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
        >
          <i className="fas fa-chevron-left"></i>
          Previous
        </button>
        
        {startPage > 1 && (
          <>
            <button
              className="exp-pagination-number"
              onClick={() => handlePageChange(1)}
            >
              1
            </button>
            {startPage > 2 && <span className="exp-pagination-ellipsis">...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            className={`exp-pagination-number ${page === pagination.page ? 'active' : ''}`}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </button>
        ))}

        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className="exp-pagination-ellipsis">...</span>}
            <button
              className="exp-pagination-number"
              onClick={() => handlePageChange(pagination.totalPages)}
            >
              {pagination.totalPages}
            </button>
          </>
        )}

        <button
          className="exp-pagination-btn"
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
        >
          Next
          <i className="fas fa-chevron-right"></i>
        </button>
      </div>
    );
  };

  return (
    <div className="exp-experiences">
      {/* Header Section */}
      <section className="exp-experiences-header">
        <div className="exp-header-content">
          <h1 className="exp-header-title">Interview Experiences</h1>
          <p className="exp-header-subtitle">
            Discover insights from interview experiences shared by PSG students
          </p>
        </div>
      </section>

      <div className="exp-container">
        {/* Filters */}
        <div className="exp-filters-section">
          <div className="exp-filters-container">
            <h2 className="exp-filters-title">
              <i className="fas fa-filter"></i>
              Filters
            </h2>
            <div className="exp-filters-actions">
              <button 
                className="exp-filters-toggle" 
                onClick={() => setShowFilters(!showFilters)}
              >
                <i className={`fas fa-chevron-${showFilters ? 'up' : 'down'}`}></i>
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </button>
              {Object.values(filters).some(v => v) && (
                <button className="exp-clear-filters-btn" onClick={clearFilters}>
                  <i className="fas fa-times"></i>
                  Clear All
                </button>
              )}
            </div>
          </div>

          <div className={`exp-filters-grid ${showFilters ? 'show' : ''}`}>
            <div className="exp-filter-group">
              <label className="exp-filter-label">Search</label>
              <input
                type="text"
                className="exp-filter-input"
                placeholder="Search companies, roles, or keywords..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            <div className="exp-filter-group">
              <label className="exp-filter-label">Company</label>
              <input
                type="text"
                className="exp-filter-input"
                placeholder="Company name"
                value={filters.company}
                onChange={(e) => handleFilterChange('company', e.target.value)}
              />
            </div>

            <div className="exp-filter-group">
              <label className="exp-filter-label">Role</label>
              <input
                type="text"
                className="exp-filter-input"
                placeholder="Job title or role"
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
              />
            </div>

            <div className="exp-filter-group">
              <label className="exp-filter-label">Internship Type</label>
              <select
                className="exp-filter-select"
                value={filters.internshipType}
                onChange={(e) => handleFilterChange('internshipType', e.target.value)}
              >
                <option value="">All Types</option>
                {internshipTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="exp-filter-group">
              <label className="exp-filter-label">Location</label>
              <select
                className="exp-filter-select"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              >
                <option value="">All Locations</option>
                {locationOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="exp-filter-group">
              <label className="exp-filter-label">Final Result</label>
              <select
                className="exp-filter-select"
                value={filters.finalResult}
                onChange={(e) => handleFilterChange('finalResult', e.target.value)}
              >
                <option value="">All Results</option>
                {resultOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="exp-filter-group">
              <label className="exp-filter-label">Year of Study</label>
              <select
                className="exp-filter-select"
                value={filters.yearOfStudy}
                onChange={(e) => handleFilterChange('yearOfStudy', e.target.value)}
              >
                <option value="">All Years</option>
                {yearOfStudyOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="exp-filter-group">
              <label className="exp-filter-label">Minimum Rating</label>
              <select
                className="exp-filter-select"
                value={filters.rating}
                onChange={(e) => handleFilterChange('rating', e.target.value)}
              >
                <option value="">All Ratings</option>
                <option value="1">1+ Stars</option>
                <option value="2">2+ Stars</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>

            <div className="exp-filter-group">
              <label className="exp-filter-label">Sort By</label>
              <select
                className="exp-filter-select"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="exp-results-section">
          <div className="exp-results-header">
            <div className="exp-results-info">
              <span className="exp-results-count">
                {loading ? 'Loading...' : `${pagination.total.toLocaleString()} experiences found`}
              </span>
              {(Object.entries(filters).some(([key, value]) => value && key !== 'sortBy')) && (
                <span className="exp-active-filters">
                  <i className="fas fa-filter"></i>
                  Filters applied
                </span>
              )}
            </div>
            <Link to="/create" className="exp-btn exp-btn-primary">
              <i className="fas fa-plus"></i>
              Share Experience
            </Link>
          </div>

          {loading ? (
            <div className="exp-loading-layout">
              <div className="exp-loading-spinner"></div>
              <p>Loading experiences...</p>
            </div>
          ) : experiences.length > 0 ? (
            <>
              <div className="exp-experiences-grid">
                {experiences.map(renderExperienceCard)}
              </div>
              {renderPagination()}
            </>
          ) : (
            <div className="exp-empty-state">
              <div className="exp-empty-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3 className="exp-empty-title">No experiences found</h3>
              <p className="exp-empty-description">
                Try adjusting your filters or search terms to find more experiences.
              </p>
              <button className="exp-btn exp-btn-outline" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Experiences;
