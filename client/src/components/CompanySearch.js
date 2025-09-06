import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import PSGNotification from './PSGNotification';
import './CompanySearch.css';

const CompanySearch = ({ 
  value, 
  onChange, 
  onCompanySelect, 
  className = '', 
  placeholder = "Search for company...",
  required = false 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [appDatabaseSuggestions, setAppDatabaseSuggestions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [pendingCompanyName, setPendingCompanyName] = useState(null); // For companies to be created later
  const [showAppValidation, setShowAppValidation] = useState(false);
  const [appValidationMessage, setAppValidationMessage] = useState('');
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const searchTimeoutRef = useRef(null);
  const modalRef = useRef(null);

  // Search for companies with debouncing (includes application database)
  const searchCompanies = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setAppDatabaseSuggestions([]);
      return;
    }
    
    try {
      setLoading(true);
      
      // Single API call that includes both local and application database results
      const response = await axios.get(createApiUrl(`/api/companies/search?query=${encodeURIComponent(query)}&includeAppData=true`), {
        withCredentials: true
      });
      
      if (response.data.success) {
        const allResults = response.data.data;
        
        // Separate existing companies from application database suggestions
        const existingCompanies = allResults.filter(company => !company.isFromAppDatabase);
        const appDatabaseCompanies = allResults.filter(company => company.isFromAppDatabase);
        
        setSuggestions(existingCompanies);
        setAppDatabaseSuggestions(appDatabaseCompanies);
        
        // console.log(`Found ${existingCompanies.length} existing companies and ${appDatabaseCompanies.length} application database companies`);
      }
      
    } catch (error) {
      console.error('Error searching companies:', error);
      setSuggestions([]);
      setAppDatabaseSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    const inputValue = e.target.value;
    setSearchQuery(inputValue);
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchCompanies(inputValue);
    }, 300);
  };

  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    setPendingCompanyName(null); // Clear any pending company name
    onChange(company.displayName);
    setShowModal(false);
    setSearchQuery('');
    setSuggestions([]);
    
    if (onCompanySelect) {
      onCompanySelect(company);
    }
  };

  const handleSelectNewCompany = async () => {
    if (!searchQuery || searchQuery.trim().length < 2) return;
    
    const companyName = searchQuery.trim();
    
    try {
      setLoading(true);
      setShowAppValidation(true);
      
      // Send request to admin to create company
      const requestResponse = await axios.post(createApiUrl('/api/users/request-company-creation'), {
        companyName: companyName
      }, {
        withCredentials: true
      });
      
      if (requestResponse.data.success) {
        // Close the modal
        setShowModal(false);
        setSearchQuery('');
        setSuggestions([]);
        setAppDatabaseSuggestions([]);
        setShowAppValidation(false);
        setAppValidationMessage('');
        
        // Show success notification
        setShowSuccessNotification(true);
        
        // Redirect to home after a short delay
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
        
        return;
      } else {
        setAppValidationMessage(
          `Failed to send request: ${requestResponse.data.message}`
        );
      }
      
    } catch (error) {
      console.error('Company creation request error:', error);
      if (error.response?.status === 400 && error.response?.data?.message?.includes('pending request')) {
        setAppValidationMessage(
          `You already have a pending request for "${companyName}". Please wait for admin approval or check your notifications.`
        );
      } else {
        setAppValidationMessage(
          'Failed to send company creation request. Please try again later.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const proceedWithCompanyCreation = (companyName) => {
    // Set as pending company (to be created later)
    setPendingCompanyName(companyName);
    setSelectedCompany(null);
    onChange(companyName);
    setShowModal(false);
    setSearchQuery('');
    setSuggestions([]);
    setAppDatabaseSuggestions([]);
    setShowAppValidation(false);
    setAppValidationMessage('');
    
    if (onCompanySelect) {
      onCompanySelect({
        isPending: true,
        displayName: companyName,
        pendingName: companyName
      });
    }
  };

  const handleAppDatabaseCompanySelect = (appDatabaseCompany) => {
    setSelectedCompany(appDatabaseCompany);
    setPendingCompanyName(null);
    onChange(appDatabaseCompany.displayName || appDatabaseCompany.name);
    setShowModal(false);
    setSearchQuery('');
    setSuggestions([]);
    setAppDatabaseSuggestions([]);
    setShowAppValidation(false);
    setAppValidationMessage('');
    
    if (onCompanySelect) {
      onCompanySelect({
        ...appDatabaseCompany,
        isFromAppDatabase: true,
        isAppDatabaseVerified: true
      });
    }
  };

  const openModal = () => {
    setShowModal(true);
    setSearchQuery(value || '');
    if (value && value.length >= 2) {
      searchCompanies(value);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSearchQuery('');
    setSuggestions([]);
    setAppDatabaseSuggestions([]);
    setShowAppValidation(false);
    setAppValidationMessage('');
  };

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showModal]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <>
      {/* Input Field */}
      <div className="company-search-input-wrapper">
        <input
          type="text"
          value={value}
          onClick={openModal}
          readOnly
          placeholder={placeholder}
          className={`company-search-trigger ${className}`}
          required={required}
        />
        <div className="company-search-icon" onClick={openModal}>
          🔍
        </div>
        {selectedCompany?.isVerified && (
          <div className="company-search-verified">
            <span className="verified-badge">✓</span>
          </div>
        )}
        {pendingCompanyName && (
          <div className="company-search-pending">
            <span className="pending-badge">NEW</span>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="company-search-modal-overlay">
          <div className="company-search-modal" ref={modalRef}>
            <div className="company-search-modal-header">
              <h3>Search Company</h3>
              <button className="modal-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>
            
            <div className="company-search-modal-body">
              <div className="search-input-container">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Type company name..."
                  className="modal-search-input"
                  autoFocus
                />
                {loading && (
                  <div className="search-loading">
                    <div className="loading-spinner"></div>
                  </div>
                )}
              </div>
              
              <div className="search-results">
                {/* Application Database Validation Message */}
                {showAppValidation && appValidationMessage && (
                  <div className="app-database-validation-section">
                    <div className="validation-message">
                      {appValidationMessage}
                    </div>
                    {appDatabaseSuggestions.length > 0 && (
                      <div className="app-database-suggestions">
                        <h4>Application Database Companies</h4>
                        {appDatabaseSuggestions.map((company, index) => (
                          <div 
                            key={`app_db_${company.companyId || index}`}
                            className="company-result-item app-database-company"
                            onClick={() => handleAppDatabaseCompanySelect(company)}
                          >
                            <div className="company-result-content">
                              {company.logo && (
                                <img 
                                  src={company.logo} 
                                  alt={company.displayName || company.name}
                                  className="company-result-logo"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              )}
                              <div className="company-result-details">
                                <span className="company-result-name">
                                  {company.displayName || company.name}
                                  <span className="linkedin-badge">LinkedIn ✓</span>
                                </span>
                                {company.industry && (
                                  <span className="company-result-industry">{company.industry}</span>
                                )}
                                <div className="company-result-meta">
                                  {company.location && (
                                    <span className="company-result-location">📍 {company.location}</span>
                                  )}
                                  {company.employeeCount && (
                                    <span className="company-result-employees">👥 {company.employeeCount}</span>
                                  )}
                                </div>
                                {company.description && (
                                  <span className="company-result-description">
                                    {company.description.length > 100 
                                      ? company.description.substring(0, 100) + '...' 
                                      : company.description}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="validation-actions">
                      <button 
                        className="btn-cancel-validation"
                        onClick={() => {
                          setShowAppValidation(false);
                          setAppValidationMessage('');
                        }}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}

                {/* Existing Companies */}
                {!showAppValidation && suggestions.length > 0 && (
                  <div className="results-section">
                    <h4>Existing Companies</h4>
                    {suggestions.map(company => (
                      <div 
                        key={company._id}
                        className="company-result-item"
                        onClick={() => handleCompanySelect(company)}
                      >
                        <div className="company-result-content">
                          {company.logo && (
                            <img 
                              src={company.logo} 
                              alt={company.displayName}
                              className="company-result-logo"
                            />
                          )}
                          <div className="company-result-details">
                            <span className="company-result-name">
                              {company.displayName}
                              {company.isVerified && <span className="verified-badge">✓</span>}
                            </span>
                            {company.industry && (
                              <span className="company-result-industry">{company.industry}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* LinkedIn Companies */}
                {!showAppValidation && appDatabaseSuggestions.length > 0 && (
                  <div className="results-section">
                    <h4>Application Database Companies</h4>
                    {appDatabaseSuggestions.map((company, index) => (
                      <div 
                        key={`linkedin_${company.linkedinId || index}`}
                        className="company-result-item linkedin-company"
                        onClick={() => handleAppDatabaseCompanySelect(company)}
                      >
                        <div className="company-result-content">
                          {company.logo && (
                            <img 
                              src={company.logo} 
                              alt={company.displayName || company.name}
                              className="company-result-logo"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          )}
                          <div className="company-result-details">
                            <span className="company-result-name">
                              {company.displayName || company.name}
                            </span>
                            {company.industry && (
                              <span className="company-result-industry">{company.industry}</span>
                            )}
                            <div className="company-result-meta">
                              {company.location && (
                                <span className="company-result-location">📍 {company.location}</span>
                              )}
                              {company.employeeCount && (
                                <span className="company-result-employees">👥 {company.employeeCount}</span>
                              )}
                            </div>
                            {company.description && (
                              <span className="company-result-description">
                                {company.description.length > 100 
                                  ? company.description.substring(0, 100) + '...' 
                                  : company.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {!showAppValidation && searchQuery.trim().length >= 2 && 
                 !suggestions.find(c => c.displayName.toLowerCase() === searchQuery.trim().toLowerCase()) &&
                 !appDatabaseSuggestions.find(c => (c.displayName || c.name).toLowerCase() === searchQuery.trim().toLowerCase()) && (
                  <div className="results-section">
                    <h4>Create New</h4>
                    <div 
                      className="company-result-item create-new"
                      onClick={handleSelectNewCompany}
                    >
                      <div className="company-result-content">
                        <div className="create-new-icon">+</div>
                        <div className="company-result-details">
                          <span className="company-result-name">
                            Select "{searchQuery.trim()}"
                          </span>
                          <span className="company-result-industry">
                            Will send request to admin for creation
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {searchQuery.length > 0 && searchQuery.length < 2 && (
                  <div className="search-hint">
                    Type at least 2 characters to search...
                  </div>
                )}
                
                {searchQuery.length >= 2 && suggestions.length === 0 && !loading && (
                  <div className="no-results">
                    No companies found. You can select to create a new one above.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Notification */}
      <PSGNotification
        message="Company request sent successfully! You will be redirected to the home page shortly."
        type="success"
        open={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        duration={2000}
      />
    </>
  );
};

export default CompanySearch;
