import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import Avatar from '../components/Avatar.jsx';
import { extractUserName } from '../utils/avatar';
import CompanyLogo from "../components/CompanyLogo.jsx"
import { 
  User, 
  FileText, 
  Bookmark, 
  Star, 
  Eye, 
  ThumbsUp, 
  TrendingUp,
  Award,
  Target,
  Calendar,
  Settings,
  Plus,
  Building,
  MapPin,
  Clock,
  Trophy,
  Crown,
  Diamond,
  Medal,
  GraduationCap,
  X,
  Loader,
  AlertTriangle,
  ExternalLink
} from 'lucide-react';

const Profile = () => {
  const { user } = useAuth();
  const [userExperiences, setUserExperiences] = useState([]);
  const [bookmarkedExperiences, setBookmarkedExperiences] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('experiences');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [announcement, setAnnouncement] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchProfileData();
    fetchAnnouncement();
  }, []);

  // Fetch latest announcement/news notification if not seen
  const fetchAnnouncement = async () => {
    try {
      const res = await fetch('/api/users/notifications?limit=1&unreadOnly=false');
      const data = await res.json();
      if (data.success && data.data.notifications.length > 0) {
        const ann = data.data.notifications.find(n => n.announcement);
        if (ann && !(user?.announcementsSeen || []).includes(ann._id)) {
          setAnnouncement(ann);
          setShowAnnouncement(true);
        }
      }
    } catch {}
  };
  // Mark announcement as seen
  const dismissAnnouncement = async () => {
    setShowAnnouncement(false);
    if (announcement) {
      await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ announcementsSeen: [...(user.announcementsSeen || []), announcement._id] })
      });
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's experiences
      const experiencesResponse = await axios.get(createApiUrl('/api/users/my-experiences'), {
        withCredentials: true
      });
      
      // Fetch bookmarked experiences
      const bookmarksResponse = await axios.get(createApiUrl('/api/users/bookmarks'), {
        withCredentials: true
      });
      
      // Fetch user statistics from analytics
      const statsResponse = await axios.get(createApiUrl('/api/analytics/user-stats'), {
        withCredentials: true
      });

      setUserExperiences(experiencesResponse.data.data);
      setBookmarkedExperiences(bookmarksResponse.data.data);
      setStats(statsResponse.data.data);
      // console.log(stats);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch profile data');
    } finally {
      setLoading(false);
    }
  };

  // const handleUpdateProfile = async (e) => {
  //   e.preventDefault();
  //   try {
  //     setLoading(true);
  //     const response = await axios.put(createApiUrl('/api/users/profile'), editData, {
  //       withCredentials: true
  //     });

  //     if (response.data.success) {
  //       setProfile(response.data.data);
  //       updateUser(response.data.data);
  //       setEditMode(false);
  //       setError(null);
  //     }
  //   } catch (error) {
  //     setError(error.response?.data?.message || 'Failed to update profile');
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  // const handleInputChange = (field, value) => {
  //   setEditData(prev => ({
  //     ...prev,
  //     [field]: value
  //   }));
  // };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getResultBadgeClass = (result) => {
    switch (result?.toLowerCase()) {
      case 'selected': 
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'rejected': 
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'pending': 
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'withdrawn': 
        return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      default: 
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const renderExperienceCard = (experience) => (
    <div key={experience._id} className="bg-card rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-border overflow-hidden group">
      <Link to={`/experiences/${experience._id}`} className="block">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <CompanyLogo
                  companyName={experience.companyInfo.companyName}
                  companyLogo={experience.companyInfo.companyLogo}
                  size={window.innerWidth < 640 ? 40 : 48}
                  className="p-1"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base sm:text-lg text-foreground truncate">{experience.companyInfo.companyName}</h3>
                <p className="text-muted-foreground text-sm sm:text-base truncate">{experience.companyInfo.role}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{experience.companyInfo.department}</p>
              </div>
            </div>
            <div className="text-right space-y-1 sm:space-y-2 flex-shrink-0">
              <span className={`inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium border ${getResultBadgeClass(experience.finalResult)}`}>
                {experience.finalResult}
              </span>
              <p className="text-xs text-muted-foreground">{formatDate(experience.createdAt)}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2 sm:gap-4 mb-3 sm:mb-4">
            <div className="text-center">
              <div className="font-bold text-sm sm:text-lg text-blue-600 dark:text-blue-400">{experience.rounds.length}</div>
              <div className="text-xs text-muted-foreground">Rounds</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-sm sm:text-lg text-yellow-600 dark:text-yellow-400">{experience.overallRating}/5</div>
              <div className="text-xs text-muted-foreground">Rating</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-sm sm:text-lg text-green-600 dark:text-green-400">{experience.views || 0}</div>
              <div className="text-xs text-muted-foreground">Views</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-sm sm:text-lg text-purple-600 dark:text-purple-400">{experience.upvotes?.length || 0}</div>
              <div className="text-xs text-muted-foreground">Upvotes</div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-2 sm:p-3 mb-3 sm:mb-4">
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {experience.keyTips?.substring(0, 150)}
              {experience.keyTips?.length > 150 ? '...' : ''}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium rounded-lg transition-colors duration-200">
              <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              View Details
            </div>
            <div className="flex flex-wrap gap-1 sm:gap-2">
              <span className="inline-flex items-center px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                {experience.companyInfo.internshipType}
              </span>
              <span className="inline-flex items-center px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                {experience.companyInfo.location}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );

  const renderStatsCard = () => (
    <div className="bg-card rounded-xl shadow-lg border border-border p-4 sm:p-6">
      <h3 className="font-semibold text-base sm:text-lg flex items-center space-x-2 mb-4 sm:mb-6">
        <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
        <span>Your Statistics</span>
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10">
          <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.experiencesShared || 0}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Experiences Shared</div>
        </div>
        <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10">
          <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">{stats.totalUpvotes || 0}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Total Upvotes</div>
        </div>
        <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/10">
          <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalViews || 0}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Total Views</div>
        </div>
        <div className="text-center p-3 sm:p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/10">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.helpfulnessScore || 0}</div>
          <div className="text-xs sm:text-sm text-muted-foreground">Helpfulness Score</div>
        </div>
      </div>
      
      {stats.topCompanies && stats.topCompanies.length > 0 && (
        <div>
          <h4 className="font-medium mb-2 sm:mb-3 text-sm">Companies You've Interviewed With</h4>
          <div className="space-y-2">
            {stats.topCompanies.map((company, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 rounded-lg bg-muted/50">
                <span className="font-medium text-xs sm:text-sm truncate">{company.name}</span>
                <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md flex-shrink-0 ml-2">
                  {company.count} exp{company.count > 1 ? 's' : ''}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const getAchievementIcon = (type) => {
    switch (type) {
      case 'first': return Target;
      case 'storyteller': return FileText;
      case 'helpful': return ThumbsUp;
      case 'popular': return Star;
      case 'expert': return Crown;
      case 'master': return Trophy;
      case 'favorite': return Diamond;
      default: return Medal;
    }
  };

  const achievements = [
    {
      id: 'first',
      title: 'First Share',
      description: 'Shared your first interview experience',
      unlocked: (stats.totalExperiences || stats.experiencesShared || 0) >= 1,
      progress: Math.min(((stats.totalExperiences || stats.experiencesShared || 0) / 1) * 100, 100),
      icon: '🎯'
    },
    {
      id: 'storyteller',
      title: 'Storyteller',
      description: 'Shared 5 interview experiences',
      unlocked: (stats.totalExperiences || stats.experiencesShared || 0) >= 5,
      progress: Math.min(((stats.totalExperiences || stats.experiencesShared || 0) / 5) * 100, 100),
      icon: '📚'
    },
    {
      id: 'helpful',
      title: 'Helpful Contributor',
      description: 'Received 10 upvotes',
      unlocked: (stats.totalUpvotes || 0) >= 10,
      progress: Math.min(((stats.totalUpvotes || 0) / 10) * 100, 100),
      icon: '👍'
    },
    {
      id: 'popular',
      title: 'Popular Content',
      description: 'Your experiences have 100+ views',
      unlocked: (stats.totalViews || 0) >= 100,
      progress: Math.min(((stats.totalViews || 0) / 100) * 100, 100),
      icon: '🌟'
    },
    {
      id: 'expert',
      title: 'Expert Mentor',
      description: 'High helpfulness score (80+)',
      unlocked: (stats.helpfulnessScore || 0) >= 80,
      progress: Math.min(((stats.helpfulnessScore || 0) / 80) * 100, 100),
      icon: '🏆'
    },
    {
      id: 'master',
      title: 'Experience Master',
      description: 'Share 10 interview experiences',
      unlocked: (stats.totalExperiences || stats.experiencesShared || 0) >= 10,
      progress: Math.min(((stats.totalExperiences || stats.experiencesShared || 0) / 10) * 100, 100),
      icon: '🎖️'
    }
  ];

  // console.log(user)

  const renderBackgroundInfo = () => (
    <div className="space-y-6">
      {user?.backgroundData ? (
        <div className="grid gap-6">
          {/* Academic Information */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-4 flex items-center space-x-2">
              <GraduationCap className="w-5 h-5" />
              <span>Academic Background</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {user.backgroundData.yearOfStudy || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">Year of Study</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {user.backgroundData.cgpa || 'N/A'}
                </div>
                <div className="text-sm text-muted-foreground">CGPA/GPA</div>
              </div>
              <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {user.backgroundData.previousInternships || 0}
                </div>
                <div className="text-sm text-muted-foreground">Previous Internships</div>
              </div>
            </div>
            
            {/* Branch and Department Information */}
            {(user.backgroundData.branch || user.backgroundData.department) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {user.backgroundData.branch && (
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">
                      {user.backgroundData.branch}
                    </div>
                    <div className="text-sm text-muted-foreground">Branch/Stream</div>
                  </div>
                )}
                {user.backgroundData.department && (
                  <div className="text-center p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                    <div className="text-lg font-semibold text-orange-600 dark:text-orange-400">
                      {user.backgroundData.department}
                    </div>
                    <div className="text-sm text-muted-foreground">Department</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Skills */}
          {user.backgroundData.skills && user.backgroundData.skills.length > 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 border border-green-200 dark:border-green-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300 mb-4 flex items-center space-x-2">
                <Star className="w-5 h-5" />
                <span>Skills & Technologies</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {user.backgroundData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-sm rounded-full font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {user.backgroundData.relevantProjects && user.backgroundData.relevantProjects.length > 0 && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/10 border border-purple-200 dark:border-purple-800 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-4 flex items-center space-x-2">
                <Building className="w-5 h-5" />
                <span>Relevant Projects</span>
              </h3>
              <div className="space-y-3">
                {user.backgroundData.relevantProjects.map((project, index) => (
                  <div
                    key={index}
                    className="p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg border border-purple-200 dark:border-purple-800"
                  >
                    <p className="text-foreground">{project}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Update Link */}
          <div className="text-center">
            <Link
              to="/settings"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4 mr-2" />
              Update Background Info
            </Link>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <GraduationCap className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-xl font-semibold mb-3">No background information yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Add your academic background, skills, and projects to help others understand your profile better.
          </p>
          <Link
            to="/settings"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Background Info
          </Link>
        </div>
      )}
    </div>
  );

  const renderAchievements = () => (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <h3 className="font-semibold text-lg flex items-center space-x-2 mb-6">
        <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <span>Achievements</span>
      </h3>
      <div className="space-y-4">
        {achievements.map((achievement) => (
          <div key={achievement.id} className={`p-4 rounded-lg border transition-all duration-300 ${
            achievement.unlocked 
              ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 border-green-200 dark:border-green-800' 
              : 'bg-muted/50 border-border'
          }`}>
            <div className="flex items-start space-x-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                achievement.unlocked 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                  : 'bg-muted'
              }`}>
                {achievement.unlocked ? achievement.icon : '🔒'}
              </div>
              <div className="flex-1">
                <h4 className={`font-medium text-sm ${achievement.unlocked ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}`}>
                  {achievement.title}
                </h4>
                <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                {!achievement.unlocked && (
                  <div className="space-y-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${achievement.progress}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground">{Math.round(achievement.progress)}% complete</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading your profile...</h3>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we fetch your data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Unable to load profile</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
            <button 
              onClick={fetchProfileData} 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      {showAnnouncement && announcement && (
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10 border-b border-blue-200 dark:border-blue-800">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <strong className="text-blue-700 dark:text-blue-300 text-sm sm:text-base block truncate">{announcement.title}</strong>
                  <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 line-clamp-1">{announcement.message}</p>
                </div>
              </div>
              <button 
                className="p-1 sm:p-2 hover:bg-blue-100 dark:hover:bg-blue-950/30 rounded-lg transition-colors text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2" 
                onClick={dismissAnnouncement}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8 relative overflow-hidden">
          <div className="absolute inset-0"></div>
          <div className="relative flex flex-col md:flex-row items-center md:items-start space-y-4 sm:space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar 
                user={user}
                size={window.innerWidth < 640 ? 96 : 128}
                className="ring-4 ring-blue-100 dark:ring-blue-900/30 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-2 shadow-lg">
                <User className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            </div>

            

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
                {extractUserName(user.name) || user.name}
              </h1>
              
              {user?.preferences?.privacy?.showEmail && (
                <p className="text-muted-foreground mb-2 text-sm sm:text-base">{user.email}</p>
              )}
              
              {user?.preferences?.privacy?.showUniversity !== false && user?.university && (
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <Building className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm sm:text-base">{user.university}</span>
                </div>
              )}
              
              {user?.graduationYear && (
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-3 sm:mb-4">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground" />
                  <span className="text-muted-foreground text-sm sm:text-base">Class of {user.graduationYear}</span>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-1 sm:gap-2 mb-4 sm:mb-6">
                {stats.totalExperiences >= 5 && (
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-xs sm:text-sm rounded-full border border-purple-200 dark:border-purple-800">
                    <FileText className="w-3 h-3 mr-1" />
                    <span className="hidden sm:inline">Storyteller</span>
                    <span className="sm:hidden">Story</span>
                  </span>
                )}
                {stats.totalUpvotes >= 10 && (
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 text-xs sm:text-sm rounded-full border border-green-200 dark:border-green-800">
                    <ThumbsUp className="w-3 h-3 mr-1" />
                    Helpful
                  </span>
                )}
                {stats.helpfulnessScore >= 80 && (
                  <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-300 text-xs sm:text-sm rounded-full border border-yellow-200 dark:border-yellow-800">
                    <Crown className="w-3 h-3 mr-1" />
                    Expert
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row md:flex-col space-y-2 sm:space-y-0 sm:space-x-3 md:space-x-0 md:space-y-3 w-full sm:w-auto">
              <Link 
                to="/create"
                className="hidden sm:inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base justify-center"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                <span className="hidden sm:flex">Share Experience</span>
              </Link>
              <Link 
                to="/settings"
                className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-border hover:bg-secondary text-foreground font-medium rounded-xl transition-colors text-sm sm:text-base justify-center"
              >
                <Settings className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                Settings
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">{/* Sidebar */}
          <div className="space-y-4 sm:space-y-6 order-2 lg:order-1">
            {renderStatsCard()}
            {renderAchievements()}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 order-1 lg:order-2">
            <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
              <div className="border-b border-border">
                <div className="flex overflow-x-auto">
                  <button 
                    className={`flex-1 min-w-0 px-3 sm:px-6 py-3 sm:py-4 text-center font-medium transition-colors text-sm sm:text-base ${
                      activeTab === 'experiences' 
                        ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveTab('experiences')}
                  >
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">My Experiences ({userExperiences.length})</span>
                      <span className="sm:hidden">Mine ({userExperiences.length})</span>
                    </div>
                  </button>
                  <button 
                    className={`flex-1 min-w-0 px-3 sm:px-6 py-3 sm:py-4 text-center font-medium transition-colors text-sm sm:text-base ${
                      activeTab === 'bookmarks' 
                        ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveTab('bookmarks')}
                  >
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      <Bookmark className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Bookmarks ({bookmarkedExperiences.length})</span>
                      <span className="sm:hidden">Saved ({bookmarkedExperiences.length})</span>
                    </div>
                  </button>
                  <button 
                    className={`flex-1 min-w-0 px-3 sm:px-6 py-3 sm:py-4 text-center font-medium transition-colors text-sm sm:text-base ${
                      activeTab === 'background' 
                        ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400' 
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveTab('background')}
                  >
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                      <GraduationCap className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Background</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="p-3 sm:p-6">
                {activeTab === 'experiences' && (
                  <div>
                    {userExperiences.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                          <FileText className="w-8 h-8 sm:w-12 sm:h-12 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">No experiences shared yet</h3>
                        <p className="text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                          Share your interview experiences to help others in their journey!
                        </p>
                        <Link 
                          to="/create"
                          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-105 text-sm sm:text-base"
                        >
                          <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Share Your First Experience
                        </Link>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:gap-6">
                        {userExperiences.map(renderExperienceCard)}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'bookmarks' && (
                  <div>
                    {bookmarkedExperiences.length === 0 ? (
                      <div className="text-center py-8 sm:py-12">
                        <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
                          <Bookmark className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">No bookmarks yet</h3>
                        <p className="text-muted-foreground mb-4 sm:mb-6 max-w-md mx-auto text-sm sm:text-base">
                          Bookmark interesting experiences to save them for later!
                        </p>
                        <Link 
                          to="/experiences"
                          className="inline-flex items-center px-4 sm:px-6 py-2 sm:py-3 border border-border hover:bg-secondary text-foreground font-medium rounded-xl transition-colors text-sm sm:text-base"
                        >
                          <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                          Browse Experiences
                        </Link>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:gap-6">
                        {bookmarkedExperiences.map(renderExperienceCard)}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'background' && renderBackgroundInfo()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
