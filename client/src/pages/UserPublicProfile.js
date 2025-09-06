import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import Avatar from '../components/Avatar';
import { extractUserName } from '../utils/avatar';
import './UserPublicProfile.css';

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
      case 'selected': return 'result-selected';
      case 'rejected': return 'result-rejected';
      case 'pending': return 'result-pending';
      case 'withdrawn': return 'result-withdrawn';
      default: return 'result-unknown';
    }
  };

  const renderExperienceCard = (experience) => (
    <div key={experience._id} className="public-experience-card">
      <div className="experience-header">
        <div className="company-info">
          <h3>{experience.companyInfo.companyName}</h3>
          <p className="role">{experience.companyInfo.role}</p>
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
          <span className="stat-value">{experience.overallRating}/5</span>
          <span className="stat-label">Rating</span>
        </div>
        <div className="stat">
          <span className="stat-value">{experience.views || 0}</span>
          <span className="stat-label">Views</span>
        </div>
      </div>

      <div className="experience-actions">
        <Link to={`/experiences/${experience._id}`} className="view-btn">
          View Details
        </Link>
      </div>
    </div>
  );

  const renderStatsCard = () => (
    <div className="public-stats-card">
      <h3>Statistics</h3>
      <div className="stats-grid">
        <div className="stat-item">
          <div className="stat-info">
            <span className="stat-number">{profile.stats.totalExperiences || 0}</span>
            <span className="stat-label">Experiences Shared</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-info">
            <span className="stat-number">{profile.stats.totalViews || 0}</span>
            <span className="stat-label">Total Views</span>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-info">
            <span className="stat-number">{profile.stats.averageRating || 0}</span>
            <span className="stat-label">Average Rating</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBadges = () => (
    <div className="upp-public-badges-card">
      <h3>Achievements</h3>
      <div className="upp-badges-grid">
        {profile.stats.totalExperiences >= 1 && (
          <div className="achievement unlocked">
            <div className="achievement-icon">🎯</div>
            <div className="achievement-info">
              <h4>First Share</h4>
              <p>Shared first interview experience</p>
            </div>
          </div>
        )}
        {profile.stats.totalExperiences >= 5 && (
          <div className="achievement unlocked">
            <div className="achievement-icon">📚</div>
            <div className="achievement-info">
              <h4>Storyteller</h4>
              <p>Shared 5 interview experiences</p>
            </div>
          </div>
        )}
        {profile.stats.totalViews >= 100 && (
          <div className="achievement unlocked">
            <div className="achievement-icon">🌟</div>
            <div className="achievement-info">
              <h4>Popular Content</h4>
              <p>Experiences have 100+ views</p>
            </div>
          </div>
        )}
        {profile.stats.averageRating >= 4 && (
          <div className="achievement unlocked">
            <div className="achievement-icon">🏆</div>
            <div className="achievement-info">
              <h4>Quality Contributor</h4>
              <p>High average rating (4+)</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="public-profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading user profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="public-profile-error">
        <div className="error-icon">!</div>
        <h2>Unable to load profile</h2>
        <p>{error}</p>
        <Link to="/experiences" className="back-btn">
          Browse Experiences
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="public-profile-error">
        <div className="error-icon">🔍</div>
        <h2>User not found</h2>
        <p>The user profile you're looking for doesn't exist.</p>
        <Link to="/experiences" className="back-btn">
          Browse Experiences
        </Link>
      </div>
    );
  }

  return (
    <div className="upp-public-profile-page">
      <div className="upp-public-profile-header">
        <div className="upp-profile-avatar">
          <Avatar 
            user={profile}
            size={100}
            className="upp-public-profile-avatar-img"
          />
        </div>
        <div className="upp-profile-info">
          <h1>{extractUserName(profile.name) || profile.name}</h1>
          {profile.email && (
            <p className="upp-profile-email">{profile.email}</p>
          )}
          {profile.university && (
            <p className="upp-profile-university">{profile.university}</p>
          )}
          {profile.graduationYear && (
            <p className="upp-profile-grad-year">Class of {profile.graduationYear}</p>
          )}
          <div className="upp-profile-meta">
            <span className="upp-join-date">
              Member since {formatDate(profile.joinedAt)}
            </span>
            <span className="upp-level">Level {profile.level}</span>
          </div>
          <div className="upp-profile-badges">
            {profile.stats.totalExperiences >= 5 && <span className="upp-badge storyteller">Storyteller</span>}
            {profile.stats.totalViews >= 100 && <span className="upp-badge popular">Popular</span>}
            {profile.stats.averageRating >= 4 && <span className="upp-badge quality">Quality</span>}
          </div>
        </div>
      </div>

      <div className="upp-public-profile-content">
        <div className="upp-profile-sidebar">
          {renderStatsCard()}
          {renderBadges()}
        </div>

        <div className="upp-profile-main">
          <div className="upp-experiences-section">
            <h2>Recent Experiences ({profile.recentExperiences.length})</h2>
            
            {profile.recentExperiences.length === 0 ? (
              <div className="upp-empty-state">
                <div className="upp-empty-icon">📝</div>
                <h3>No public experiences yet</h3>
                <p>This user hasn't shared any interview experiences publicly.</p>
              </div>
            ) : (
              <div className="upp-experiences-grid">
                {profile.recentExperiences.map(renderExperienceCard)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserPublicProfile;
