import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { experienceAPI } from '../utils/api';
import './EditExperience.css';

const EditExperience = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);
  
  const [formData, setFormData] = useState({
    companyInfo: {
      companyName: '',
      role: '',
      department: '',
      internshipType: 'Summer',
      duration: '',
      location: 'On-site',
      city: '',
      country: '',
      stipend: '',
      currency: 'USD',
      applicationDate: '',
      resultDate: ''
    },
    rounds: [{
      roundNumber: 1,
      roundType: 'Technical',
      duration: '',
      platform: '',
      technicalQuestions: [],
      behavioralQuestions: [],
      mcqSection: {
        totalQuestions: '',
        timeLimit: '',
        topics: [],
        difficulty: 'Medium',
        cutoff: ''
      },
      interviewerDetails: [],
      roundResult: 'Selected',
      feedback: '',
      tips: '',
      overallExperience: 5
    }],
    overallRating: 5,
    overallExperience: '',
    finalResult: 'Selected',
    wouldRecommend: true,
    preparationTime: '',
    resourcesUsed: [],
    keyTips: '',
    mistakesToAvoid: '',
    backgroundInfo: {
      cgpa: '',
      previousInternships: 0,
      relevantProjects: [],
      skills: [],
      yearOfStudy: '3rd Year'
    },
    isAnonymous: false
  });

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchExperience();
  }, [id, user, navigate]);

  const fetchExperience = async () => {
    try {
      setLoading(true);
      const response = await experienceAPI.getById(id);
      
      // Handle the API response structure
      const experienceData = response.data?.data || response.data;
      
      // Transform the API data to match the component's expected format
      const transformedData = {
        companyInfo: {
          companyName: experienceData.companyInfo?.companyName || '',
          role: experienceData.companyInfo?.role || '',
          department: experienceData.companyInfo?.department || '',
          internshipType: experienceData.companyInfo?.internshipType || 'Summer',
          duration: experienceData.companyInfo?.duration || '',
          location: experienceData.companyInfo?.location || 'On-site',
          city: experienceData.companyInfo?.city || '',
          country: experienceData.companyInfo?.country || '',
          stipend: experienceData.companyInfo?.stipend || '',
          currency: experienceData.companyInfo?.currency || 'USD',
          applicationDate: experienceData.companyInfo?.applicationDate ? 
            experienceData.companyInfo.applicationDate.split('T')[0] : '',
          resultDate: experienceData.companyInfo?.resultDate ? 
            experienceData.companyInfo.resultDate.split('T')[0] : ''
        },
        rounds: experienceData.rounds?.map((round, index) => ({
          roundNumber: round.roundNumber || index + 1,
          roundType: round.roundType || 'Technical',
          duration: round.duration || '',
          platform: round.platform || '',
          technicalQuestions: (round.technicalQuestions || []).map(q => ({
            question: q.question || '',
            difficulty: q.difficulty || 'Medium',
            topics: q.topics || [],
            leetcodeLink: q.leetcodeLink || '',
            solution: q.solution || q.answer || '', // Handle both old and new field names
            timeGiven: q.timeGiven || ''
          })),
          behavioralQuestions: (round.behavioralQuestions || []).map(q => ({
            question: q.question || '',
            category: q.category || 'Personal',
            yourAnswer: q.yourAnswer || q.answer || '', // Handle both old and new field names
            tips: q.tips || ''
          })),
          mcqSection: {
            totalQuestions: round.mcqSection?.totalQuestions || '',
            timeLimit: round.mcqSection?.timeLimit || '',
            topics: round.mcqSection?.topics || [],
            difficulty: round.mcqSection?.difficulty || 'Medium',
            cutoff: round.mcqSection?.cutoff || ''
          },
          interviewerDetails: round.interviewerDetails || [],
          roundResult: round.roundResult || 'Selected',
          feedback: round.feedback || '',
          tips: round.tips || '',
          overallExperience: round.overallExperience || 5
        })) || [{
          roundNumber: 1,
          roundType: 'Technical',
          duration: '',
          platform: '',
          technicalQuestions: [],
          behavioralQuestions: [],
          mcqSection: {
            totalQuestions: '',
            timeLimit: '',
            topics: [],
            difficulty: 'Medium',
            cutoff: ''
          },
          interviewerDetails: [],
          roundResult: 'Selected',
          feedback: '',
          tips: '',
          overallExperience: 5
        }],
        overallRating: experienceData.overallRating || 5,
        finalResult: experienceData.finalResult || 'Selected',
        wouldRecommend: experienceData.wouldRecommend !== undefined ? experienceData.wouldRecommend : true,
        preparationTime: experienceData.preparationTime || '',
        resourcesUsed: experienceData.resourcesUsed || [],
        keyTips: experienceData.keyTips || '',
        mistakesToAvoid: experienceData.mistakesToAvoid || '',
        backgroundInfo: {
          yearOfStudy: experienceData.backgroundInfo?.yearOfStudy || '3rd Year',
          cgpa: experienceData.backgroundInfo?.cgpa || '',
          previousInternships: experienceData.backgroundInfo?.previousInternships || 0,
          relevantProjects: experienceData.backgroundInfo?.relevantProjects || [],
          skills: experienceData.backgroundInfo?.skills || []
        },
        isAnonymous: experienceData.isAnonymous || false
      };
      
      setFormData(transformedData);
    } catch (error) {
      // console.error('Error fetching experience:', error);
      setError('Failed to load experience data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      // Transform the form data to match the API's expected format
      const submitData = {
        companyInfo: {
          ...formData.companyInfo,
          applicationDate: formData.companyInfo.applicationDate ? 
            new Date(formData.companyInfo.applicationDate).toISOString() : null,
          resultDate: formData.companyInfo.resultDate ? 
            new Date(formData.companyInfo.resultDate).toISOString() : null,
          stipend: formData.companyInfo.stipend ? parseFloat(formData.companyInfo.stipend) || null : null
        },
        rounds: formData.rounds.map(round => ({
          ...round,
          duration: round.duration ? parseInt(round.duration) || round.duration : '',
          mcqSection: {
            ...round.mcqSection,
            totalQuestions: round.mcqSection.totalQuestions ? parseInt(round.mcqSection.totalQuestions) || null : null,
            timeLimit: round.mcqSection.timeLimit ? parseInt(round.mcqSection.timeLimit) || null : null,
            cutoff: round.mcqSection.cutoff ? parseFloat(round.mcqSection.cutoff) || null : null
          }
        })),
        overallRating: parseInt(formData.overallRating) || 5,
        overallExperience: formData.overallExperience || '',
        finalResult: formData.finalResult,
        wouldRecommend: formData.wouldRecommend,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) || formData.preparationTime : '',
        resourcesUsed: formData.resourcesUsed,
        keyTips: formData.keyTips,
        mistakesToAvoid: formData.mistakesToAvoid,
        backgroundInfo: {
          ...formData.backgroundInfo,
          cgpa: formData.backgroundInfo.cgpa ? parseFloat(formData.backgroundInfo.cgpa) || null : null,
          previousInternships: formData.backgroundInfo.previousInternships ? parseInt(formData.backgroundInfo.previousInternships) || 0 : 0
        },
        isAnonymous: formData.isAnonymous
      };
      
      const response = await experienceAPI.update(id, submitData);
      
      setSuccessMessage('Experience updated successfully! 🎉');
      setTimeout(() => {
        navigate(`/experiences/${id}`);
      }, 2000);
      
    } catch (error) {
      // console.error('Error updating experience:', error);
      setError(error.response?.data?.message || 'Failed to update experience. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (section, field, value, index = null, subSection = null) => {
    if (section === null) {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    } else if (section === 'rounds' && index !== null) {
      setFormData(prev => ({
        ...prev,
        rounds: prev.rounds.map((round, i) => {
          if (i === index) {
            if (subSection) {
              // Handle nested objects like mcqSection
              return {
                ...round,
                [subSection]: {
                  ...round[subSection],
                  [field]: value
                }
              };
            } else {
              return { ...round, [field]: value };
            }
          }
          return round;
        })
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value
        }
      }));
    }
  };

  const handleArrayInput = (section, field, value, index = null) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(section, field, array, index);
  };

  const handleStringInput = (section, field, value) => {
    handleInputChange(section, field, value);
  };

  const addRound = () => {
    const newRound = {
      roundNumber: formData.rounds.length + 1,
      roundType: 'Technical',
      duration: '',
      platform: '',
      technicalQuestions: [],
      behavioralQuestions: [],
      mcqSection: {
        totalQuestions: '',
        timeLimit: '',
        topics: [],
        difficulty: 'Medium',
        cutoff: ''
      },
      interviewerDetails: [],
      roundResult: 'Selected',
      feedback: '',
      tips: '',
      overallExperience: 5
    };
    
    setFormData(prev => ({
      ...prev,
      rounds: [...prev.rounds, newRound]
    }));
  };

  const removeRound = (roundIndex) => {
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.filter((_, index) => index !== roundIndex)
    }));
  };

  const updateQuestion = (roundIndex, questionIndex, field, value, type) => {
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.map((round, rIndex) => {
        if (rIndex === roundIndex) {
          const questionType = type === 'technical' ? 'technicalQuestions' : 'behavioralQuestions';
          return {
            ...round,
            [questionType]: round[questionType].map((question, qIndex) => 
              qIndex === questionIndex ? { ...question, [field]: value } : question
            )
          };
        }
        return round;
      })
    }));
  };

  const addQuestion = (roundIndex, type) => {
    const newQuestion = type === 'technical' ? {
      question: '',
      difficulty: 'Medium',
      topics: [],
      leetcodeLink: '',
      solution: '',
      timeGiven: ''
    } : {
      question: '',
      category: 'Personal',
      yourAnswer: '',
      tips: ''
    };

    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.map((round, index) => {
        if (index === roundIndex) {
          const questionType = type === 'technical' ? 'technicalQuestions' : 'behavioralQuestions';
          return {
            ...round,
            [questionType]: [...round[questionType], newQuestion]
          };
        }
        return round;
      })
    }));
  };

  const removeQuestion = (roundIndex, questionIndex, type) => {
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.map((round, rIndex) => {
        if (rIndex === roundIndex) {
          const questionType = type === 'technical' ? 'technicalQuestions' : 'behavioralQuestions';
          return {
            ...round,
            [questionType]: round[questionType].filter((_, qIndex) => qIndex !== questionIndex)
          };
        }
        return round;
      })
    }));
  };

  if (!user) {
    return (
      <div className="psg-edit-container">
        <div className="psg-edit-card">
          <div className="psg-edit-error">
            <span className="psg-edit-error-icon">🔒</span>
            <div>
              <h3>Authentication Required</h3>
              <p>Please log in to edit your experience.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="psg-edit-container">
        <div className="psg-edit-card">
          <div className="psg-edit-loading">
            <div className="psg-edit-spinner"></div>
            <p className="psg-edit-loading-text">Loading your experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData?.companyInfo?.companyName) {
    return (
      <div className="psg-edit-container">
        <div className="psg-edit-card">
          <div className="psg-edit-error">
            <span className="psg-edit-error-icon">⚠️</span>
            <div>
              <h3>Unable to Load Experience</h3>
              <p>{error}</p>
              <button 
                className="psg-edit-btn psg-edit-btn-primary"
                onClick={() => navigate('/experiences')}
              >
                Back to Experiences
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safety check to ensure formData is properly structured
  if (!formData || !formData.companyInfo || !formData.rounds || !formData.backgroundInfo) {
    return (
      <div className="psg-edit-container">
        <div className="psg-edit-card">
          <div className="psg-edit-loading">
            <div className="psg-edit-spinner"></div>
            <p className="psg-edit-loading-text">Initializing form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="psg-edit-container">
      {successMessage && (
        <div className="psg-edit-notification psg-edit-fade-in">
          <span>✅</span>
          {successMessage}
        </div>
      )}

      <div className="psg-edit-card psg-edit-fade-in">
        <div className="psg-edit-header">
          <div className="psg-edit-header-content">
            <h1 className="psg-edit-title">
              Edit Experience
            </h1>
            <p className="psg-edit-subtitle">
              Update your interview experience to help others in their journey
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="psg-edit-form">
          {error && (
            <div className="psg-edit-section">
              <div className="psg-edit-error">
                <span className="psg-edit-error-icon">⚠️</span>
                <div>
                  <strong>Error:</strong> {error}
                </div>
              </div>
            </div>
          )}

          {/* Company Information Section */}
          <div className="psg-edit-section">
            <div className="psg-edit-section-header">
              <h2 className="psg-edit-section-title">
                🏢 Company Information
              </h2>
              <div className="psg-edit-section-divider"></div>
            </div>

            <div className="psg-edit-grid">
              <div className="psg-edit-field">
                <label className="psg-edit-label psg-edit-label-required">
                  Company Name
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={formData?.companyInfo?.companyName || ''}
                  onChange={(e) => handleInputChange('companyInfo', 'companyName', e.target.value)}
                  placeholder="e.g., Google"
                  required
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label psg-edit-label-required">
                  Role
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={formData?.companyInfo?.role || ''}
                  onChange={(e) => handleInputChange('companyInfo', 'role', e.target.value)}
                  placeholder="e.g., Software Engineer Intern"
                  required
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label psg-edit-label-required">
                  Department
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={formData.companyInfo.department}
                  onChange={(e) => handleInputChange('companyInfo', 'department', e.target.value)}
                  placeholder="e.g., Engineering"
                  required
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Internship Type
                </label>
                <select
                  className="psg-edit-select"
                  value={formData.companyInfo.internshipType}
                  onChange={(e) => handleInputChange('companyInfo', 'internshipType', e.target.value)}
                >
                  <option value="Summer">Summer</option>
                  <option value="Winter">Winter</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="PPO">PPO</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label psg-edit-label-required">
                  Duration
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={formData.companyInfo.duration}
                  onChange={(e) => handleInputChange('companyInfo', 'duration', e.target.value)}
                  placeholder="e.g., 3 months"
                  required
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Work Location
                </label>
                <select
                  className="psg-edit-select"
                  value={formData.companyInfo.location}
                  onChange={(e) => handleInputChange('companyInfo', 'location', e.target.value)}
                >
                  <option value="Remote">Remote</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  City
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={formData.companyInfo.city}
                  onChange={(e) => handleInputChange('companyInfo', 'city', e.target.value)}
                  placeholder="e.g., San Francisco"
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Country
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={formData.companyInfo.country}
                  onChange={(e) => handleInputChange('companyInfo', 'country', e.target.value)}
                  placeholder="e.g., USA"
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Stipend
                </label>
                <div style={{display: 'flex', gap: 'var(--psg-edit-spacing-sm)'}}>
                  <select
                    value={formData.companyInfo.currency}
                    onChange={(e) => handleInputChange('companyInfo', 'currency', e.target.value)}
                    className="psg-edit-select"
                    style={{maxWidth: '100px'}}
                  >
                    <option value="USD">USD</option>
                    <option value="INR">INR</option>
                    <option value="EUR">EUR</option>
                    <option value="GBP">GBP</option>
                  </select>
                  <input
                    type="number"
                    className="psg-edit-input"
                    value={formData.companyInfo.stipend}
                    onChange={(e) => handleInputChange('companyInfo', 'stipend', e.target.value)}
                    placeholder="Amount"
                  />
                </div>
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label psg-edit-label-required">
                  Application Date
                </label>
                <input
                  type="date"
                  className="psg-edit-input"
                  value={formData.companyInfo.applicationDate}
                  onChange={(e) => handleInputChange('companyInfo', 'applicationDate', e.target.value)}
                  required
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Result Date
                </label>
                <input
                  type="date"
                  className="psg-edit-input"
                  value={formData.companyInfo.resultDate}
                  onChange={(e) => handleInputChange('companyInfo', 'resultDate', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Rounds Section */}
          <div className="psg-edit-section">
            <div className="psg-edit-section-header">
              <h2 className="psg-edit-section-title">
                🎯 Interview Rounds
              </h2>
              <div className="psg-edit-section-divider"></div>
            </div>

            {(formData?.rounds || []).map((round, roundIndex) => (
              <div key={roundIndex} className="psg-edit-round-card">
                <div className="psg-edit-round-header">
                  <h3 className="psg-edit-round-title">
                    <span className="psg-edit-round-icon">🎯</span>
                    Round {roundIndex + 1}
                  </h3>
                  {formData?.rounds?.length > 1 && (
                    <button
                      type="button"
                      className="psg-edit-btn psg-edit-btn-danger psg-edit-btn-sm"
                      onClick={() => removeRound(roundIndex)}
                    >
                      Remove Round
                    </button>
                  )}
                </div>

                <div className="psg-edit-grid">
                  <div className="psg-edit-field">
                    <label className="psg-edit-label">
                      Round Type
                    </label>
                    <select
                      className="psg-edit-select"
                      value={round?.roundType || 'Technical'}
                      onChange={(e) => handleInputChange('rounds', 'roundType', e.target.value, roundIndex)}
                    >
                      <option value="Technical">Technical Round</option>
                      <option value="HR">HR Round</option>
                      <option value="Managerial">Managerial Round</option>
                      <option value="Coding">Coding Round</option>
                      <option value="System Design">System Design</option>
                      <option value="Group Discussion">Group Discussion</option>
                    </select>
                  </div>

                  <div className="psg-edit-field">
                    <label className="psg-edit-label psg-edit-label-required">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      className="psg-edit-input"
                      value={round.duration}
                      onChange={(e) => handleInputChange('rounds', 'duration', e.target.value ? parseInt(e.target.value) : '', roundIndex)}
                      placeholder="e.g., 60"
                      min="1"
                      required
                    />
                  </div>

                  <div className="psg-edit-field">
                    <label className="psg-edit-label">
                      Platform
                    </label>
                    <input
                      type="text"
                      className="psg-edit-input"
                      value={round.platform}
                      onChange={(e) => handleInputChange('rounds', 'platform', e.target.value, roundIndex)}
                      placeholder="e.g., Zoom, Teams, In-person"
                    />
                  </div>

                  <div className="psg-edit-field">
                    <label className="psg-edit-label">
                      Result
                    </label>
                    <select
                      className="psg-edit-select"
                      value={round.roundResult}
                      onChange={(e) => handleInputChange('rounds', 'roundResult', e.target.value, roundIndex)}
                    >
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Waitlisted">Waitlisted</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="psg-edit-field">
                    <label className="psg-edit-label">
                      Overall Experience (1-5)
                    </label>
                    <input
                      type="number"
                      className="psg-edit-input"
                      min="1"
                      max="10"
                      value={round.overallExperience}
                      onChange={(e) => handleInputChange('rounds', 'overallExperience', parseInt(e.target.value), roundIndex)}
                    />
                  </div>

                  <div className="psg-edit-field psg-edit-grid-full">
                    <label className="psg-edit-label">
                      Tips for this round
                    </label>
                    <textarea
                      className="psg-edit-textarea"
                      value={round.tips}
                      onChange={(e) => handleInputChange('rounds', 'tips', e.target.value, roundIndex)}
                      placeholder="Share tips and advice for this specific round..."
                      rows="3"
                    />
                  </div>

                  <div className="psg-edit-field psg-edit-grid-full">
                    <label className="psg-edit-label">
                      Feedback & Notes
                    </label>
                    <textarea
                      className="psg-edit-textarea"
                      value={round.feedback}
                      onChange={(e) => handleInputChange('rounds', 'feedback', e.target.value, roundIndex)}
                      placeholder="Share your thoughts about this round..."
                      rows="3"
                    />
                  </div>
                </div>

                {/* Technical Questions */}
                <div className="psg-edit-question-section">
                  <div className="psg-edit-question-header">
                    <h4 className="psg-edit-question-title">
                      💻 Technical Questions
                    </h4>
                    <button
                      type="button"
                      className="psg-edit-btn psg-edit-btn-secondary psg-edit-btn-sm"
                      onClick={() => addQuestion(roundIndex, 'technical')}
                    >
                      Add Question
                    </button>
                  </div>

                  {(round?.technicalQuestions || []).map((question, qIndex) => (
                    <div key={qIndex} className="psg-edit-question-card">
                      <div className="psg-edit-question-meta">
                        <span className="psg-edit-question-number">
                          Question {qIndex + 1}
                        </span>
                        <button
                          type="button"
                          className="psg-edit-btn psg-edit-btn-danger psg-edit-btn-sm"
                          onClick={() => removeQuestion(roundIndex, qIndex, 'technical')}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="psg-edit-grid">
                        <div className="psg-edit-field psg-edit-grid-full">
                          <label className="psg-edit-label">
                            Question
                          </label>
                          <textarea
                            className="psg-edit-textarea"
                            value={question.question}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'question', e.target.value, 'technical')}
                            placeholder="Describe the technical question asked..."
                            rows="3"
                          />
                        </div>

                        <div className="psg-edit-field">
                          <label className="psg-edit-label">
                            Difficulty Level
                          </label>
                          <select
                            className="psg-edit-select"
                            value={question.difficulty}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'difficulty', e.target.value, 'technical')}
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>

                        <div className="psg-edit-field">
                          <label className="psg-edit-label">
                            Topics (comma separated)
                          </label>
                          <input
                            type="text"
                            className="psg-edit-input"
                            value={question.topics?.join(', ') || ''}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'topics', e.target.value.split(',').map(t => t.trim()).filter(t => t), 'technical')}
                            placeholder="Arrays, Dynamic Programming, etc."
                          />
                        </div>

                        <div className="psg-edit-field psg-edit-grid-full">
                          <label className="psg-edit-label">
                            Solution Approach
                          </label>
                          <textarea
                            className="psg-edit-textarea"
                            value={question.solution}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'solution', e.target.value, 'technical')}
                            placeholder="Describe your approach to solving this question..."
                            rows="3"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Behavioral Questions */}
                <div className="psg-edit-question-section">
                  <div className="psg-edit-question-header">
                    <h4 className="psg-edit-question-title">
                      🗣️ Behavioral Questions
                    </h4>
                    <button
                      type="button"
                      className="psg-edit-btn psg-edit-btn-secondary psg-edit-btn-sm"
                      onClick={() => addQuestion(roundIndex, 'behavioral')}
                    >
                      Add Question
                    </button>
                  </div>

                  {(round?.behavioralQuestions || []).map((question, qIndex) => (
                    <div key={qIndex} className="psg-edit-question-card">
                      <div className="psg-edit-question-meta">
                        <span className="psg-edit-question-number">
                          Question {qIndex + 1}
                        </span>
                        <button
                          type="button"
                          className="psg-edit-btn psg-edit-btn-danger psg-edit-btn-sm"
                          onClick={() => removeQuestion(roundIndex, qIndex, 'behavioral')}
                        >
                          Remove
                        </button>
                      </div>

                      <div className="psg-edit-grid">
                        <div className="psg-edit-field psg-edit-grid-full">
                          <label className="psg-edit-label">
                            Question
                          </label>
                          <textarea
                            className="psg-edit-textarea"
                            value={question.question}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'question', e.target.value, 'behavioral')}
                            placeholder="Describe the behavioral question asked..."
                            rows="2"
                          />
                        </div>

                        <div className="psg-edit-field">
                          <label className="psg-edit-label">
                            Category
                          </label>
                          <select
                            className="psg-edit-select"
                            value={question.category}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'category', e.target.value, 'behavioral')}
                          >
                            <option value="Personal">Personal</option>
                            <option value="Behavioral">Behavioral</option>
                            <option value="Situational">Situational</option>
                            <option value="Company-specific">Company-specific</option>
                          </select>
                        </div>

                        <div className="psg-edit-field psg-edit-grid-full">
                          <label className="psg-edit-label">
                            Your Answer
                          </label>
                          <textarea
                            className="psg-edit-textarea"
                            value={question.yourAnswer}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'yourAnswer', e.target.value, 'behavioral')}
                            placeholder="How did you answer this question?"
                            rows="3"
                          />
                        </div>

                        <div className="psg-edit-field psg-edit-grid-full">
                          <label className="psg-edit-label">
                            Tips for Others
                          </label>
                          <textarea
                            className="psg-edit-textarea"
                            value={question.tips}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'tips', e.target.value, 'behavioral')}
                            placeholder="Any tips for future candidates?"
                            rows="2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="psg-edit-text-center">
              <button
                type="button"
                className="psg-edit-btn psg-edit-btn-ghost"
                onClick={addRound}
              >
                ➕ Add Another Round
              </button>
            </div>
          </div>

          {/* Preparation & Tips Section */}
          <div className="psg-edit-section">
            <div className="psg-edit-section-header">
              <h2 className="psg-edit-section-title">
                📊 Preparation & Tips
              </h2>
              <div className="psg-edit-section-divider"></div>
            </div>

            <div className="psg-edit-grid">
              <div className="psg-edit-field">
                <label className="psg-edit-label psg-edit-label-required">
                  Preparation Time (weeks)
                </label>
                <input
                  type="number"
                  className="psg-edit-input"
                  value={formData.preparationTime}
                  onChange={(e) => handleInputChange(null, 'preparationTime', e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="How many weeks did you prepare?"
                  required
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Overall Rating (1-5)
                </label>
                <select
                  className="psg-edit-select"
                  value={formData.overallRating}
                  onChange={(e) => handleInputChange(null, 'overallRating', parseInt(e.target.value))}
                >
                  <option value={1}>1 - Poor</option>
                  <option value={2}>2 - Below Average</option>
                  <option value={3}>3 - Average</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-label">
                  Overall Experience Summary
                </label>
                <textarea
                  className="psg-edit-textarea"
                  value={formData.overallExperience}
                  onChange={(e) => handleInputChange(null, 'overallExperience', e.target.value)}
                  placeholder="Summarize your overall interview experience in a few sentences..."
                  rows="3"
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Final Result
                </label>
                <select
                  className="psg-edit-select"
                  value={formData.finalResult}
                  onChange={(e) => handleInputChange(null, 'finalResult', e.target.value)}
                >
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Would you recommend this company?
                </label>
                <select
                  className="psg-edit-select"
                  value={formData.wouldRecommend}
                  onChange={(e) => handleInputChange(null, 'wouldRecommend', e.target.value === 'true')}
                >
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-label">
                  Resources Used (comma separated)
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={Array.isArray(formData.resourcesUsed) ? formData.resourcesUsed.join(', ') : formData.resourcesUsed || ''}
                  onChange={(e) => handleStringInput(null, 'resourcesUsed', e.target.value)}
                  onBlur={(e) => handleArrayInput(null, 'resourcesUsed', e.target.value)}
                  placeholder="LeetCode, GeeksforGeeks, System Design Primer, etc."
                />
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-label psg-edit-label-required">
                  Key Tips
                </label>
                <textarea
                  className="psg-edit-textarea"
                  value={formData.keyTips}
                  onChange={(e) => handleInputChange(null, 'keyTips', e.target.value)}
                  placeholder="Share your most important tips for others..."
                  rows="4"
                  required
                />
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-label psg-edit-label-required">
                  Mistakes to Avoid
                </label>
                <textarea
                  className="psg-edit-textarea"
                  value={formData.mistakesToAvoid}
                  onChange={(e) => handleInputChange(null, 'mistakesToAvoid', e.target.value)}
                  placeholder="What mistakes should others avoid?"
                  rows="4"
                  required
                />
              </div>
            </div>
          </div>

          {/* Background Information Section */}
          <div className="psg-edit-section">
            <div className="psg-edit-section-header">
              <h2 className="psg-edit-section-title">
                🎓 Background Information
              </h2>
              <div className="psg-edit-section-divider"></div>
            </div>

            <div className="psg-edit-grid">
              <div className="psg-edit-field">
                <label className="psg-edit-label psg-edit-label-required">
                  Year of Study
                </label>
                <select
                  className="psg-edit-select"
                  value={formData.backgroundInfo.yearOfStudy}
                  onChange={(e) => handleInputChange('backgroundInfo', 'yearOfStudy', e.target.value)}
                  required
                >
                  <option value="1st Year">1st Year</option>
                  <option value="2nd Year">2nd Year</option>
                  <option value="3rd Year">3rd Year</option>
                  <option value="4th Year">4th Year</option>
                  <option value="Graduate">Graduate</option>
                  <option value="Postgraduate">Postgraduate</option>
                </select>
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  CGPA
                </label>
                <input
                  type="number"
                  className="psg-edit-input"
                  step="0.01"
                  min="0"
                  max="10"
                  value={formData.backgroundInfo.cgpa}
                  onChange={(e) => handleInputChange('backgroundInfo', 'cgpa', e.target.value ? parseFloat(e.target.value) : '')}
                  placeholder="e.g., 8.5"
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Previous Internships
                </label>
                <input
                  type="number"
                  className="psg-edit-input"
                  min="0"
                  value={formData.backgroundInfo.previousInternships}
                  onChange={(e) => handleInputChange('backgroundInfo', 'previousInternships', e.target.value ? parseInt(e.target.value) : '')}
                  placeholder="Number of previous internships"
                />
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-label">
                  Relevant Projects (comma separated)
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={Array.isArray(formData.backgroundInfo.relevantProjects) ? formData.backgroundInfo.relevantProjects.join(', ') : formData.backgroundInfo.relevantProjects || ''}
                  onChange={(e) => handleStringInput('backgroundInfo', 'relevantProjects', e.target.value)}
                  onBlur={(e) => handleArrayInput('backgroundInfo', 'relevantProjects', e.target.value)}
                  placeholder="Project 1, Project 2, etc."
                />
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-label">
                  Skills (comma separated)
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={Array.isArray(formData.backgroundInfo.skills) ? formData.backgroundInfo.skills.join(', ') : formData.backgroundInfo.skills || ''}
                  onChange={(e) => handleStringInput('backgroundInfo', 'skills', e.target.value)}
                  onBlur={(e) => handleArrayInput('backgroundInfo', 'skills', e.target.value)}
                  placeholder="JavaScript, Python, React, etc."
                />
              </div>

              <div className="psg-edit-field">
                <label style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}}>
                  <input
                    type="checkbox"
                    checked={formData.isAnonymous}
                    onChange={(e) => handleInputChange(null, 'isAnonymous', e.target.checked)}
                    style={{width: 'auto', margin: 0}}
                  />
                  <span className="psg-edit-label" style={{margin: 0, padding: 0}}>Share anonymously</span>
                </label>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="psg-edit-actions">
            <button
              type="button"
              className="psg-edit-btn psg-edit-btn-ghost"
              onClick={() => navigate('/experiences')}
              disabled={submitting}
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`psg-edit-btn psg-edit-btn-primary psg-edit-btn-lg ${submitting ? 'psg-edit-loading' : ''}`}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <div className="psg-edit-spinner" style={{width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white'}}></div>
                  Saving Changes...
                </>
              ) : (
                <>
                  💾 Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExperience;
