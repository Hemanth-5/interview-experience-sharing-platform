import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Clock, 
  ThumbsUp, 
  Bookmark, 
  Share2, 
  Eye, 
  MessageCircle,
  TrendingUp,
  ChevronRight,
  Building,
  Users,
  Target,
  Zap
} from 'lucide-react';
import CompanyLogo from './CompanyLogo';
import ExperiencePreviewModal from './ExperiencePreviewModal';

const EnhancedExperienceCard = ({ experience, onBookmark, onVote, isBookmarked, userVote }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleQuickPreview = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPreview(true);
  };

  const handleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark?.(experience._id);
  };

  const handleVote = (e, voteType) => {
    e.preventDefault();
    e.stopPropagation();
    onVote?.(experience._id, voteType);
  };

  const handleShare = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${experience.companyInfo.companyName} - ${experience.companyInfo.role}`,
          text: `Check out this interview experience at ${experience.companyInfo.companyName}`,
          url: window.location.origin + `/experiences/${experience._id}`
        });
      } catch (error) {
        // Fallback to clipboard
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const url = window.location.origin + `/experiences/${experience._id}`;
    navigator.clipboard.writeText(url).then(() => {
      // You could show a toast notification here
      console.log('Link copied to clipboard');
    });
  };

  const getDifficultyColor = (rating) => {
    if (rating >= 4) return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
    if (rating >= 3) return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
    return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const posted = new Date(date);
    const diffInHours = Math.floor((now - posted) / (1000 * 60 * 60));
    
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 30) return `${diffInDays}d ago`;
    const diffInMonths = Math.floor(diffInDays / 30);
    return `${diffInMonths}mo ago`;
  };

  return (
    <>
      <div 
        className={`bg-card border border-border rounded-xl shadow-lg overflow-hidden transition-all duration-300 group cursor-pointer ${
          isHovered ? 'shadow-xl border-blue-300 dark:border-blue-600 scale-[1.02]' : 'hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-600'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Link to={`/experiences/${experience._id}`} className="block">
          {/* Header */}
          <div className="p-6 pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg flex-shrink-0 ring-2 ring-blue-100 dark:ring-blue-900/30">
                  <CompanyLogo
                    companyName={experience.companyInfo?.companyName || 'Unknown Company'}
                    companyLogo={experience.companyInfo?.companyLogo}
                    size={48}
                    className="rounded-lg"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-blue-600 dark:text-blue-400 truncate group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {experience.companyInfo.companyName}
                  </h3>
                  <p className="text-base font-semibold text-foreground truncate mb-1">
                    {experience.companyInfo.role}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <span className="truncate">{experience.companyInfo.internshipType}</span>
                    <span>•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{experience.companyInfo.location}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={handleQuickPreview}
                  className="p-2 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Quick Preview"
                >
                  <Eye className="w-4 h-4" />
                </button>
                {/* <button
                  onClick={handleBookmark}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked 
                      ? 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/30 dark:hover:bg-yellow-900/50 text-yellow-600 dark:text-yellow-400' 
                      : 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                  title={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
                >
                  <Bookmark className="w-4 h-4" />
                </button> */}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="text-center p-2 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="font-bold text-sm">{experience.overallRating}</span>
                </div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
              
              {/* <div className="text-center p-2 bg-secondary/30 rounded-lg">
                <div className="font-bold text-sm">{experience.preparationTime}</div>
                <div className="text-xs text-muted-foreground">Prep</div>
              </div> */}
              
              <div className="text-center p-2 bg-secondary/30 rounded-lg">
                <div className="font-bold text-sm">{experience.rounds?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Rounds</div>
              </div>
              
              {/* <div className="text-center p-2 bg-secondary/30 rounded-lg">
                <div className="flex items-center justify-center space-x-1">
                  <ThumbsUp className="w-3 h-3 text-green-600" />
                  <span className="font-bold text-sm">{experience.upvoteCount || 0}</span>
                </div>
                <div className="text-xs text-muted-foreground">Helpful</div>
              </div> */}
            </div>

            {/* Content Preview */}
            <div className="mb-4">
              {experience.keyTips && (
                <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  <span className="font-medium text-green-600 dark:text-green-400">💡 Tip:</span> {experience.keyTips.substring(0, 100)}...
                </div>
              )}
              
              {experience.rounds && experience.rounds.length > 0 && (
                <div className="flex items-center space-x-3 text-xs text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Target className="w-3 h-3" />
                    <span>{experience.rounds.length} rounds</span>
                  </div>
                  {experience.rounds.some(r => r.technicalQuestions?.length > 0) && (
                    <div className="flex items-center space-x-1">
                      <Zap className="w-3 h-3" />
                      <span>Technical</span>
                    </div>
                  )}
                  {experience.rounds.some(r => r.behavioralQuestions?.length > 0) && (
                    <div className="flex items-center space-x-1">
                      <Users className="w-3 h-3" />
                      <span>Behavioral</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            {experience.tags && experience.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-4">
                {experience.tags.slice(0, 3).map((tag, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                  >
                    #{tag}
                  </span>
                ))}
                {experience.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                    +{experience.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-secondary/20 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={(e) => handleVote(e, 'upvote')}
                  className={`flex items-center space-x-1 text-xs transition-colors ${
                    userVote === 'upvote' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-muted-foreground hover:text-green-600 dark:hover:text-green-400'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{experience.upvoteCount}</span>
                </button>
                
                {/* <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <MessageCircle className="w-4 h-4" />
                  <span>{experience.comments?.length || 0}</span>
                </div> */}
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <Calendar className="w-3 h-3" />
                <span>{getTimeAgo(experience.createdAt)}</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Preview Modal */}
      <ExperiencePreviewModal
        experience={experience}
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        onViewFull={(id) => {
          setShowPreview(false);
          // Navigate to full experience page
          window.location.href = `/experiences/${id}`;
        }}
      />
    </>
  );
};

export default EnhancedExperienceCard;