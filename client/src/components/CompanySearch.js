import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import './CompanySearch.css';

const CompanySearch = ({ 
  value, 
  onChange, 
  onCompanySelect, 
  className = '', 
  placeholder = "Search for company...",
  required = false 
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  // Search for companies with debouncing
  const searchCompanies = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    try {
      setLoading(true);
      const response = await axios.get(createApiUrl(`/api/companies/search?query=${encodeURIComponent(query)}`), {
        withCredentials: true
      });
      
      if (response.data.success) {
        setSuggestions(response.data.data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Error searching companies:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    onChange(inputValue);
    
    // Clear selected company if input changes
    if (selectedCompany && inputValue !== selectedCompany.displayName) {
      setSelectedCompany(null);
      if (onCompanySelect) {
        onCompanySelect(null);
      }
    }
    
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
    onChange(company.displayName);
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (onCompanySelect) {
      onCompanySelect(company);
    }
  };

  const handleCreateNew = async () => {
    if (!value || value.trim().length < 2) return;
    
    try {
      setLoading(true);
      const response = await axios.post(createApiUrl('/api/companies/find-or-create'), {
        companyName: value.trim()
      }, {
        withCredentials: true
      });
      
      if (response.data.success) {
        const company = response.data.data;
        handleCompanySelect(company);
      }
    } catch (error) {
      console.error('Error creating company:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      setShowSuggestions(false);
    }, 200);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`company-search ${className}`}>
      <div className="company-search-input-container">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          className={`company-search-input ${className}`}
          required={required}
          autoComplete="off"
        />
        
        {loading && (
          <div className="company-search-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
        
        {selectedCompany && (
          <div className="company-search-verified">
            {selectedCompany.isVerified && <span className="verified-badge">✓</span>}
          </div>
        )}
      </div>
      
      {showSuggestions && (suggestions.length > 0 || value.trim().length >= 2) && (
        <div className="company-search-suggestions">
          {suggestions.map(company => (
            <div 
              key={company._id}
              className="company-suggestion-item"
              onClick={() => handleCompanySelect(company)}
            >
              <div className="company-suggestion-content">
                {company.logo && (
                  <img 
                    src={company.logo} 
                    alt={company.displayName}
                    className="company-suggestion-logo"
                  />
                )}
                <div className="company-suggestion-details">
                  <span className="company-suggestion-name">
                    {company.displayName}
                    {company.isVerified && <span className="verified-badge">✓</span>}
                  </span>
                  {company.industry && (
                    <span className="company-suggestion-industry">{company.industry}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {value.trim().length >= 2 && !suggestions.find(c => 
            c.displayName.toLowerCase() === value.trim().toLowerCase()
          ) && (
            <div 
              className="company-suggestion-item create-new"
              onClick={handleCreateNew}
            >
              <div className="company-suggestion-content">
                <div className="create-new-icon">+</div>
                <div className="company-suggestion-details">
                  <span className="company-suggestion-name">
                    Create "{value.trim()}" as new company
                  </span>
                  <span className="company-suggestion-industry">
                    Add this company to our database
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompanySearch;
