import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useSearchParams } from 'react-router-dom';
import { createApiUrl } from '../config/api';
import axios from 'axios';
import CompanyLogo from '../components/CompanyLogo.jsx';
import SearchableDropdown from '../components/SearchableDropdown.jsx';
import SmartSearch from '../components/SmartSearch.jsx';
import EnhancedExperienceCard from '../components/EnhancedExperienceCard.jsx';
import ExperiencePreviewModal from '../components/ExperiencePreviewModal.jsx';
import {
  Search,
  Filter,
  Star,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Building2,
  Briefcase,
  Clock,
  ThumbsUp,
  MessageCircle,
  Flag,
  Verified,
  IndianRupee,
  Timer,
  AlertCircle,
  Edit
} from 'lucide-react';

const Experiences = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    // Core interview filters (always visible)
    search: searchParams.get('search') || '',
    company: searchParams.get('company') || '',
    role: searchParams.get('role') || '',
    internshipType: searchParams.get('internshipType') || '',
    location: searchParams.get('location') || '',
    sortBy: searchParams.get('sortBy') || 'recent',

    // Advanced filters (optional section)
    branch: searchParams.get('branch') || '',
    department: searchParams.get('department') || '',
    graduationYear: searchParams.get('graduationYear') || ''
  });
  const [pagination, setPagination] = useState({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  // Preview modal state
  const [previewExperience, setPreviewExperience] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const internshipTypeOptions = ['Summer', 'Winter', 'Full-time', 'Part-time', 'PPO', 'Contract'];
  const locationOptions = ['Remote', 'On-site', 'Hybrid'];
  
  // Advanced filter options
  const branchOptions = ['B. E.', 'B. Tech.', 'B. Sc.', 'Other'];
  const departmentOptions = [
    'Automobile Engineering',
    'Biomedical Engineering', 
    'Civil Engineering',
    'Computer Science and Engineering',
    'Computer Science and Engineering (AI and ML)',
    'Electrical and Electronics Engineering',
    'Electronics and Communication Engineering',
    'Instrumentation and Control Engineering',
    'Mechanical Engineering',
    'Metallurgical Engineering',
    'Production Engineering',
    'Robotics and Automation',
    'Bio Technology',
    'Fashion Technology',
    'Information Technology',
    'Textile Technology',
    'Electrical and Electronics Engineering (Sandwich)',
    'Mechanical Engineering (Sandwich)',
    'Production Engineering (Sandwich)',
    'Applied Science',
    'Computer Systems and Design'
  ];
  const graduationYearOptions = Array.from({length: 11}, (_, i) => 2020 + i); // 2020-2030
  
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

  const fetchExperiences = useCallback(async () => {
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

      // // console.log('Fetching experiences with params:', queryParams.toString());
      const apiUrl = createApiUrl(`/api/experiences?${queryParams}`);
      // // console.log('API URL:', apiUrl);

      const response = await axios.get(apiUrl, {
        withCredentials: true
      });
      
      // // console.log('Response:', response.data);
      
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
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchExperiences();
  }, [fetchExperiences]);

  useEffect(() => {
    // Update URL when filters change
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (pagination.page > 1) params.set('page', pagination.page.toString());
    setSearchParams(params);
  }, [filters, pagination.page, setSearchParams]);

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
      // Core interview filters (always visible)
      search: '',
      company: '',
      role: '',
      internshipType: '',
      location: '',
      sortBy: 'recent',

      // Advanced filters (optional section)
      branch: '',
      department: '',
      graduationYear: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Preview handlers
  const handlePreview = (experience) => {
    setPreviewExperience(experience);
    setIsPreviewOpen(true);
  };

  const closePreview = () => {
    setIsPreviewOpen(false);
    setPreviewExperience(null);
  };

  const { user } = useAuth();
  const [flaggedPopup, setFlaggedPopup] = useState(null);
  
  // Background data reminder state
  const [showBackgroundReminder, setShowBackgroundReminder] = useState(false);

  const renderExperienceCard = (experience) => {
    const isOwner = user && experience.userId && (experience.userId._id === user.id);
    const isFlagged = experience.flagged;
    
    const getOutcomeConfig = (outcome) => {
      switch (outcome) {
        case 'Selected': 
          return { 
            class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
            
          };
        case 'Rejected': 
          return { 
            class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
            
          };
        case 'Pending': 
        case 'Withdrawn':
          return { 
            class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
            // icon: '⏳'
          };
        default: 
          return { 
            class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
            // icon: '❓'
          };
      }
    };

    const handleClick = (e) => {
      if (isFlagged && !isOwner) {
        e.preventDefault();
        setFlaggedPopup(Array.isArray(experience.flagReason) ? experience.flagReason.join(', ') : (experience.flagReason || 'This content is flagged and cannot be opened.'));
      }
    };

    const outcomeConfig = getOutcomeConfig(experience.finalResult);

    return (
      <Link
        key={experience._id}
        to={isFlagged && !isOwner ? '#' : `/experiences/${experience._id}`}
        className="group block"
        onClick={handleClick}
        style={isFlagged && !isOwner ? { cursor: 'not-allowed', pointerEvents: 'auto', opacity: 0.7 } : {}}
        tabIndex={0}
      >
        <div className="bg-card border border-border rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden relative group-hover:border-blue-200 dark:group-hover:border-blue-800">
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-cyan-50/30 to-teal-50/50 dark:from-blue-950/20 dark:via-cyan-950/10 dark:to-teal-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div className="p-4 sm:p-6 relative z-10">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 sm:space-x-3 mb-2 sm:mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                    <CompanyLogo
                      companyName={experience.companyInfo?.companyName || 'Unknown Company'}
                      companyLogo={experience.companyInfo?.companyLogo}
                      size={28}
                      className="rounded-lg sm:w-8 sm:h-8"
                    />
                  </div>
                  <div className="flex items-center space-x-1 sm:space-x-2 flex-wrap">
                    <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-medium border ${outcomeConfig.class}`}>
                      <span className="mr-1">{outcomeConfig.icon}</span>
                      {experience.finalResult || 'Pending'}
                    </div>
                    {isFlagged && (
                      <div 
                        className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800"
                        title={Array.isArray(experience.flagReason) ? experience.flagReason.join(', ') : (experience.flagReason || 'Flagged content: Be aware of potential issues')}
                      >
                        <Flag className="w-3 h-3 mr-1" />
                        <span className="hidden sm:inline">Flagged</span>
                        <span className="sm:hidden">!</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="font-bold text-base sm:text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                  <span className="font-semibold text-foreground">{experience.companyInfo?.companyName || 'Unknown Company'}</span> - <span className="font-semibold text-foreground">{experience.companyInfo?.role || 'Unknown Role'}</span>
                </h3>
                
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground mb-2 sm:mb-3">
                  {/* <span className="w-1 h-1 bg-muted-foreground rounded-full"></span> */}
                  <span>{experience.companyInfo?.internshipType || 'N/A'}</span>
                  {experience.companyInfo?.stipend && (
                    <>
                      <span className="w-1 h-1 bg-muted-foreground rounded-full"></span>
                      <div className="flex items-center text-green-600 dark:text-green-400 font-medium">
                        <IndianRupee className="w-3 h-3 mr-1" />
                        <span className="text-xs sm:text-sm">{experience.companyInfo.stipend.toLocaleString()}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col items-end space-y-1 sm:space-y-2">
                <div className="flex items-center space-x-1 bg-yellow-50 dark:bg-yellow-900/20 px-2 sm:px-3 py-1 rounded-full border border-yellow-200 dark:border-yellow-800">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 fill-current" />
                  <span className="text-xs sm:text-sm font-bold text-yellow-700 dark:text-yellow-300">{experience.overallRating || 0}</span>
                </div>
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>{experience.rounds?.length || 0} rounds</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-1 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{experience.companyInfo?.location || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>{experience.companyInfo?.department || 'N/A'}</span>
              </div>
            </div>
            
            {experience.overallExperience && (
              <p className="text-muted-foreground mb-3 sm:mb-4 line-clamp-2 leading-relaxed group-hover:text-foreground/80 transition-colors text-xs sm:text-sm">
                {experience.overallExperience.substring(0, 120)}...
              </p>
            )}
            
            <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-border/50">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                    {experience.isAnonymous ? 'A' : (experience.userId?.name ? experience.userId.name.split("-")[1].trim()[0].toUpperCase() : 'A')}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {experience.isAnonymous ? 'Anonymous' : (experience.userId?.name || 'Anonymous')}
                </span>
              </div>
              
              {/* <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{experience.upvoteCount || 0}</span>
                </div>
                <div className="flex items-center space-x-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <MessageCircle className="w-4 h-4" />
                  <span>{experience.commentCount || 0}</span>
                </div>
              </div> */}
            </div>
          </div>
        </div>
      </Link>
    );
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = window.innerWidth < 640 ? 3 : 5; // Show fewer pages on mobile
    let startPage = Math.max(1, pagination.page - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-8 sm:mt-12 px-4">
        <button
          onClick={() => handlePageChange(pagination.page - 1)}
          disabled={pagination.page === 1}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </button>
        
        {startPage > 1 && (
          <>
            <button
              onClick={() => handlePageChange(1)}
              className="px-2 sm:px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              1
            </button>
            {startPage > 2 && <span className="px-1 sm:px-2 text-muted-foreground text-sm">...</span>}
          </>
        )}

        {pages.map(page => (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`px-2 sm:px-4 py-2 border rounded-lg transition-colors text-sm ${
              page === pagination.page 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'border-border hover:bg-secondary'
            }`}
          >
            {page}
          </button>
        ))}

        {endPage < pagination.totalPages && (
          <>
            {endPage < pagination.totalPages - 1 && <span className="px-1 sm:px-2 text-muted-foreground text-sm">...</span>}
            <button
              onClick={() => handlePageChange(pagination.totalPages)}
              className="px-2 sm:px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm"
            >
              {pagination.totalPages}
            </button>
          </>
        )}

        <button
          onClick={() => handlePageChange(pagination.page + 1)}
          disabled={pagination.page === pagination.totalPages}
          className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 border border-border rounded-lg hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
        >
          <span className="hidden sm:inline">Next</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Flagged Content Popup */}
      {flaggedPopup && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Flagged Content</h2>
            <p className="text-muted-foreground mb-4">
              This experience has been flagged and cannot be opened.
            </p>
            <button
              onClick={() => setFlaggedPopup(null)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition-colors font-medium"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-blue-50/30 to-cyan-50/50 dark:from-background dark:via-blue-950/20 dark:to-cyan-950/30">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-3 sm:px-4 py-8 sm:py-12 lg:py-16">
          <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-600 to-cyan-600 dark:from-white dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Interview Experiences
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Discover insights from interview experiences shared by PSG students
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {/* Filters Section */}
        <div className="bg-card border border-border rounded-2xl shadow-lg mb-6 sm:mb-8">
          <div className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                <h2 className="text-base sm:text-lg font-semibold">Filter Experiences</h2>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
                <button 
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm flex-1 sm:flex-none justify-center sm:justify-start"
                >
                  {showFilters ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                </button>
                {Object.values(filters).some(v => v) && (
                  <button 
                    onClick={clearFilters}
                    className="flex items-center space-x-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Clear All</span>
                    <span className="sm:hidden">Clear</span>
                  </button>
                )}
              </div>
            </div>

            {/* Core Filters - Toggleable */}
            <div className={`transition-all duration-300 ${showFilters ? 'opacity-100 mt-4 sm:mt-6' : 'opacity-0 max-h-0 overflow-hidden'}`}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-4">
                <div className="space-y-2 sm:col-span-2 lg:col-span-3">
                  <label className="text-sm font-medium text-foreground">Search</label>
                  <SmartSearch
                    onSearch={(query) => handleFilterChange('search', query)}
                    className="mt-1"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Company</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 mt-1 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Company name"
                    value={filters.company}
                    onChange={(e) => handleFilterChange('company', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Role</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 mt-1 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Job title or role"
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Internship Type</label>
                  <SearchableDropdown
                    value={filters.internshipType}
                    onChange={(value) => handleFilterChange('internshipType', value)}
                    options={['', ...internshipTypeOptions]}
                    placeholder="All Types"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Location</label>
                  <SearchableDropdown
                    value={filters.location}
                    onChange={(value) => handleFilterChange('location', value)}
                    options={['', ...locationOptions]}
                    placeholder="All Locations"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Sort By</label>
                  <SearchableDropdown
                    value={filters.sortBy}
                    onChange={(value) => handleFilterChange('sortBy', value)}
                    options={sortOptions.map(option => option.value)}
                    placeholder="Sort by"
                  />
                </div>
              </div>

              {/* Advanced Filters - Student Background */}
              <div className="border-t border-border pt-4">
                <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Student Background Filters
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Branch</label>
                    <SearchableDropdown
                      value={filters.branch}
                      onChange={(value) => handleFilterChange('branch', value)}
                      options={['', ...branchOptions]}
                      placeholder="All Branches"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Department</label>
                    <SearchableDropdown
                      value={filters.department}
                      onChange={(value) => handleFilterChange('department', value)}
                      options={['', ...departmentOptions]}
                      placeholder="All Departments"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Graduation Year</label>
                    <SearchableDropdown
                      value={filters.graduationYear}
                      onChange={(value) => handleFilterChange('graduationYear', value)}
                      options={['', ...graduationYearOptions.map(year => year.toString())]}
                      placeholder="All Years"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <span className="text-base sm:text-lg font-semibold text-foreground">
                {loading ? 'Loading...' : `${pagination.total.toLocaleString()} experiences found`}
              </span>
              {(Object.entries(filters).some(([key, value]) => value && key !== 'sortBy')) && (
                <div className="flex items-center space-x-2 px-2 sm:px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Filters applied</span>
                </div>
              )}
            </div>
            <Link 
              to="/create" 
              className="hidden sm:flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-colors font-medium shadow-lg hover:shadow-xl text-sm sm:text-base w-full sm:w-auto justify-center sm:justify-start"
            >
              <Plus className="w-4 h-4" />
              <span>Share Experience</span>
            </Link>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-16">
              <div className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
              <p className="text-muted-foreground text-sm sm:text-base">Loading experiences...</p>
            </div>
          ) : experiences.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {experiences.map((experience) => (
                  <EnhancedExperienceCard
                    key={experience._id}
                    experience={experience}
                    onPreview={() => handlePreview(experience)}
                    isOwner={user && experience.userId && (experience.userId._id === user.id)}
                  />
                ))}
              </div>
              {renderPagination()}
            </>
          ) : (
            <div className="text-center py-12 sm:py-16 px-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No experiences found</h3>
              <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                Try adjusting your filters or search terms to find more experiences.
              </p>
              <button 
                onClick={clearFilters}
                className="inline-flex items-center space-x-2 border border-border hover:bg-secondary px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-colors font-medium text-sm sm:text-base"
              >
                <X className="w-4 h-4" />
                <span>Clear Filters</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Experience Preview Modal */}
      {isPreviewOpen && (
        <ExperiencePreviewModal
          experience={previewExperience}
          isOpen={isPreviewOpen}
          onClose={closePreview}
        />
      )}
    </div>
  );
};

export default Experiences;
