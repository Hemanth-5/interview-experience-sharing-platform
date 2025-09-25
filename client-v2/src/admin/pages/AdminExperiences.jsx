import React, { useState, useEffect } from 'react';
import { createApiUrl } from '../../config/api';
import PSGNotification from '../../components/PSGNotification';
import Avatar from '../../components/Avatar';
import { 
  FileText, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Flag, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  RefreshCw,
  Users,
  Building2,
  Calendar,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  BarChart3,
  X
} from 'lucide-react';

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
  const [expIdInput, setExpIdInput] = useState('');
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
  const [notification, setNotification] = useState({ open: false, message: '', type: 'info' });

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
      
      // If expIdInput is present, override filters to search by _id
      if (expIdInput && expIdInput.trim() !== '') {
        cleanFilters._id = expIdInput.trim();
      }
      const params = new URLSearchParams(cleanFilters).toString();
      // console.log('Fetching with params:', params); // Debug log
      // console.log('Clean filters:', cleanFilters); // Debug log
      const response = await fetch(createApiUrl(`/api/admin/experiences?${params}`), {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        // console.log('API Response:', data); // Debug log
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
      // console.error('Error fetching experiences:', err);
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
          const actionMessages = {
            approve: 'published',
            unpublish: 'unpublished',
            flag: 'flagged',
            unflag: 'unflagged'
          };
          setNotification({ open: true, message: `Experience ${actionMessages[action] || action}ed successfully`, type: 'success' });
          // Refresh the data after successful moderation
          await fetchExperiences(true);
        } else {
          setNotification({ open: true, message: data.message || 'Error moderating experience', type: 'error' });
        }
      } else {
        const errorData = await response.json().catch(() => ({}));
        setNotification({ open: true, message: errorData.message || 'Error moderating experience', type: 'error' });
      }
    } catch (err) {
      setNotification({ open: true, message: 'Error moderating experience. Please try again.', type: 'error' });
    }
  };

  const handleFlag = (experience) => {
    setSelectedExperience(experience);
    setShowFlagModal(true);
  };

  const submitFlag = async () => {
    if (!flagReason) {
      setNotification({ open: true, message: 'Please select a reason for flagging', type: 'error' });
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

  if (loading && experiences.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Experience Management</h1>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Loading experiences...</h3>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch the data.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <PSGNotification
          open={notification.open}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ ...notification, open: false })}
        />
        
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Experience Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor and moderate user-submitted experiences</p>
          </div>
          <div className="flex items-center gap-3">
            {(userSearchInput || companySearchInput || filters.status) && (
              <button 
                onClick={() => {
                  setUserSearchInput('');
                  setCompanySearchInput('');
                  setFilters(prev => ({ ...prev, status: '', userSearch: '', companySearch: '', page: 1 }));
                }} 
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </button>
            )}
            <button 
              onClick={() => fetchExperiences(true)} 
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
              disabled={refreshing}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Experiences</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Published</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.published}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Draft</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.draft}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Flagged</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-400">{stats.flagged}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
                <Flag className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </div>
        </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search by Experience ID
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Experience ID..."
                value={expIdInput}
                onChange={e => setExpIdInput(e.target.value)}
              />
              {expIdInput && (
                <button
                  onClick={() => setExpIdInput('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Users
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by user name or email..."
                value={userSearchInput}
                onChange={(e) => setUserSearchInput(e.target.value)}
              />
              {userSearchInput && (
                <button
                  onClick={() => setUserSearchInput('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Companies
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by company name..."
                value={companySearchInput}
                onChange={(e) => setCompanySearchInput(e.target.value)}
              />
              {companySearchInput && (
                <button
                  onClick={() => setCompanySearchInput('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 mb-8">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 mr-3" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Error Loading Experiences</h3>
          </div>
          <p className="text-red-700 dark:text-red-300 mb-4">{error}</p>
          <button 
            onClick={() => fetchExperiences(true)} 
            className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Trying...' : 'Try Again'}
          </button>
        </div>
      )}

      {/* Experiences Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
        {refreshing && (
          <div className="p-8 text-center border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-3"></div>
            <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-1">Refreshing experiences...</h3>
            <p className="text-blue-700 dark:text-blue-300">Loading latest data...</p>
          </div>
        )}
        
        {!refreshing && experiences.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Views
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                {experiences.map((experience) => (
                  <tr key={experience._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Avatar 
                          user={experience.userId} 
                          size={40} 
                          className="flex-shrink-0 mr-3" 
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {experience.userId?.name || 'Unknown'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {experience.userId?.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {experience.companyInfo?.companyLogo && (
                          <img
                            src={experience.companyInfo.companyLogo}
                            alt={experience.companyInfo.companyName}
                            className="w-8 h-8 object-contain mr-3 rounded bg-white border border-gray-200 dark:border-gray-600"
                          />
                        )}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {experience.companyInfo?.companyName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        experience.flagged 
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                          : experience.isPublished 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {experience.flagged ? (
                          <>
                            <Flag className="w-3 h-3 mr-1" />
                            Flagged
                          </>
                        ) : experience.isPublished ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Published
                          </>
                        ) : (
                          <>
                            <Clock className="w-3 h-3 mr-1" />
                            Draft
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-500 mr-1" />
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {experience.views || 0}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900 dark:text-white">
                          {new Date(experience.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        {!experience.isPublished && (
                          <button
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-green-700 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-lg transition-colors"
                            onClick={() => handleModerate(experience._id, 'approve')}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Publish
                          </button>
                        )}
                        {experience.isPublished && (
                          <button
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-red-700 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors"
                            onClick={() => handleModerate(experience._id, 'unpublish')}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Unpublish
                          </button>
                        )}
                        {!experience.flagged ? (
                          <button
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50 rounded-lg transition-colors"
                            onClick={() => handleFlag(experience)}
                          >
                            <Flag className="w-3 h-3 mr-1" />
                            Flag
                          </button>
                        ) : (
                          <button
                            className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                            onClick={() => handleModerate(experience._id, 'unflag')}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Unflag
                          </button>
                        )}
                        <a
                          href={`/experiences/${experience._id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          View
                        </a>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : !refreshing && (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No experiences found</h3>
            <p className="text-gray-600 dark:text-gray-400">Try adjusting your filters or check back later.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {((pagination.currentPage - 1) * filters.limit) + 1} to {Math.min(pagination.currentPage * filters.limit, pagination.total)} of {pagination.total} experiences
            </div>
            <div className="flex items-center space-x-2">
              <button
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                disabled={pagination.currentPage <= 1}
                onClick={() => handleFilterChange('page', pagination.currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </button>
              
              {/* Page numbers */}
              <div className="hidden sm:flex space-x-1">
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
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700'
                      }`}
                      onClick={() => handleFilterChange('page', pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                }).filter(Boolean)}
              </div>
              
              <button
                className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700"
                disabled={pagination.currentPage >= pagination.totalPages}
                onClick={() => handleFilterChange('page', pagination.currentPage + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flag Modal */}
      {showFlagModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 text-center">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={() => setShowFlagModal(false)}></div>
            
            <div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-xl max-w-md w-full mx-auto shadow-xl border border-white/20 dark:border-gray-700/30">
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center mr-4">
                    <Flag className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Flag Experience
                  </h3>
                </div>
                
                <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <strong>Experience by:</strong> {selectedExperience?.userId?.name}<br/>
                    <strong>Company:</strong> {selectedExperience?.companyInfo?.companyName}
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Reason for flagging <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={flagReason}
                    onChange={(e) => setFlagReason(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Additional details (optional)
                  </label>
                  <textarea
                    value={flagReasonDetails}
                    onChange={(e) => setFlagReasonDetails(e.target.value)}
                    placeholder="Provide additional context about why this content is being flagged..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    rows={3}
                    maxLength={500}
                  />
                  <div className="mt-1 text-right">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {flagReasonDetails.length}/500 characters
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      setShowFlagModal(false);
                      setSelectedExperience(null);
                      setFlagReason('');
                      setFlagReasonDetails('');
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitFlag}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                  >
                    Flag Experience
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
  );
};

export default AdminExperiences;
