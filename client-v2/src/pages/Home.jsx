import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createApiUrl } from '../config/api';
import CompanyLogo from '../components/CompanyLogo.jsx';
import SmartSearch from '../components/SmartSearch.jsx';
import EnhancedExperienceCard from '../components/EnhancedExperienceCard.jsx';
import ExperiencePreviewModal from '../components/ExperiencePreviewModal.jsx';
// import AnalyticsDashboard from '../components/AnalyticsDashboard.jsx';
import { Search, Filter, Star, MapPin, Calendar, Users, TrendingUp, ChevronRight, Briefcase, Building2, GraduationCap, AlertCircle, X, Edit } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentExperiences, setRecentExperiences] = useState([]);
  const [topCompanies, setTopCompanies] = useState([]);
  const [featuredExperience, setFeaturedExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Background data reminder state
  const [showBackgroundReminder, setShowBackgroundReminder] = useState(false);

  // Preview modal state
  const [previewExperience, setPreviewExperience] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, []);

  // Check if user needs to complete background data
  useEffect(() => {
    if (user) {
      const isBackgroundIncomplete = !user.backgroundData || 
        !user.backgroundData.branch || 
        !user.backgroundData.department || 
        !user.backgroundData.yearOfStudy;
      
      const hasReminderBeenDismissed = localStorage.getItem(`backgroundReminder_dismissed_${user.id}`) === 'true';
      
      if (isBackgroundIncomplete && !hasReminderBeenDismissed) {
        setShowBackgroundReminder(true);
      }
    }
  }, [user]);

  const dismissBackgroundReminder = () => {
    setShowBackgroundReminder(false);
    if (user) {
      localStorage.setItem(`backgroundReminder_dismissed_${user.id}`, 'true');
    }
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

  const fetchHomeData = async () => {
    try {
      const [statsResponse, experiencesResponse, companiesResponse, featuredResponse] = await Promise.all([
        fetch(createApiUrl('/api/analytics/platform-stats')),
        fetch(createApiUrl('/api/experiences?limit=6&sort=-createdAt')),
        fetch(createApiUrl('/api/analytics/top-companies?limit=6')),
        fetch(createApiUrl('/api/experiences/featured?limit=1'))
      ]);

      if (experiencesResponse.ok) {
        const experiencesData = await experiencesResponse.json();
        setRecentExperiences(experiencesData.data || []);
      }

      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setTopCompanies(companiesData.data || []);
      }

      if (featuredResponse.ok) {
        const featuredData = await featuredResponse.json();
        setFeaturedExperience(featuredData.data?.[0] || null);
      }
    } catch (error) {
      console.error('Error fetching home data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-blue-50/30 to-cyan-50/50 dark:from-background dark:via-blue-950/20 dark:to-cyan-950/30">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20 lg:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-6 sm:space-y-8">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium border border-blue-200 dark:border-blue-800">
              <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>PSG College of Technology</span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold leading-tight">
              <span className="bg-gradient-to-r from-gray-900 via-blue-600 to-cyan-600 dark:from-white dark:via-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Interview Experiences
              </span>
              <br />
              <span className="text-lg sm:text-xl md:text-2xl lg:text-4xl text-muted-foreground font-normal">
                by Students, for Students
              </span>
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Connect with your seniors and peers. Share interview experiences, get placement tips, and help each other succeed.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto px-2 sm:px-0">
              <SmartSearch
                onSearch={(query) => {
                  if (query.trim()) {
                    navigate(`/experiences?search=${encodeURIComponent(query.trim())}`);
                  }
                }}
                className="w-full"
              />
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 sm:px-0">
              {user ? (
                <Link 
                  to="/create" 
                  className="hidden sm:inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
                >
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Share Your Experience
                </Link>
              ) : (
                <button 
                  onClick={() => navigate('/login')} 
                  className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold"
                >
                  Sign In to Share
                </button>
              )}
              <Link 
                to="/experiences" 
                className="inline-flex items-center justify-center border-2 border-border hover:bg-secondary text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 hover:scale-105 font-semibold"
              >
                Browse Experiences
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
              </Link>
            </div>
            
            {/* Stats */}
            {/* <div className="grid grid-cols-3 gap-8 max-w-md mx-auto pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">500+</div>
                <div className="text-sm text-muted-foreground">Experiences</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">200+</div>
                <div className="text-sm text-muted-foreground">Companies</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-foreground">95%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div> */}
          </div>
        </div>
      </section>

      {/* Background Data Completion Reminder */}
      {showBackgroundReminder && (
        <section className="bg-amber-50 dark:bg-amber-950/20 border-b border-amber-200 dark:border-amber-800">
          <div className="container mx-auto px-3 sm:px-4 py-4">
            <div className="flex items-center justify-between max-w-4xl mx-auto">
              <div className="flex items-center space-x-3 flex-1">
                <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm sm:text-base font-semibold text-amber-800 dark:text-amber-200">
                    Complete Your Profile
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-300">
                    Help others find relevant experiences by completing your academic background information.
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 ml-4">
                <Link
                  to="/settings"
                  className="inline-flex items-center space-x-1 bg-amber-600 hover:bg-amber-700 text-white px-3 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm font-medium"
                >
                  <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Complete Profile</span>
                  <span className="sm:hidden">Complete</span>
                </Link>
                {/* <button
                  onClick={dismissBackgroundReminder}
                  className="p-2 text-amber-600 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
                  title="Dismiss reminder"
                >
                  <X className="w-4 h-4" />
                </button> */}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filter Section */}
      {/* <section className="py-12 bg-card/50 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold">Filter Experiences</h2>
              <span className="text-sm text-muted-foreground">Find the perfect interview experience</span>
            </div>
            <div className="flex items-center space-x-4">
              <select className="bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Companies</option>
                <option>Google</option>
                <option>Microsoft</option>
                <option>Amazon</option>
              </select>
              <select className="bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Levels</option>
                <option>Intern</option>
                <option>Entry Level</option>
                <option>Mid Level</option>
              </select>
              <select className="bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option>All Outcomes</option>
                <option>Selected</option>
                <option>Rejected</option>
                <option>Pending</option>
              </select>
            </div>
          </div>
        </div>
      </section> */}

      {/* Popular Companies */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Popular Companies
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              Where PSG students commonly get placed
            </p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-6">
            {topCompanies.length > 0 ? (
              topCompanies.map((company, index) => (
                <Link 
                  key={index} 
                  to={`/experiences?company=${encodeURIComponent(company._id)}`}
                  className="group"
                >
                  <div className="bg-card border border-border rounded-2xl p-3 sm:p-4 lg:p-6 text-center hover:shadow-lg transition-all duration-300 group-hover:scale-105 group-hover:border-blue-200 dark:group-hover:border-blue-800">
                    <CompanyLogo 
                      companyName={company._id} 
                      companyLogo={company.logo}
                      size={32}
                      className="mx-auto mb-2 sm:mb-3 rounded-xl sm:w-12 sm:h-12 lg:w-12 lg:h-12"
                    />
                    <h3 className="font-semibold text-foreground group-hover:text-blue-600 transition-colors text-xs sm:text-sm">
                      {company._id}
                    </h3>
                    <div className="flex items-center justify-center space-x-1 mt-1 sm:mt-2">
                      <Users className="w-2 h-2 sm:w-3 sm:h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        {company.count} experience{company.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full text-center py-8 sm:py-12 lg:py-16">
                <Building2 className="w-12 h-12 sm:w-16 sm:h-16 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-2">No Companies Yet</h3>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">Be the first to share your experience!</p>
                {user ? (
                  <Link 
                    to="/create" 
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-colors text-sm sm:text-base"
                  >
                    Share Experience
                  </Link>
                ) : (
                  <button 
                    onClick={() => navigate('/login')} 
                    className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl transition-colors text-sm sm:text-base"
                  >
                    Sign In to Share
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Personal Analytics Dashboard for Logged-in Users */}
      {/* {user && (
        <section className="py-12 sm:py-16 lg:py-20">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Your Analytics Dashboard
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Track your interview preparation journey
                </p>
              </div>
              <Link 
                to="/dashboard" 
                className="hidden sm:inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View Full Dashboard
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="bg-card border border-border rounded-2xl shadow-lg p-6 lg:p-8">
              <AnalyticsDashboard userId={user.id} />
            </div>
            
            <div className="text-center mt-8 sm:mt-12 sm:hidden">
              <Link 
                to="/dashboard" 
                className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                View Full Dashboard
              </Link>
            </div>
          </div>
        </section>
      )} */}

      {/* Recent Experiences */}
      {recentExperiences.length > 0 && (
        <section className="py-12 sm:py-16 lg:py-20 bg-gray-50/50 dark:bg-gray-900/20">
          <div className="container mx-auto px-3 sm:px-4">
            <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  Recent Experiences
                </h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Latest interviews from your fellow PSG students
                </p>
              </div>
              <Link 
                to="/experiences" 
                className="hidden sm:inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recentExperiences.slice(0, 6).map((experience) => (
                <EnhancedExperienceCard
                  key={experience._id}
                  experience={experience}
                  onPreview={() => handlePreview(experience)}
                  isOwner={user && experience.userId && (experience.userId._id === user.id)}
                />
              ))}
            </div>
            
            <div className="text-center mt-8 sm:mt-12 sm:hidden">
              <Link 
                to="/experiences" 
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                View All Experiences
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="text-center space-y-3 sm:space-y-4 mb-8 sm:mb-12 lg:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground">
              Why PSG Interview Hub?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Built by PSG students, for PSG students - your success is our mission
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Real PSG Experiences</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Authentic interview experiences shared by your seniors and peers from PSG College
              </p>
            </div>
            
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto">
                <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Insider Tips</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Get exclusive preparation strategies and insider knowledge from successful candidates
              </p>
            </div>
            
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 dark:bg-purple-900/30 rounded-2xl flex items-center justify-center mx-auto">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Alumni Network</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Connect with successful PSG graduates working in top companies worldwide
              </p>
            </div>
            
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center mx-auto">
                <GraduationCap className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Career Growth</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Track progress, learn from failures, and accelerate your journey to dream companies
              </p>
            </div>
          </div>
        </div>
      </section>

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

export default Home;