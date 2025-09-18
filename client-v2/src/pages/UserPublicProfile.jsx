import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import Avatar from '../components/Avatar.jsx';
import { extractUserName } from '../utils/avatar';
import { 
  User, 
  Calendar, 
  Building, 
  Eye, 
  Star, 
  TrendingUp,
  Trophy,
  Target,
  FileText,
  ThumbsUp,
  Award,
  AlertTriangle,
  Loader,
  ArrowLeft
} from 'lucide-react';

const UserPublicProfile = () => {
  const { userId } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    fetchPublicProfile();
  }, [userId]);

  const fetchPublicProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(createApiUrl(`/api/users/${userId}/public-profile`), {
        withCredentials: true
      });

      if (response.data.success) {
        setProfile(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch user profile');
    } finally {
      setLoading(false);
    }
  };

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
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center">
              {/* {console.log(experience)} */}
              {experience.companyInfo.companyLogo ? (
                <img
                  src={experience.companyInfo.companyLogo}
                  alt={experience.companyInfo.companyName}
                  className="w-10 h-10 object-contain rounded-lg bg-white"
                />
              ) : (
                <Building className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">{experience.companyInfo.companyName}</h3>
              <p className="text-muted-foreground">{experience.companyInfo.role}</p>
              {experience.companyInfo.department && (
                <p className="text-sm text-muted-foreground">{experience.companyInfo.department}</p>
              )}
            </div>
          </div>
          <div className="text-right space-y-2">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getResultBadgeClass(experience.finalResult)}`}>
              {experience.finalResult}
            </span>
            <p className="text-xs text-muted-foreground">{formatDate(experience.createdAt)}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="font-bold text-lg text-yellow-600 dark:text-yellow-400">{experience.overallRating}/5</div>
            <div className="text-xs text-muted-foreground">Rating</div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg text-green-600 dark:text-green-400">{experience.views || 0}</div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <Link 
            to={`/experiences/${experience._id}`} 
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Link>
          <div className="flex space-x-2">
            {experience.companyInfo.internshipType && (
              <span className="inline-flex items-center px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                {experience.companyInfo.internshipType}
              </span>
            )}
            {experience.companyInfo.location && (
              <span className="inline-flex items-center px-2 py-1 bg-secondary text-secondary-foreground text-xs rounded-md">
                {experience.companyInfo.location}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatsCard = () => (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <h3 className="font-semibold text-lg flex items-center space-x-2 mb-6">
        <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        <span>Statistics</span>
      </h3>
      <div className="grid grid-cols-1 gap-4">
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{profile.stats.totalExperiences || 0}</div>
          <div className="text-sm text-muted-foreground">Experiences Shared</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">{profile.stats.totalViews || 0}</div>
          <div className="text-sm text-muted-foreground">Total Views</div>
        </div>
        <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/10">
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{profile.stats.averageRating || 0}</div>
          <div className="text-sm text-muted-foreground">Average Rating</div>
        </div>
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <h3 className="font-semibold text-lg flex items-center space-x-2 mb-6">
        <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
        <span>Achievements</span>
      </h3>
      <div className="space-y-4">
        {profile.stats.totalExperiences >= 1 && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-lg">
                🎯
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-green-700 dark:text-green-300">First Share</h4>
                <p className="text-xs text-muted-foreground">Shared first interview experience</p>
              </div>
            </div>
          </div>
        )}
        {profile.stats.totalExperiences >= 5 && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-lg">
                📚
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-green-700 dark:text-green-300">Storyteller</h4>
                <p className="text-xs text-muted-foreground">Shared 5 interview experiences</p>
              </div>
            </div>
          </div>
        )}
        {profile.stats.totalViews >= 100 && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-lg">
                🌟
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-green-700 dark:text-green-300">Popular Content</h4>
                <p className="text-xs text-muted-foreground">Experiences have 100+ views</p>
              </div>
            </div>
          </div>
        )}
        {profile.stats.averageRating >= 4 && (
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 border border-green-200 dark:border-green-800">
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-lg">
                🏆
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm text-green-700 dark:text-green-300">Quality Contributor</h4>
                <p className="text-xs text-muted-foreground">High average rating (4+)</p>
              </div>
            </div>
          </div>
        )}
        {!(profile.stats.totalExperiences >= 1 || profile.stats.totalExperiences >= 5 || profile.stats.totalViews >= 100 || profile.stats.averageRating >= 4) && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground">No achievements yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderBackgroundInfo = () => {
    // console.log(profile)
    if (!profile?.backgroundData) {
      return (
        <div className="bg-card rounded-xl shadow-lg border border-border p-6">
          <h3 className="font-semibold text-lg flex items-center space-x-2 mb-6">
            <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Background</span>
          </h3>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm text-muted-foreground">No background information available</p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-card rounded-xl shadow-lg border border-border p-6">
        <h3 className="font-semibold text-lg flex items-center space-x-2 mb-6">
          <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <span>Background</span>
        </h3>
        <div className="space-y-4">
          {/* Academic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {profile.backgroundData.yearOfStudy || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">Year of Study</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {profile.backgroundData.cgpa || 'N/A'}
              </div>
              <div className="text-xs text-muted-foreground">CGPA</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/10">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {profile.backgroundData.previousInternships || 0}
              </div>
              <div className="text-xs text-muted-foreground">Internships</div>
            </div>
          </div>
          
          {/* Branch and Department Information */}
          {(profile.backgroundData.branch || profile.backgroundData.department) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {profile.backgroundData.branch && (
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/20 dark:to-blue-950/10">
                  <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {profile.backgroundData.branch}
                  </div>
                  <div className="text-xs text-muted-foreground">Branch/Stream</div>
                </div>
              )}
              {profile.backgroundData.department && (
                <div className="text-center p-4 rounded-lg bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/10">
                  <div className="text-lg font-bold text-orange-600 dark:text-orange-400">
                    {profile.backgroundData.department}
                  </div>
                  <div className="text-xs text-muted-foreground">Department</div>
                </div>
              )}
            </div>
          )}

          {/* Skills */}
          {profile.backgroundData.skills && profile.backgroundData.skills.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-sm">Skills & Technologies</h4>
              <div className="flex flex-wrap gap-2">
                {profile.backgroundData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {profile.backgroundData.relevantProjects && profile.backgroundData.relevantProjects.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-sm">Relevant Projects</h4>
              <div className="space-y-2">
                {profile.backgroundData.relevantProjects.map((project, index) => (
                  <div
                    key={index}
                    className="p-2 rounded bg-muted/50 text-sm text-foreground"
                  >
                    {project}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full border border-border">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Loading user profile...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full border border-border">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">Unable to load profile</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Link 
              to="/experiences"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Experiences
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30 flex items-center justify-center p-4">
        <div className="bg-card rounded-2xl shadow-xl p-8 max-w-md w-full border border-border">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">User not found</h2>
            <p className="text-muted-foreground mb-6">The user profile you're looking for doesn't exist.</p>
            <Link 
              to="/experiences"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Browse Experiences
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 mb-8 relative overflow-hidden">
          <div className="relative flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="relative">
              <Avatar 
                user={profile}
                size={128}
                className="ring-4 ring-blue-100 dark:ring-blue-900/30 shadow-xl"
              />
              <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full p-2 shadow-lg">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
                {extractUserName(profile.name) || profile.name}
              </h1>
              
              {profile.email && (
                <p className="text-muted-foreground mb-2">{profile.email}</p>
              )}
              
              {profile.university && (
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{profile.university}</span>
                </div>
              )}
              
              {profile.graduationYear && (
                <div className="flex items-center justify-center md:justify-start space-x-2 mb-4">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Class of {profile.graduationYear}</span>
                </div>
              )}

              {/* Badges */}
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                {profile.stats.totalExperiences >= 5 && (
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full border border-purple-200 dark:border-purple-800">
                    <FileText className="w-3 h-3 mr-1" />
                    Storyteller
                  </span>
                )}
                {profile.stats.totalViews >= 100 && (
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 text-yellow-700 dark:text-yellow-300 text-sm rounded-full border border-yellow-200 dark:border-yellow-800">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </span>
                )}
                {profile.stats.averageRating >= 4 && (
                  <span className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-green-700 dark:text-green-300 text-sm rounded-full border border-green-200 dark:border-green-800">
                    <Trophy className="w-3 h-3 mr-1" />
                    Quality
                  </span>
                )}
              </div>

              <div className="text-center md:text-left">
                <span className="text-sm text-muted-foreground">
                  Member since {formatDate(profile.joinedAt)}
                </span>
                {/* {profile.level && (
                  <span className="ml-4 text-sm text-muted-foreground">
                    Level {profile.level}
                  </span>
                )} */}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="space-y-6">
            {renderStatsCard()}
            {renderBackgroundInfo()}
            {renderBadges()}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-xl font-semibold flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <span>Recent Experiences ({profile.recentExperiences.length})</span>
                </h2>
              </div>
              
              <div className="p-6">
                {profile.recentExperiences.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-full flex items-center justify-center mx-auto mb-6">
                      <FileText className="w-12 h-12 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-3">No public experiences yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      This user hasn't shared any interview experiences publicly.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {profile.recentExperiences.map(renderExperienceCard)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPublicProfile;
