import React, { useState, useEffect } from 'react';
import { fetchWithAdminAuth } from '../utils/adminAuth';
import PSGNotification from '../../components/PSGNotification';
import { 
  Download, 
  FileText, 
  Filter, 
  Search, 
  Calendar, 
  Building, 
  User, 
  MapPin, 
  CheckCircle, 
  XCircle, 
  Clock,
  Star,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Archive,
  Grid,
  List,
  SortAsc,
  SortDesc,
  BarChart3
} from 'lucide-react';

const AdminDownloadExperiences = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedExperiences, setSelectedExperiences] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [stats, setStats] = useState({});
  
  // Toast notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };
  
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
        const errorMessage = errorData.message || 'Failed to fetch experiences';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      }
    } catch (err) {
      console.error('Error fetching experiences:', err);
      const errorMessage = 'Failed to fetch experiences';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
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
        showNotification('Experience downloaded successfully!', 'success');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Download failed';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      }
    } catch (err) {
      console.error('Error downloading experience:', err);
      const errorMessage = 'Download failed';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    } finally {
      setDownloadLoading(false);
    }
  };

  const downloadBulkExperiences = async () => {
    if (selectedExperiences.size === 0) {
      showNotification('Please select at least one experience', 'warning');
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
        showNotification(`Successfully downloaded ${Array.from(selectedExperiences).length} experiences!`, 'success');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Bulk download failed';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      }
    } catch (err) {
      console.error('Error downloading bulk experiences:', err);
      const errorMessage = 'Bulk download failed';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
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
        showNotification('Filtered experiences downloaded successfully!', 'success');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message || 'Filtered download failed';
        setError(errorMessage);
        showNotification(errorMessage, 'error');
      }
    } catch (err) {
      console.error('Error downloading filtered experiences:', err);
      const errorMessage = 'Filtered download failed';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.totalExperiences || 0}</p>
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Experiences</p>
          </div>
          <div className="w-12 h-12 bg-blue-200 dark:bg-blue-800 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-300" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-6 border border-green-200 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-green-700 dark:text-green-300">{selectedExperiences.size}</p>
            <p className="text-sm font-medium text-green-600 dark:text-green-400">Selected</p>
          </div>
          <div className="w-12 h-12 bg-green-200 dark:bg-green-800 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-300" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{experiences.length}</p>
            <p className="text-sm font-medium text-purple-600 dark:text-purple-400">Current Page</p>
          </div>
          <div className="w-12 h-12 bg-purple-200 dark:bg-purple-800 rounded-lg flex items-center justify-center">
            <Grid className="w-6 h-6 text-purple-600 dark:text-purple-300" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl p-6 border border-amber-200 dark:border-amber-800">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold text-amber-700 dark:text-amber-300">{pagination.totalPages}</p>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Total Pages</p>
          </div>
          <div className="w-12 h-12 bg-amber-200 dark:bg-amber-800 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-300" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
          <Filter className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters & Search</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">Filter and search through experiences</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Search className="w-4 h-4 inline mr-1" />
            Search
          </label>
          <input
            type="text"
            placeholder="Search company, role, or content..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Building className="w-4 h-4 inline mr-1" />
            Company
          </label>
          <select
            value={filters.company}
            onChange={(e) => handleFilterChange('company', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Companies</option>
            {filterOptions.companies.map(company => (
              <option key={company} value={company}>{company}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <User className="w-4 h-4 inline mr-1" />
            Role
          </label>
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Roles</option>
            {filterOptions.roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <CheckCircle className="w-4 h-4 inline mr-1" />
            Final Result
          </label>
          <select
            value={filters.finalResult}
            onChange={(e) => handleFilterChange('finalResult', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Results</option>
            {filterOptions.finalResults.map(result => (
              <option key={result} value={result}>{result}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Archive className="w-4 h-4 inline mr-1" />
            Internship Type
          </label>
          <select
            value={filters.internshipType}
            onChange={(e) => handleFilterChange('internshipType', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            {filterOptions.internshipTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <MapPin className="w-4 h-4 inline mr-1" />
            Location
          </label>
          <select
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Locations</option>
            {filterOptions.locations.map(location => (
              <option key={location} value={location}>{location}</option>
            ))}
          </select>
        </div>

        {/* <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 inline mr-1" />
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div> */}

        {/* <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            <Calendar className="w-4 h-4 inline mr-1" />
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div> */}
      </div>
      
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button 
          onClick={clearFilters} 
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Clear Filters</span>
        </button>
        <button 
          onClick={downloadFilteredExperiences}
          disabled={downloadLoading}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          {downloadLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Download className="w-4 h-4" />
          )}
          <span>{downloadLoading ? 'Downloading...' : 'Download Filtered Results'}</span>
        </button>
      </div>
    </div>
  );

  const renderExperiencesList = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
                disabled={experiences.length === 0}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Select All ({experiences.length})
              </span>
            </label>
            
            {selectedExperiences.size > 0 && (
              <button
                onClick={downloadBulkExperiences}
                disabled={downloadLoading}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {downloadLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{downloadLoading ? 'Downloading...' : `Download Selected (${selectedExperiences.size})`}</span>
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10 per page</option>
              <option value="20">20 per page</option>
              <option value="50">50 per page</option>
              <option value="100">100 per page</option>
            </select>
            
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="createdAt">Created Date</option>
              <option value="overallRating">Rating</option>
              <option value="companyInfo.companyName">Company</option>
              <option value="companyInfo.role">Role</option>
            </select>
            
            <button
              onClick={() => handleFilterChange('sortOrder', filters.sortOrder === 'desc' ? 'asc' : 'desc')}
              className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title={`Sort ${filters.sortOrder === 'desc' ? 'ascending' : 'descending'}`}
            >
              {filters.sortOrder === 'desc' ? (
                <SortDesc className="w-4 h-4" />
              ) : (
                <SortAsc className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg mb-4">
            <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading experiences...</p>
        </div>
      ) : experiences.length === 0 ? (
        <div className="p-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-lg mb-4">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">No experiences found</p>
          <p className="text-gray-600 dark:text-gray-400">No experiences match your current criteria.</p>
        </div>
      ) : (
        <>
          <div className="p-6">
            <div className="grid gap-4">
              {experiences.map(experience => (
                <div key={experience._id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedExperiences.has(experience._id)}
                        onChange={() => handleSelectExperience(experience._id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 mt-1"
                      />
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {experience.companyInfo.companyName}
                            </h4>
                            <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                              {experience.companyInfo.role}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 mb-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <User className="w-4 h-4" />
                            <span><strong>Author:</strong> {experience.userId?.name || 'N/A'}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Archive className="w-4 h-4" />
                            <span><strong>Type:</strong> {experience.companyInfo.internshipType}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <MapPin className="w-4 h-4" />
                            <span><strong>Location:</strong> {experience.companyInfo.location}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-600 dark:text-gray-400"><strong>Result:</strong></span>
                            {experience.finalResult === 'Selected' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Selected
                              </span>
                            )}
                            {experience.finalResult === 'Rejected' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200">
                                <XCircle className="w-3 h-3 mr-1" />
                                Rejected
                              </span>
                            )}
                            {experience.finalResult === 'Pending' && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200">
                                <Clock className="w-3 h-3 mr-1" />
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span>
                              <strong>Rating:</strong> {experience.overallRating}/5
                              <span className="ml-1 text-yellow-500">
                                {'★'.repeat(experience.overallRating)}{'☆'.repeat(5-experience.overallRating)}
                              </span>
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                            <span className="flex items-center space-x-1">
                              <List className="w-4 h-4" />
                              <span>{experience.rounds?.length || 0} Rounds</span>
                            </span>
                            <span className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>{new Date(experience.createdAt).toLocaleDateString()}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => downloadSingleExperience(experience._id)}
                      disabled={downloadLoading}
                      className="flex items-center justify-center w-10 h-10 text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Download this experience"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.hasPrev || loading}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>
              
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Page {pagination.currentPage} of {pagination.totalPages} ({pagination.totalExperiences} total)
                </span>
              </div>
              
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNext || loading}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Download className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Download Experiences</h1>
              <p className="text-gray-600 dark:text-gray-400">Export interview experiences as PDF documents</p>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        <PSGNotification 
          show={notification.show} 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ show: false, message: '', type: '' })} 
        />

        {renderStatsCards()}
        {renderFilters()}
        {renderExperiencesList()}
      </div>
    </div>
  );
};

export default AdminDownloadExperiences;
