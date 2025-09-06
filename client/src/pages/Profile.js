import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import Avatar from '../components/Avatar';
import { extractUserName } from '../utils/avatar';
import './Profile.css';

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
      case 'selected': return 'result-selected';
      case 'rejected': return 'result-rejected';
      case 'pending': return 'result-pending';
      case 'withdrawn': return 'result-withdrawn';
      default: return 'result-unknown';
    }
  };

  const renderExperienceCard = (experience) => (
    <div key={experience._id} className="experience-card">
      <div className="experience-header">
        <div className="company-info">
          <h3>{experience.companyInfo.companyName}</h3>
          <p className="role">{experience.companyInfo.role}</p>
          <p className="department">{experience.companyInfo.department}</p>
        </div>
        <div className="experience-meta">
          <span className={`result-badge ${getResultBadgeClass(experience.finalResult)}`}>
            {experience.finalResult}
          </span>
          <span className="date">{formatDate(experience.createdAt)}</span>
        </div>
      </div>
      
      <div className="experience-stats">
        <div className="stat">
          <span className="stat-value">{experience.rounds.length}</span>
          <span className="stat-label">Rounds</span>
        </div>
        <div className="stat">
          <span className="stat-value">{experience.overallRating}/5</span>
          <span className="stat-label">Rating</span>
        </div>
        <div className="stat">
          <span className="stat-value">{experience.views || 0}</span>
          <span className="stat-label">Views</span>
        </div>
        <div className="stat">
          <span className="stat-value">{experience.upvotes?.length || 0}</span>
          <span className="stat-label">Upvotes</span>
        </div>
      </div>

      <div className="experience-details">
        <p className="tips-preview">
          {experience.keyTips?.substring(0, 150)}
          {experience.keyTips?.length > 150 ? '...' : ''}
        </p>
      </div>

      <div className="experience-actions">
        <Link to={`/experiences/${experience._id}`} className="view-btn">
          View Details
        </Link>
        {/* <Link to={`/experiences/${experience._id}/edit`} className="edit-btn">
          Edit
        </Link> */}
        {/* <div className="experience-tags">
          <span className="tag">{experience.companyInfo.internshipType}</span>
          <span className="tag">{experience.companyInfo.location}</span>
        </div> */}
      </div>
    </div>
  );

  const renderStatsCard = () => (
    <div className="stats-card">
      <h3>Your Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-info">
            <span className="stat-number">{stats.experiencesShared || 0}</span>
            <span className="stat-label">Experiences Shared</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-info">
            <span className="stat-number">{stats.totalUpvotes || 0}</span>
            <span className="stat-label">Total Upvotes</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-info">
            <span className="stat-number">{stats.totalViews || 0}</span>
            <span className="stat-label">Total Views</span>
          </div>
        </div>
        {/* <div className="stat-item">
          <div className="stat-info">
            <span className="stat-number">{stats.totalComments || 0}</span>
            <span className="stat-label">Comments Received</span>
          </div>
        </div> */}
        {/* <div className="stat-item">
          <div className="stat-info">
            <span className="stat-number">{stats.totalBookmarks || 0}</span>
            <span className="stat-label">Bookmarks</span>
          </div>
        </div> */}
        <div className="stat-item">
          <div className="stat-info">
            <span className="stat-number">{stats.helpfulnessScore || 0}</span>
            <span className="stat-label">Helpfulness Score</span>
          </div>
        </div>
      </div>
      
      {stats.topCompanies && stats.topCompanies.length > 0 && (
        <div className="top-companies">
          <h4>Companies You've Interviewed With</h4>
          <div className="company-list">
            {stats.topCompanies.map((company, index) => (
              <div key={index} className="company-item">
                <span className="company-name">{company.name}</span>
                <span className="company-count">{company.count} experience{company.count > 1 ? 's' : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderAchievements = () => (
    <div className="achievements-card">
      <h3>Achievements</h3>
      <div className="achievements-grid">
        {stats.totalExperiences >= 1 && (
          <div className="achievement unlocked">
            <div className="achievement-icon">🎯</div>
            <div className="achievement-info">
              <h4>First Share</h4>
              <p>Shared your first interview experience</p>
            </div>
          </div>
        )}
        {stats.totalExperiences >= 5 && (
          <div className="achievement unlocked">
            <div className="achievement-icon">📚</div>
            <div className="achievement-info">
              <h4>Storyteller</h4>
              <p>Shared 5 interview experiences</p>
            </div>
          </div>
        )}
        {stats.totalUpvotes >= 10 && (
          <div className="achievement unlocked">
            <div className="achievement-icon">👍</div>
            <div className="achievement-info">
              <h4>Helpful Contributor</h4>
              <p>Received 10 upvotes</p>
            </div>
          </div>
        )}
        {stats.totalViews >= 100 && (
          <div className="achievement unlocked">
            <div className="achievement-icon">🌟</div>
            <div className="achievement-info">
              <h4>Popular Content</h4>
              <p>Your experiences have 100+ views</p>
            </div>
          </div>
        )}
        {stats.helpfulnessScore >= 80 && (
          <div className="achievement unlocked">
            <div className="achievement-icon">🏆</div>
            <div className="achievement-info">
              <h4>Expert Mentor</h4>
              <p>High helpfulness score (80+)</p>
            </div>
          </div>
        )}
        
        {/* Locked achievements */}
        {stats.totalExperiences < 10 && (
          <div className="achievement locked">
            <div className="achievement-icon">🎖️</div>
            <div className="achievement-info">
              <h4>Experience Master</h4>
              <p>Share 10 interview experiences</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(stats.totalExperiences / 10) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
        {stats.totalUpvotes < 50 && (
          <div className="achievement locked">
            <div className="achievement-icon">💎</div>
            <div className="achievement-info">
              <h4>Community Favorite</h4>
              <p>Receive 50 upvotes</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(stats.totalUpvotes / 50) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading your profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error">
        <div className="error-icon">!</div>
        <h2>Unable to load profile</h2>
        <p>{error}</p>
        <button onClick={fetchProfileData} className="retry-btn">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="profile-page">
      {showAnnouncement && announcement && (
        <div className="announcement-banner">
          <div className="announcement-content">
            <strong>{announcement.title}</strong>
            <p>{announcement.message}</p>
            <button className="dismiss-announcement-btn" onClick={dismissAnnouncement}>Dismiss</button>
          </div>
        </div>
      )}
      <div className="profile-header">
        <div className="profile-avatar">
          <Avatar 
            user={user}
            size={128}
            className="profile-avatar-img"
          />
        </div>
        <div className="profile-info">
          <h1>{extractUserName(user.name) || user.name}</h1>
          {user?.preferences?.privacy?.showEmail && (
            <p className="profile-email">{user.email}</p>
          )}
          {user?.preferences?.privacy?.showUniversity !== false && user?.university && (
            <p className="profile-university">{user.university}</p>
          )}
          {user?.graduationYear && (
            <p className="profile-grad-year">Class of {user.graduationYear}</p>
          )}
          <div className="profile-badges">
            {stats.totalExperiences >= 5 && <span className="badge storyteller">Storyteller</span>}
            {stats.totalUpvotes >= 10 && <span className="badge helpful">Helpful</span>}
            {stats.helpfulnessScore >= 80 && <span className="badge expert">Expert</span>}
          </div>
        </div>
        <div className="profile-actions">
          <Link to="/create" className="create-btn">
            Share New Experience
          </Link>
          <Link to="/settings" className="settings-btn">
            <i className="fas fa-cog"></i>
            Settings
          </Link>
        </div>
      </div>

      <div className="profile-content">
        <div className="profile-sidebar">
          {renderStatsCard()}
          {renderAchievements()}
        </div>

        <div className="profile-main">
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'experiences' ? 'active' : ''}`}
              onClick={() => setActiveTab('experiences')}
            >
              My Experiences ({userExperiences.length})
            </button>
            <button 
              className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookmarks')}
            >
              Bookmarks ({bookmarkedExperiences.length})
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'experiences' && (
              <div className="experiences-tab">
                {userExperiences.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📝</div>
                    <h3>No experiences shared yet</h3>
                    <p>Share your interview experiences to help others in their journey!</p>
                    <Link to="/create" className="create-first-btn">
                      Share Your First Experience
                    </Link>
                  </div>
                ) : (
                  <div className="experiences-grid">
                    {userExperiences.map(renderExperienceCard)}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'bookmarks' && (
              <div className="bookmarks-tab">
                {bookmarkedExperiences.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🔖</div>
                    <h3>No bookmarks yet</h3>
                    <p>Bookmark interesting experiences to save them for later!</p>
                    <Link to="/experiences" className="browse-btn">
                      Browse Experiences
                    </Link>
                  </div>
                ) : (
                  <div className="experiences-grid">
                    {bookmarkedExperiences.map(renderExperienceCard)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
