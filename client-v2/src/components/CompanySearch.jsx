import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import PSGNotification from './PSGNotification.jsx';
import { 
  Search, 
  X, 
  Building, 
  MapPin, 
  Users, 
  CheckCircle, 
  Plus, 
  Loader2,
  Badge
} from 'lucide-react';
// import './CompanySearch.css';

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

  let isSubmitting = false;

const handleSelectNewCompany = async () => {
  if (isSubmitting) return; // ✅ Guard variable
  if (!searchQuery || searchQuery.trim().length < 2) return;

  const companyName = searchQuery.trim();

  try {
    isSubmitting = true; // ✅ Set guard active
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
    isSubmitting = false; // ✅ Reset guard
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
      <div className="relative">
        <input
          type="text"
          value={value}
          onClick={openModal}
          readOnly
          placeholder={placeholder}
          className={`w-full px-4 py-2 pr-12 border border-border rounded-lg bg-background cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${className}`}
          required={required}
        />
        <div 
          className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground transition-colors"
          onClick={openModal}
        >
          <Search className="w-4 h-4" />
        </div>
        {selectedCompany?.isVerified && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <CheckCircle className="w-4 h-4 text-green-500" />
          </div>
        )}
        {pendingCompanyName && (
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <Badge className="w-4 h-4 text-orange-500" />
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div 
            className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            ref={modalRef}
          >
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                <Building className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Search Company</span>
              </h3>
              <button 
                className="p-1 hover:bg-secondary rounded-lg transition-colors"
                onClick={closeModal}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Type company name..."
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
                {loading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                  </div>
                )}
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-4">
                {/* Application Database Validation Message */}
                {showAppValidation && appValidationMessage && (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
                    <div className="text-yellow-800 dark:text-yellow-300 mb-4">
                      {appValidationMessage}
                    </div>
                    {appDatabaseSuggestions.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span>Application Database Companies</span>
                        </h4>
                        <div className="space-y-2">
                          {appDatabaseSuggestions.map((company, index) => (
                            <div 
                              key={`app_db_${company.companyId || index}`}
                              className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-colors"
                              onClick={() => handleAppDatabaseCompanySelect(company)}
                            >
                              {company.logo ? (
                                <img 
                                  src={company.logo} 
                                  alt={company.displayName || company.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                                  <Building className="w-5 h-5 text-white" />
                                </div>
                              )}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="font-medium text-foreground truncate">
                                    {company.displayName || company.name}
                                  </span>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                    LinkedIn ✓
                                  </span>
                                </div>
                                {company.industry && (
                                  <p className="text-sm text-muted-foreground truncate">{company.industry}</p>
                                )}
                                <div className="flex items-center space-x-4 mt-1">
                                  {company.location && (
                                    <span className="flex items-center space-x-1 text-xs text-muted-foreground">
                                      <MapPin className="w-3 h-3" />
                                      <span>{company.location}</span>
                                    </span>
                                  )}
                                  {company.employeeCount && (
                                    <span className="flex items-center space-x-1 text-xs text-muted-foreground">
                                      <Users className="w-3 h-3" />
                                      <span>{company.employeeCount}</span>
                                    </span>
                                  )}
                                </div>
                                {company.description && (
                                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                    {company.description.length > 100 
                                      ? company.description.substring(0, 100) + '...' 
                                      : company.description}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex justify-end mt-4">
                      <button 
                        className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-secondary transition-colors"
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
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>Existing Companies</span>
                    </h4>
                    <div className="space-y-2">
                      {suggestions.map(company => (
                        <div 
                          key={company._id}
                          className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-colors"
                          onClick={() => handleCompanySelect(company)}
                        >
                          {company.logo ? (
                            <img 
                              src={company.logo} 
                              alt={company.displayName}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                              <Building className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-foreground truncate">
                                {company.displayName}
                              </span>
                              {company.isVerified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                            {company.industry && (
                              <p className="text-sm text-muted-foreground truncate">{company.industry}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* LinkedIn Companies */}
                {!showAppValidation && appDatabaseSuggestions.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>Application Database Companies</span>
                    </h4>
                    <div className="space-y-2">
                      {appDatabaseSuggestions.map((company, index) => (
                        <div 
                          key={`linkedin_${company.linkedinId || index}`}
                          className="flex items-center space-x-3 p-3 bg-card border border-border rounded-lg hover:border-blue-300 dark:hover:border-blue-700 cursor-pointer transition-colors"
                          onClick={() => handleAppDatabaseCompanySelect(company)}
                        >
                          {company.logo ? (
                            <img 
                              src={company.logo} 
                              alt={company.displayName || company.name}
                              className="w-10 h-10 rounded-lg object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                              <Building className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-foreground truncate">
                                {company.displayName || company.name}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                                LinkedIn ✓
                              </span>
                            </div>
                            {company.industry && (
                              <p className="text-sm text-muted-foreground truncate">{company.industry}</p>
                            )}
                            <div className="flex items-center space-x-4 mt-1">
                              {company.location && (
                                <span className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <MapPin className="w-3 h-3" />
                                  <span>{company.location}</span>
                                </span>
                              )}
                              {company.employeeCount && (
                                <span className="flex items-center space-x-1 text-xs text-muted-foreground">
                                  <Users className="w-3 h-3" />
                                  <span>{company.employeeCount}</span>
                                </span>
                              )}
                            </div>
                            {company.description && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {company.description.length > 100 
                                  ? company.description.substring(0, 100) + '...' 
                                  : company.description}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {!showAppValidation && searchQuery.trim().length >= 2 && 
                 !suggestions.find(c => c.displayName.toLowerCase() === searchQuery.trim().toLowerCase()) &&
                 !appDatabaseSuggestions.find(c => (c.displayName || c.name).toLowerCase() === searchQuery.trim().toLowerCase()) && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Create New</span>
                    </h4>
                    <div 
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg hover:border-green-300 dark:hover:border-green-700 cursor-pointer transition-colors"
                      onClick={handleSelectNewCompany}
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-green-800 dark:text-green-300 truncate block">
                          Select "{searchQuery.trim()}"
                        </span>
                        <p className="text-sm text-green-600 dark:text-green-400">
                          Will send request to admin for creation
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {searchQuery.length > 0 && searchQuery.length < 2 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Type at least 2 characters to search...</p>
                  </div>
                )}
                
                {searchQuery.length >= 2 && suggestions.length === 0 && appDatabaseSuggestions.length === 0 && !loading && !showAppValidation && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Building className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No companies found matching your search.</p>
                    <p className="text-xs mt-1">You can create a new company entry above.</p>
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
