import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createApiUrl } from '../config/api';
import axios from 'axios';
import Avatar from '../components/Avatar.jsx';
import { extractUserName } from '../utils/avatar';
import CompanyLogo from '../components/CompanyLogo.jsx';
import MarkdownViewer from '../components/MarkdownViewer.jsx';
import { useIsMobile } from '../utils/deviceDetection';
import { 
  Star, 
  MapPin, 
  Calendar, 
  Users, 
  ThumbsUp, 
  ThumbsDown, 
  Bookmark, 
  Share2, 
  X, 
  Clock, 
  Code, 
  Brain, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  Building, 
  Target, 
  MessageCircle, 
  BookOpen, 
  AlertCircle, 
  Zap, 
  IndianRupee,
  BookmarkPlus,
  TrendingUp,
  Edit3,
  Flag,
  ExternalLink,
  Timer,
  FileText,
  Tag,
  Download
} from 'lucide-react';

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // Report modal state
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState({
    reason: '',
    details: ''
  });
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState('');
  const [reportError, setReportError] = useState('');

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  const fetchExperience = useCallback(async () => {
    try {
      const response = await axios.get(createApiUrl(`/api/experiences/${id}`), {
        withCredentials: true
      });
      setExperience(response.data.data);
      setLoading(false);
    } catch (error) {
      setError('Failed to load experience');
      setLoading(false);
    }
  }, [id]);

  const checkBookmarkStatus = useCallback(async () => {
    try {
      const response = await axios.get(createApiUrl(`/api/experiences/${id}/bookmark`), {
        withCredentials: true
      });
      setIsBookmarked(response.data.isBookmarked);
    } catch (error) {
      // console.error('Error checking bookmark status:', error);
    }
  }, [id]);

  useEffect(() => {
    fetchExperience();
    if (user) {
      checkBookmarkStatus();
    }
  }, [id, user, checkBookmarkStatus, fetchExperience]);

  const handleVote = async (voteType) => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(createApiUrl(`/api/experiences/${id}/vote`), {
        voteType
      }, {
        withCredentials: true
      });
      
      setUserVote(userVote === voteType ? null : voteType);
      fetchExperience(); // Refresh to get updated vote counts
    } catch (error) {
      // console.error('Error voting:', error);
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      await axios.post(createApiUrl(`/api/experiences/${id}/bookmark`), {}, {
        withCredentials: true
      });
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error('Error bookmarking:', error);
    }
  };

  const handleDownload = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setIsDownloading(true);
    try {
      const response = await axios.get(createApiUrl(`/api/experiences/${id}/download`), {
        withCredentials: true,
        responseType: 'blob'
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Get filename from response headers or create default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `Experience_${experience.companyInfo?.companyName || 'Unknown'}_${experience.companyInfo?.role || 'Role'}.pdf`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch) {
          filename = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      // You could add a toast notification here
    } finally {
      setIsDownloading(false);
    }
  };

  const getDifficultyConfig = (difficulty) => {
    switch (difficulty) {
      case 'Easy': 
        return { 
          class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
          // icon: '🟢'
        };
      case 'Medium': 
        return { 
          class: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
          // icon: '🟡'
        };
      case 'Hard': 
        return { 
          class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
          // icon: '🔴'
        };
      default: 
        return { 
          class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
          // icon: '⚪'
        };
    }
  };

  const getOutcomeConfig = (outcome) => {
    switch (outcome) {
      case 'Selected': 
        return { 
          class: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800',
          icon: CheckCircle2,
          text: 'Selected'
        };
      case 'Rejected': 
        return { 
          class: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800',
          icon: XCircle,
          text: 'Rejected'
        };
      case 'Pending': 
        return { 
          class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: Clock,
          text: 'Pending'
        };
      case 'Waitlisted': 
        return { 
          class: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: Clock,
          text: 'Waitlisted'
        };
      default: 
        return { 
          class: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
          icon: Clock,
          text: outcome
        };
    }
  };

  const getRoundTypeIcon = (roundType) => {
    switch (roundType) {
      case 'Online Assessment': return Code;
      case 'Technical': return Zap;
      case 'HR': return Users;
      case 'Group Discussion': return MessageCircle;
      case 'Presentation': return BookOpen;
      case 'Case Study': return Target;
      case 'Coding Round': return Code;
      case 'System Design': return Building;
      default: return AlertCircle;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-muted-foreground">Loading experience...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="w-16 h-16 text-red-500 mx-auto" />
          <h2 className="text-2xl font-bold text-foreground">Error</h2>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => navigate('/experiences')}
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition-colors"
          >
            Back to Experiences
          </button>
        </div>
      </div>
    );
  }

  // Check if current user is the author of the experience
  const isCurrentUser = user && experience && experience.userId && experience.userId._id === user.id;

  // Helper function for closing the report modal and resetting state
  function closeReportModal() {
    setIsReportModalOpen(false);
    setReportReason({
      reason: '',
      details: ''
    });
    setReportSuccess('');
    setReportError('');
  }

  // Show popup if owner is viewing and experience is flagged
  const showFlaggedOwnerPopup = experience.flagged && user && experience.userId && (experience.userId._id === user.id);

  return (
    <div className="min-h-screen bg-background">
      {/* Flagged Owner Popup */}
      {showFlaggedOwnerPopup && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-card border border-border rounded-2xl shadow-lg p-8 max-w-md mx-4 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Flag className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Experience Flagged</h2>
            <p className="text-muted-foreground mb-4">
              Your experience has been flagged for review.<br/>
              Please contact the system administrator for more information.
            </p>
            {experience.flagReason && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <strong className="text-red-700 dark:text-red-300">Reason:</strong> 
                <span className="text-red-600 dark:text-red-400 ml-2">
                  {Array.isArray(experience.flagReason) ? experience.flagReason.join(', ') : experience.flagReason}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => navigate("/experiences")}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-xl transition-colors font-medium"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  const subject = encodeURIComponent('Flagged Experience Assistance Needed');
                  const body = encodeURIComponent(`Hello,\n\nMy interview experience (ID: ${experience._id}, Company: ${experience.companyInfo.companyName}) has been flagged.\n\nFlag Reason: ${Array.isArray(experience.flagReason) ? experience.flagReason.join(', ') : experience.flagReason || 'N/A'}\n\nI would like to understand the reason and resolve any issues. Please assist.\n\nThank you.`);
                  window.location.href = `/about?prefill_subject=${subject}&prefill_body=${body}`;
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors font-medium"
              >
                Contact System Administrator
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            
            {/* Header Card */}
            <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row items-start justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
                  <div className="flex items-center space-x-3 sm:space-x-4 w-full sm:w-auto">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                      <CompanyLogo
                        companyName={experience.companyInfo?.companyName || 'Unknown Company'}
                        companyLogo={experience.companyInfo?.companyLogo}
                        size={isMobile ? 48 : 64}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h1 className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 truncate">
                        {experience.companyInfo.companyName}
                      </h1>
                      <p className="text-base sm:text-lg font-semibold text-foreground truncate">
                        {experience.companyInfo.role}
                      </p>
                      <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-2 mt-1">
                        {experience.companyInfo.department && (
                          <>
                            <span className="text-xs sm:text-sm text-muted-foreground truncate">
                              {experience.companyInfo.department}
                            </span>
                            <span className="w-1 h-1 bg-muted-foreground rounded-full hidden sm:block"></span>
                          </>
                        )}
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">
                          {experience.companyInfo.internshipType}
                        </span>
                        <span className="w-1 h-1 bg-muted-foreground rounded-full hidden sm:block"></span>
                        <span className="text-xs sm:text-sm text-muted-foreground truncate">
                          {experience.companyInfo.location}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full sm:w-auto mt-3 sm:mt-0">
                    <span className="text-xs sm:text-sm text-muted-foreground sm:hidden">
                      {new Date(experience.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                        {new Date(experience.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                      {/* {!isMobile && isCurrentUser && (
                        <Link
                          to={`/experiences/${experience._id}/edit`}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Edit
                        </Link>
                      )} */}
                      <button 
                        onClick={() => navigate('/experiences')}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="text-center p-3 sm:p-0 bg-secondary/30 sm:bg-transparent rounded-lg">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="font-bold text-base sm:text-lg">{experience.overallRating}</span>
                      <span className="text-xs sm:text-sm text-muted-foreground">/5</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Overall Rating</div>
                  </div>
                  
                  <div className="text-center p-3 sm:p-0 bg-secondary/30 sm:bg-transparent rounded-lg">
                    <div className="font-bold text-base sm:text-lg">{experience.preparationTime}</div>
                    <div className="text-xs text-muted-foreground">Preparation (weeks)</div>
                  </div>
                  
                  <div className="text-center p-3 sm:p-0 bg-secondary/30 sm:bg-transparent rounded-lg">
                    <div className="font-bold text-base sm:text-lg">{experience.rounds?.length || 0}</div>
                    <div className="text-xs text-muted-foreground">Rounds</div>
                  </div>
                  
                  <div className="text-center p-3 sm:p-0 bg-secondary/30 sm:bg-transparent rounded-lg flex justify-center">
                    {(() => {
                      const config = getOutcomeConfig(experience.finalResult);
                      return (
                        <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-medium border ${config.class}`}>
                          <config.icon className="w-3 h-3 mr-1" />
                          <span className="truncate">{config.text}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 border-t border-border space-y-3 sm:space-y-0">
                  <div className="flex items-center justify-center sm:justify-start space-x-2 sm:space-x-4">
                    <button 
                      onClick={() => handleVote('upvote')}
                      className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm ${
                        userVote === 'upvote' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{experience.upvoteCount}</span>
                    </button>
                    <button 
                      onClick={() => handleVote('downvote')}
                      className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm ${
                        userVote === 'downvote' 
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' 
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>{experience.downvoteCount}</span>
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-center sm:justify-end space-x-2 sm:space-x-3">
                    {user && experience.userId._id === user.id && !isMobile && (
                      <button
                        onClick={() => navigate(`/experiences/${id}/edit`)}
                        className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                      >
                        <Edit3 className="w-4 h-4" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>
                    )}
                    
                    <button 
                      onClick={handleDownload}
                      disabled={isDownloading}
                      className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      title="Download as PDF"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                      <span className="sm:hidden">{isDownloading ? '...' : 'PDF'}</span>
                    </button>
                    
                    <button 
                      onClick={handleBookmark}
                      className={`flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 rounded-lg transition-all text-sm ${
                        isBookmarked 
                          ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' 
                          : 'hover:bg-secondary'
                      }`}
                    >
                      <Bookmark className="w-4 h-4" />
                      <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
                    </button>
                    
                    {user && experience.userId._id !== user.id && (
                      !experience.reports?.some(report => report.reportedBy === user.id) ? (
                        <button 
                          onClick={() => setIsReportModalOpen(true)}
                          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg transition-colors text-sm"
                          title="Report this experience"
                        >
                          <Flag className="w-4 h-4" />
                          <span className="hidden sm:inline">Report</span>
                        </button>
                      ) : (
                        <button
                          disabled
                          className="flex items-center space-x-1 sm:space-x-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 rounded-lg opacity-60 cursor-not-allowed text-sm"
                          title="You've already reported this experience"
                        >
                          <Flag className="w-4 h-4" />
                          <span className="hidden sm:inline">Reported</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
            {/* Report Modal */}
            {isReportModalOpen && (
              <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                <div className="bg-card border border-border rounded-2xl shadow-lg p-6 max-w-md mx-4 w-full">
                  <h2 className="text-xl font-bold mb-4">Report Experience</h2>
                  <p className="text-muted-foreground mb-4">Please let us know why you are reporting this experience:</p>
                  
                  <select
                    value={reportReason.reason || ''}
                    onChange={e => setReportReason({ ...reportReason, reason: e.target.value })}
                    className="w-full mb-4 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a reason</option>
                    <option value="spam">Spam or advertising</option>
                    <option value="inappropriate_content">Inappropriate content</option>
                    <option value="fake_information">Fake information</option>
                    <option value="offensive_language">Offensive language</option>
                    <option value="other">Other</option>
                  </select>
                  
                  {reportReason.reason === 'other' && (
                    <textarea
                      placeholder="Please describe the issue..."
                      value={reportReason.details || ''}
                      onChange={e => setReportReason({ ...reportReason, details: e.target.value })}
                      className="w-full mb-4 px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20 resize-none"
                    />
                  )}
                  
                  {reportError && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 text-sm">
                      {reportError}
                    </div>
                  )}
                  
                  {reportSuccess && (
                    <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-700 dark:text-green-300 text-sm">
                      {reportSuccess}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (!reportReason.reason || (reportReason.reason === 'other' && !reportReason.details.trim())) {
                          setReportError('Please select or enter a reason.');
                          return;
                        }
                        setReportLoading(true);
                        setReportError('');
                        setReportSuccess('');
                        try {
                          const reasonToSend = reportReason.reason === 'other' ? reportReason.details : reportReason.reason;
                          await axios.post(createApiUrl(`/api/experiences/${id}/report`), { reason: reasonToSend }, { withCredentials: true });
                          setReportSuccess('Report submitted. Thank you!');
                          setTimeout(() => {
                            closeReportModal();
                          }, 1200);
                        } catch (err) {
                          setReportError('Failed to submit report. Please try again.');
                        } finally {
                          setReportLoading(false);
                        }
                      }}
                      disabled={reportLoading}
                      className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      {reportLoading ? 'Reporting...' : 'Submit'}
                    </button>
                    <button
                      onClick={closeReportModal}
                      disabled={reportLoading}
                      className="flex-1 border border-border hover:bg-secondary text-foreground px-4 py-2 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Interview Rounds */}
            <div className="space-y-4 sm:space-y-6">
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-bold">Interview Rounds</h2>
              </div>
              
              {experience.rounds?.map((round, index) => {
                const RoundIcon = getRoundTypeIcon(round.roundType);
                const roundConfig = getOutcomeConfig(round.roundResult);
                
                return (
                  <div key={index} className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-3 sm:space-y-0">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-secondary/50">
                            <RoundIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-semibold text-base sm:text-lg truncate">Round {round.roundNumber}: {round.roundType}</h3>
                            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{round.duration} minutes</span>
                              </div>
                              {round.platform && (
                                <div className="flex items-center space-x-1">
                                  <Building className="w-3 h-3" />
                                  <span className="truncate">{round.platform}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className={`inline-flex items-center px-2 sm:px-3 py-1 rounded-lg text-xs font-medium border ${roundConfig.class} flex-shrink-0 mt-2 sm:mt-0`}>
                          <roundConfig.icon className="w-3 h-3 mr-1" />
                          <span className="truncate">{roundConfig.text}</span>
                        </div>
                      </div>

                      {/* Technical Questions */}
                      {round.technicalQuestions && round.technicalQuestions.length > 0 && (
                        <div className="mt-4 sm:mt-6 space-y-3 sm:space-y-4">
                          <h4 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center space-x-2">
                            <Code className="w-4 h-4 text-blue-600" />
                            <span>Technical Questions</span>
                          </h4>
                          <div className="space-y-3 sm:space-y-4">
                            {round.technicalQuestions.map((q, qIndex) => {
                              const difficultyConfig = getDifficultyConfig(q.difficulty);
                              return (
                                <div key={qIndex} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-800 space-y-3">
                                  <div className="flex flex-col sm:flex-row sm:items-start justify-between space-y-2 sm:space-y-0">
                                    <p className="font-medium text-foreground text-sm sm:text-base flex-1 sm:pr-4">{q.question}</p>
                                    <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${difficultyConfig.class} flex-shrink-0 self-start`}>
                                      <span className="mr-1">{difficultyConfig.icon}</span>
                                      {q.difficulty}
                                    </div>
                                  </div>
                                  
                                  {/* Additional question details */}
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                    {q.timeGiven && (
                                      <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
                                        <Timer className="w-4 h-4" />
                                        <span>Time Given: {q.timeGiven} minutes</span>
                                      </div>
                                    )}
                                    {q.leetcodeLink && (
                                      <div className="flex items-center space-x-2">
                                        <a 
                                          href={q.leetcodeLink} 
                                          target="_blank" 
                                          rel="noopener noreferrer"
                                          className="inline-flex items-center space-x-1 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200 truncate"
                                        >
                                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                                          <span>LeetCode Link</span>
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {q.topics && q.topics.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                      {q.topics.map((topic, tIndex) => (
                                        <span key={tIndex} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                                          {topic}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {q.solution && (
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                      <p className="font-semibold text-green-800 dark:text-green-300 text-sm mb-2">Solution Approach:</p>
                                      <MarkdownViewer content={q.solution} className="text-green-700 dark:text-green-400 text-sm" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Behavioral Questions */}
                      {round.behavioralQuestions && round.behavioralQuestions.length > 0 && (
                        <div className="mt-6 space-y-4">
                          <h4 className="font-semibold text-base mb-4 flex items-center space-x-2">
                            <Brain className="w-4 h-4 text-green-600" />
                            <span>Behavioral Questions</span>
                          </h4>
                          <div className="space-y-4">
                            {round.behavioralQuestions.map((q, qIndex) => (
                              <div key={qIndex} className="bg-gray-50 dark:bg-gray-900/30 rounded-lg p-4 border border-gray-200 dark:border-gray-800 space-y-3">
                                <div className="flex items-start justify-between">
                                  <p className="font-medium text-foreground flex-1 pr-4">{q.question}</p>
                                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 flex-shrink-0">
                                    {q.category}
                                  </span>
                                </div>
                                {q.yourAnswer && (
                                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                                    <p className="font-semibold text-blue-800 dark:text-blue-300 text-sm mb-2">Sample Answer:</p>
                                    <MarkdownViewer content={q.yourAnswer} className="text-blue-700 dark:text-blue-400 text-sm" />
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* MCQ Section */}
                      {round.mcqSection && (round.mcqSection.totalQuestions || round.mcqSection.timeLimit || round.mcqSection.topics?.length > 0) && (
                        <div className="mt-6 space-y-4">
                          <h4 className="font-semibold text-base mb-4 flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-purple-600" />
                            <span>MCQ/Assessment Section</span>
                          </h4>
                          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                              {round.mcqSection.totalQuestions && (
                                <div className="text-center">
                                  <div className="font-bold text-lg text-purple-800 dark:text-purple-300">{round.mcqSection.totalQuestions}</div>
                                  <div className="text-xs text-purple-600 dark:text-purple-400">Total Questions</div>
                                </div>
                              )}
                              {round.mcqSection.timeLimit && (
                                <div className="text-center">
                                  <div className="font-bold text-lg text-purple-800 dark:text-purple-300">{round.mcqSection.timeLimit} min</div>
                                  <div className="text-xs text-purple-600 dark:text-purple-400">Time Limit</div>
                                </div>
                              )}
                              {round.mcqSection.difficulty && (
                                <div className="text-center">
                                  <div className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyConfig(round.mcqSection.difficulty).class}`}>
                                    {round.mcqSection.difficulty}
                                  </div>
                                  <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">Difficulty</div>
                                </div>
                              )}
                              {round.mcqSection.cutoff && (
                                <div className="text-center">
                                  <div className="font-bold text-lg text-purple-800 dark:text-purple-300">{round.mcqSection.cutoff}%</div>
                                  <div className="text-xs text-purple-600 dark:text-purple-400">Cutoff</div>
                                </div>
                              )}
                            </div>
                            {round.mcqSection.topics && round.mcqSection.topics.length > 0 && (
                              <div>
                                <p className="font-semibold text-purple-800 dark:text-purple-300 text-sm mb-2">Topics Covered:</p>
                                <div className="flex flex-wrap gap-2">
                                  {round.mcqSection.topics.map((topic, tIndex) => (
                                    <span key={tIndex} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Tips & Experience */}
                      {round.tips && (
                        <div className="mt-4 sm:mt-6 bg-gradient-to-br from-blue-50/50 to-cyan-50/30 dark:from-blue-950/20 dark:to-cyan-950/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                          <h4 className="font-semibold text-sm sm:text-base mb-2 sm:mb-3 flex items-center space-x-2">
                            <Lightbulb className="w-4 h-4 text-orange-600" />
                            <span>Tips & Experience</span>
                          </h4>
                          <MarkdownViewer content={round.tips} className="text-xs sm:text-sm text-muted-foreground leading-relaxed" />
                        </div>
                      )}

                      {/* Feedback */}
                      {round.feedback && (
                        <div className="mt-4 sm:mt-6 border-l-4 border-blue-400 bg-blue-50 dark:bg-blue-950/30 pl-3 sm:pl-4 py-2 sm:py-3 rounded-r-lg">
                          <h4 className="font-semibold text-xs sm:text-sm mb-2">Feedback Received:</h4>
                          <MarkdownViewer content={round.feedback} className="text-xs sm:text-sm text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              }) || (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No interview rounds available.</p>
                </div>
              )}
            </div>

            {/* Overall Experience */}
            {experience.overallExperience && (
              <div className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">Overall Experience</h2>
                  <MarkdownViewer content={experience.overallExperience} className="text-sm sm:text-base text-foreground leading-relaxed" />
                </div>
              </div>
            )}

            {/* Tags */}
            {experience.tags && experience.tags.length > 0 && (
              <div className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4 flex items-center space-x-2">
                    <Tag className="w-4 h-4 text-blue-600" />
                    <span>Tags</span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {experience.tags.map((tag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            
            {/* Author Info */}
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6">
                <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Shared by</h3>
                {experience.isAnonymous ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                      <Users className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-sm sm:text-base text-foreground">Anonymous</p>
                      <p className="text-xs sm:text-sm text-muted-foreground truncate">PSG College of Technology</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      user={experience.userId}
                      size={isMobile ? 40 : 48}
                      className="ring-2 ring-blue-100 dark:ring-blue-900/30 flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <Link 
                        to={`/users/${experience.userId._id}`}
                        className="font-semibold text-sm sm:text-base text-foreground hover:text-blue-600 dark:hover:text-blue-400 transition-colors block truncate"
                      >
                        {extractUserName(experience.userId.name) || experience.userId.name}
                      </Link>
                      {experience.userId.university && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{experience.userId.university}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* Background */}
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6">
                <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Background</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Year of Study:</span>
                    <span className="text-xs sm:text-sm font-medium">{experience.userId.backgroundData?.yearOfStudy || 'Not specified'}</span>
                  </div>
                  {experience.userId.backgroundData?.cgpa && (
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">CGPA:</span>
                      <span className="text-xs sm:text-sm font-medium">{experience.userId.backgroundData.cgpa}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Previous Internships:</span>
                    <span className="text-xs sm:text-sm font-medium">{experience.userId.backgroundData?.previousInternships || 0}</span>
                  </div>
                  {experience.userId.backgroundData?.skills && experience.userId.backgroundData.skills.length > 0 && (
                    <div>
                      <span className="text-xs sm:text-sm text-muted-foreground block mb-2">Skills:</span>
                      <div className="flex flex-wrap gap-1">
                        {experience.userId.backgroundData.skills.slice(0, isMobile ? 4 : 6).map((skill, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            {skill}
                          </span>
                        ))}
                        {experience.userId.backgroundData.skills.length > (isMobile ? 4 : 6) && (
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                            +{experience.userId.backgroundData.skills.length - (isMobile ? 4 : 6)} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Company Details */}
            <div className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
              <div className="p-4 sm:p-6">
                <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Company Details</h3>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Duration:</span>
                    <span className="text-xs sm:text-sm font-medium truncate ml-2">{experience.companyInfo.duration}</span>
                  </div>
                  {experience.companyInfo.stipend && (
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-muted-foreground">Stipend:</span>
                      <div className="flex items-center text-xs sm:text-sm font-medium text-green-600 dark:text-green-400">
                        <IndianRupee className="w-3 h-3 mr-1" />
                        {experience.companyInfo.stipend.toLocaleString()}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-xs sm:text-sm text-muted-foreground">Location:</span>
                    <span className="text-xs sm:text-sm font-medium truncate ml-2">
                      {experience.companyInfo.city ? 
                        `${experience.companyInfo.city}` :
                        experience.companyInfo.location
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preparation & Tips */}
            {(experience.keyTips || experience.mistakesToAvoid || experience.resourcesUsed?.length > 0) && (
              <div className="bg-card border border-border rounded-xl sm:rounded-2xl shadow-lg overflow-hidden">
                <div className="p-4 sm:p-6">
                  <h3 className="font-semibold text-sm sm:text-base mb-3 sm:mb-4">Preparation & Tips</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {experience.keyTips && (
                      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-green-800 dark:text-green-300 text-xs sm:text-sm mb-2">Key Tips</h4>
                        <MarkdownViewer content={experience.keyTips} className="text-green-700 dark:text-green-400 text-xs sm:text-sm leading-relaxed" />
                      </div>
                    )}
                    {experience.mistakesToAvoid && (
                      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-red-800 dark:text-red-300 text-xs sm:text-sm mb-2">Mistakes to Avoid</h4>
                        <MarkdownViewer content={experience.mistakesToAvoid} className="text-red-700 dark:text-red-400 text-xs sm:text-sm leading-relaxed" />
                      </div>
                    )}
                    {experience.resourcesUsed && experience.resourcesUsed.length > 0 && (
                      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 sm:p-4">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-300 text-xs sm:text-sm mb-2">Resources Used</h4>
                        <ul className="text-blue-700 dark:text-blue-400 text-xs sm:text-sm space-y-1">
                          {experience.resourcesUsed.slice(0, isMobile ? 3 : experience.resourcesUsed.length).map((resource, index) => (
                            <li key={index} className="flex items-start">
                              <span className="inline-block w-1 h-1 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                              <span className="break-words">{resource}</span>
                            </li>
                          ))}
                          {isMobile && experience.resourcesUsed.length > 3 && (
                            <li className="text-blue-600 dark:text-blue-400 font-medium">
                              +{experience.resourcesUsed.length - 3} more resources
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {/* <div className="space-y-3">
              <button className="w-full flex items-center justify-center space-x-2 border border-border hover:bg-secondary rounded-xl px-4 py-3 transition-colors font-medium">
                <BookmarkPlus className="w-4 h-4" />
                <span>Save Experience</span>
              </button>
              <button className="w-full flex items-center justify-center space-x-2 border border-border hover:bg-secondary rounded-xl px-4 py-3 transition-colors font-medium">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div> */}

            {/* Engagement */}
            {/* <div className="bg-card border border-border rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <button className="flex items-center space-x-2 hover:bg-blue-50 dark:hover:bg-blue-950/30 hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-3 py-2 rounded-lg group">
                    <ThumbsUp className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>{experience.upvoteCount} Helpful</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:bg-green-50 dark:hover:bg-green-950/30 hover:text-green-600 dark:hover:text-green-400 transition-colors px-3 py-2 rounded-lg group">
                    <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span>Comments</span>
                  </button>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;
