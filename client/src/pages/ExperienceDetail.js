import { useState, useEffect, useCallback } from 'react';

import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createApiUrl } from '../config/api';
import axios from 'axios';
import Avatar from '../components/Avatar';
import { extractUserName } from '../utils/avatar';
import './ExperienceDetail.css';

const ExperienceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [experience, setExperience] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [userVote, setUserVote] = useState(null);

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

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return '#4CAF50';
      case 'Medium': return '#FF9800';
      case 'Hard': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getResultColor = (result) => {
    switch (result) {
      case 'Selected': return '#4CAF50';
      case 'Rejected': return '#F44336';
      case 'Pending': return '#FF9800';
      case 'Waitlisted': return '#2196F3';
      default: return '#9E9E9E';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading experience...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/experiences')}>
          Back to Experiences
        </button>
      </div>
    );
  }

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

  return (
    <div className="experience-detail">
      <div className="experience-header">
        <div className="experience-company-info">
          <h1>{experience.companyInfo.companyName}</h1>
          <h2>{experience.companyInfo.role}</h2>
          <div className="experience-meta">
            <span className="department">{experience.companyInfo.department}</span>
            <span className="type">{experience.companyInfo.internshipType}</span>
            <span className="location">{experience.companyInfo.location}</span>
            <span 
              className="result"
              style={{ color: getResultColor(experience.finalResult) }}
            >
              {experience.finalResult}
            </span>
          </div>
        </div>

        <div className="experience-actions">
          <div className="voting">
            <button 
              className={`vote-btn upvote ${userVote === 'upvote' ? 'active' : ''}`}
              onClick={() => handleVote('upvote')}
            >
              👍 {experience.upvoteCount}
            </button>
            <button 
              className={`vote-btn downvote ${userVote === 'downvote' ? 'active' : ''}`}
              onClick={() => handleVote('downvote')}
            >
              👎 {experience.downvoteCount}
            </button>
          </div>
          <div className="action-buttons">
            {user && experience.userId._id === user.id && (
              // <Link 
              //   to={`/experiences/${id}/edit`}
              //   className="edit-btn"
              // >
              //   ✏️ Edit
              // </Link>
              <button
                className="edit-btn"
                onClick={() => navigate(`/experiences/${id}/edit`)}
              >
                Edit
              </button>
            )}
            
            <button 
              className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={handleBookmark}
            >
              {isBookmarked ? '🔖' : '📖'} Bookmark
            </button>
            {/* // Show report button only if user is NOT the owner */}
            {user && experience.userId._id !== user.id && (
              !experience.reports?.some(report => report.reportedBy === user.id) ? (
                <button 
                  className="report-btn"
                  onClick={() => setIsReportModalOpen(true)}
                  title="Report this experience"
                >
                  <i className="fas fa-flag" style={{ color: '#ef4444', marginRight: 6 }}></i> Report
                </button>
              ) : (
                <button
                  className="report-btn reported"
                  disabled={true}
                  title="You've already reported this experience"
                >
                  <i className="fas fa-flag-checkered" style={{ color: '#ef4444', marginRight: 6 }}></i> Reported
                </button>
              )
            )}
            {/* {user && experience.userId._id !== user._id && experience.reports?.includes({ reportedBy: user._id }) && (
              <span className="already-reported-msg" style={{ color: '#ef4444', fontWeight: 500, marginLeft: 8 }}>
                <i className="fas fa-flag" style={{ marginRight: 4 }}></i>Reported
              </span>
            )} */}
          </div>
        </div>
      {/* Custom Report Modal */}
      {isReportModalOpen && (
        <div className="report-modal-overlay" onClick={e => { if (e.target.classList.contains('report-modal-overlay')) closeReportModal(); }}>
          <div className="report-modal" tabIndex={-1} onKeyDown={e => { if (e.key === 'Escape') closeReportModal(); }}>
            <h2>Report Experience</h2>
            <p>Please let us know why you are reporting this experience:</p>
            <select
              value={reportReason.reason || ''}
              onChange={e => setReportReason({ ...reportReason, reason: e.target.value })}
              style={{ width: '100%', marginBottom: 12 }}
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
                style={{ width: '100%', minHeight: 60, marginBottom: 12 }}
              />
            )}
            {reportError && <div style={{ color: 'red', marginBottom: 8 }}>{reportError}</div>}
            {reportSuccess && <div style={{ color: 'green', marginBottom: 8 }}>{reportSuccess}</div>}
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <button
                onClick={async () => {
                  if (!reportReason || (typeof reportReason === 'object' && !reportReason.details)) {
                    setReportError('Please select or enter a reason.');
                    return;
                  }
                  setReportLoading(true);
                  setReportError('');
                  setReportSuccess('');
                  try {
                    const reasonToSend = typeof reportReason === 'string' ? reportReason : reportReason.details;
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
              >
                {reportLoading ? 'Reporting...' : 'Submit'}
              </button>
              <button
                onClick={closeReportModal}
                disabled={reportLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Helper for closing modal and resetting state (no-op) */}
      </div>

      <div className="experience-stats">
        <div className="stat">
          <span className="label">Overall Rating</span>
          <span className="value">
            {'⭐'.repeat(experience.overallRating)} ({experience.overallRating}/5)
          </span>
        </div>
        <div className="stat">
          <span className="label">Preparation Time</span>
          <span className="value">{experience.preparationTime} weeks</span>
        </div>
        <div className="stat">
          <span className="label">Views</span>
          <span className="value">{experience.views}</span>
        </div>
      </div>

      <div className="experience-content">
        <div className="main-content">
          <section className="rounds-section">
            <h3>Interview Rounds</h3>
            {experience.rounds.map((round, index) => (
              <div key={index} className="round-card">
                <div className="round-header">
                  <h4>Round {round.roundNumber}: {round.roundType}</h4>
                  <span className="duration">{round.duration} minutes</span>
                  <span 
                    className="round-result"
                    style={{ color: getResultColor(round.roundResult) }}
                  >
                    {round.roundResult}
                  </span>
                </div>

                {round.technicalQuestions && round.technicalQuestions.length > 0 && (
                  <div className="questions-section">
                    <h5>Technical Questions</h5>
                    {round.technicalQuestions.map((q, qIndex) => (
                      <div key={qIndex} className="question-card">
                        <div className="question-header">
                          <p className="question">{q.question}</p>
                          <span 
                            className="difficulty"
                            style={{ color: getDifficultyColor(q.difficulty) }}
                          >
                            {q.difficulty}
                          </span>
                        </div>
                        {q.topics && q.topics.length > 0 && (
                          <div className="topics">
                            {q.topics.map((topic, tIndex) => (
                              <span key={tIndex} className="topic-tag">{topic}</span>
                            ))}
                          </div>
                        )}
                        {q.solution && (
                          <div className="solution">
                            <strong>Solution Approach:</strong>
                            <p>{q.solution}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {round.behavioralQuestions && round.behavioralQuestions.length > 0 && (
                  <div className="questions-section">
                    <h5>Behavioral Questions</h5>
                    {round.behavioralQuestions.map((q, qIndex) => (
                      <div key={qIndex} className="question-card">
                        <p className="question">{q.question}</p>
                        <span className="category">{q.category}</span>
                        {q.yourAnswer && (
                          <div className="answer">
                            <strong>Sample Answer:</strong>
                            <p>{q.yourAnswer}</p>
                          </div>
                        )}
                        {q.tips && (
                          <div className="tips">
                            <strong>Tips:</strong>
                            <p>{q.tips}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div className="round-feedback">
                  <h5>Tips & Experience</h5>
                  <p>{round.tips}</p>
                  {round.feedback && (
                    <div className="feedback">
                      <strong>Feedback Received:</strong>
                      <p>{round.feedback}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </section>

          <section className="preparation-section">
            <h3>Preparation & Tips</h3>
            <div className="tips-card">
              <h4>Key Tips</h4>
              <p>{experience.keyTips}</p>
            </div>
            <div className="tips-card">
              <h4>Mistakes to Avoid</h4>
              <p>{experience.mistakesToAvoid}</p>
            </div>
            {experience.resourcesUsed && experience.resourcesUsed.length > 0 && (
              <div className="tips-card">
                <h4>Resources Used</h4>
                <ul>
                  {experience.resourcesUsed.map((resource, index) => (
                    <li key={index}>{resource}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <div className="sidebar">
          <div className="author-info">
            <h4>Shared by</h4>
            {experience.isAnonymous ? (
              <p>Anonymous</p>
            ) : (
              <div className="author">
                <Avatar 
                  user={experience.userId}
                  size={40}
                  className="author-avatar"
                />
                <div>
                  <p className="author-name">{extractUserName(experience.userId.name) || experience.userId.name}</p>
                  <p className="author-university">{experience.userId.university}</p>
                </div>
              </div>
            )}
          </div>

          <div className="background-info">
            <h4>Background</h4>
            <div className="info-item">
              <span>Year of Study:</span>
              <span>{experience.backgroundInfo.yearOfStudy}</span>
            </div>
            {experience.backgroundInfo.cgpa && (
              <div className="info-item">
                <span>CGPA:</span>
                <span>{experience.backgroundInfo.cgpa}</span>
              </div>
            )}
            <div className="info-item">
              <span>Previous Internships:</span>
              <span>{experience.backgroundInfo.previousInternships}</span>
            </div>
            {experience.backgroundInfo.skills && experience.backgroundInfo.skills.length > 0 && (
              <div className="skills">
                <h5>Skills</h5>
                <div className="skill-tags">
                  {experience.backgroundInfo.skills.map((skill, index) => (
                    <span key={index} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="experience-company-details">
            <h4>Company Details</h4>
            <div className="info-item">
              <span>Duration:</span>
              <span>{experience.companyInfo.duration}</span>
            </div>
            {experience.companyInfo.stipend && (
              <div className="info-item">
                <span>Stipend:</span>
                <span>{experience.companyInfo.currency} {experience.companyInfo.stipend}</span>
              </div>
            )}
            {experience.companyInfo.city && (
              <div className="info-item">
                <span>Location:</span>
                <span>{experience.companyInfo.city}, {experience.companyInfo.country}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExperienceDetail;
