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
  
  const [formData, setFormData] = useState({
    companyInfo: {
      companyName: '',
      role: '',
      department: '',
      internshipType: 'Summer',
      duration: '',
      location: 'Remote',
      applicationDate: '',
      description: ''
    },
    rounds: [
      {
        roundType: 'Technical',
        duration: '',
        roundResult: 'Selected',
        overallExperience: 5,
        technicalQuestions: [],
        behavioralQuestions: [],
        feedback: ''
      }
    ],
    overallRating: 5,
    finalResult: 'Selected',
    wouldRecommend: true,
    preparationTime: '',
    keyTips: '',
    mistakesToAvoid: '',
    backgroundInfo: {
      yearOfStudy: '3rd Year',
      cgpa: '',
      skills: '',
      projects: '',
      previousInternships: ''
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
          location: experienceData.companyInfo?.location || 'Remote',
          applicationDate: experienceData.companyInfo?.applicationDate ? 
            experienceData.companyInfo.applicationDate.split('T')[0] : '',
          description: experienceData.companyInfo?.description || ''
        },
        rounds: experienceData.rounds?.map(round => ({
          roundType: round.roundType || 'Technical',
          duration: round.duration || '',
          roundResult: round.roundResult || 'Selected',
          overallExperience: round.overallExperience || 5,
          technicalQuestions: round.technicalQuestions || [],
          behavioralQuestions: round.behavioralQuestions || [],
          feedback: round.feedback || ''
        })) || [{
          roundType: 'Technical',
          duration: '',
          roundResult: 'Selected',
          overallExperience: 5,
          technicalQuestions: [],
          behavioralQuestions: [],
          feedback: ''
        }],
        overallRating: experienceData.overallRating || 5,
        finalResult: experienceData.finalResult || 'Selected',
        wouldRecommend: experienceData.wouldRecommend !== undefined ? experienceData.wouldRecommend : true,
        preparationTime: experienceData.preparationTime || '',
        keyTips: experienceData.keyTips || '',
        mistakesToAvoid: experienceData.mistakesToAvoid || '',
        backgroundInfo: {
          yearOfStudy: experienceData.backgroundInfo?.yearOfStudy || '3rd Year',
          cgpa: experienceData.backgroundInfo?.cgpa || '',
          skills: Array.isArray(experienceData.backgroundInfo?.skills) ? 
            experienceData.backgroundInfo.skills.join(', ') : (experienceData.backgroundInfo?.skills || ''),
          projects: Array.isArray(experienceData.backgroundInfo?.relevantProjects) ? 
            experienceData.backgroundInfo.relevantProjects.join(', ') : (experienceData.backgroundInfo?.relevantProjects || ''),
          previousInternships: experienceData.backgroundInfo?.previousInternships || ''
        },
        isAnonymous: experienceData.isAnonymous || false
      };
      
      setFormData(transformedData);
    } catch (error) {
      console.error('Error fetching experience:', error);
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
            new Date(formData.companyInfo.applicationDate).toISOString() : null
        },
        rounds: formData.rounds.map(round => ({
          ...round,
          duration: round.duration ? parseInt(round.duration) || round.duration : ''
        })),
        overallRating: parseInt(formData.overallRating) || 5,
        finalResult: formData.finalResult,
        wouldRecommend: formData.wouldRecommend,
        preparationTime: formData.preparationTime ? parseInt(formData.preparationTime) || formData.preparationTime : '',
        keyTips: formData.keyTips,
        mistakesToAvoid: formData.mistakesToAvoid,
        backgroundInfo: {
          ...formData.backgroundInfo,
          cgpa: formData.backgroundInfo.cgpa ? parseFloat(formData.backgroundInfo.cgpa) || formData.backgroundInfo.cgpa : '',
          skills: formData.backgroundInfo.skills ? formData.backgroundInfo.skills.split(',').map(s => s.trim()) : [],
          relevantProjects: formData.backgroundInfo.projects ? formData.backgroundInfo.projects.split(',').map(s => s.trim()) : []
        },
        isAnonymous: formData.isAnonymous
      };
      
      const response = await experienceAPI.update(id, submitData);
      
      setSuccessMessage('Experience updated successfully! 🎉');
      setTimeout(() => {
        navigate(`/experiences/${id}`);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating experience:', error);
      setError(error.response?.data?.message || 'Failed to update experience. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleRoundChange = (roundIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.map((round, index) => 
        index === roundIndex ? { ...round, [field]: value } : round
      )
    }));
  };

  const addRound = () => {
    const newRound = {
      roundType: 'Technical',
      duration: '',
      roundResult: 'Selected',
      overallExperience: 5,
      technicalQuestions: [],
      behavioralQuestions: [],
      feedback: ''
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
    const newQuestion = {
      question: '',
      answer: '',
      difficulty: 'Medium',
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
                  placeholder="Enter company name"
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
                <label className="psg-edit-label">
                  Department
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={formData.companyInfo.department}
                  onChange={(e) => handleInputChange('companyInfo', 'department', e.target.value)}
                  placeholder="e.g., Engineering"
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
                  <option value="Summer">Summer Internship</option>
                  <option value="Winter">Winter Internship</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                </select>
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Duration
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={formData.companyInfo.duration}
                  onChange={(e) => handleInputChange('companyInfo', 'duration', e.target.value)}
                  placeholder="e.g., 3 months"
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Location
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
                  Application Date
                </label>
                <input
                  type="date"
                  className="psg-edit-input"
                  value={formData.companyInfo.applicationDate}
                  onChange={(e) => handleInputChange('companyInfo', 'applicationDate', e.target.value)}
                />
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-label">
                  Job Description
                </label>
                <textarea
                  className="psg-edit-textarea"
                  value={formData.companyInfo.description}
                  onChange={(e) => handleInputChange('companyInfo', 'description', e.target.value)}
                  placeholder="Brief description of the role and responsibilities..."
                  rows="4"
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
                      onChange={(e) => handleRoundChange(roundIndex, 'roundType', e.target.value)}
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
                    <label className="psg-edit-label">
                      Duration
                    </label>
                    <input
                      type="text"
                      className="psg-edit-input"
                      value={round.duration}
                      onChange={(e) => handleRoundChange(roundIndex, 'duration', e.target.value)}
                      placeholder="e.g., 60 minutes"
                    />
                  </div>

                  <div className="psg-edit-field">
                    <label className="psg-edit-label">
                      Result
                    </label>
                    <select
                      className="psg-edit-select"
                      value={round.roundResult}
                      onChange={(e) => handleRoundChange(roundIndex, 'roundResult', e.target.value)}
                    >
                      <option value="Selected">Selected</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Waitlisted">Waitlisted</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>

                  <div className="psg-edit-field">
                    <label className="psg-edit-label">
                      Overall Experience (1-10)
                    </label>
                    <input
                      type="number"
                      className="psg-edit-input"
                      min="1"
                      max="10"
                      value={round.overallExperience}
                      onChange={(e) => handleRoundChange(roundIndex, 'overallExperience', parseInt(e.target.value))}
                    />
                  </div>

                  <div className="psg-edit-field psg-edit-grid-full">
                    <label className="psg-edit-label">
                      Feedback & Notes
                    </label>
                    <textarea
                      className="psg-edit-textarea"
                      value={round.feedback}
                      onChange={(e) => handleRoundChange(roundIndex, 'feedback', e.target.value)}
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
                            placeholder="Enter the interview question..."
                            rows="2"
                          />
                        </div>

                        <div className="psg-edit-field psg-edit-grid-full">
                          <label className="psg-edit-label">
                            Your Answer/Approach
                          </label>
                          <textarea
                            className="psg-edit-textarea"
                            value={question.answer}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'answer', e.target.value, 'technical')}
                            placeholder="How did you approach this question?"
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

                        <div className="psg-edit-field psg-edit-grid-full">
                          <label className="psg-edit-label">
                            Tips for Others
                          </label>
                          <textarea
                            className="psg-edit-textarea"
                            value={question.tips}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'tips', e.target.value, 'technical')}
                            placeholder="Any tips for future candidates?"
                            rows="2"
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
                            placeholder="Enter the behavioral question..."
                            rows="2"
                          />
                        </div>

                        <div className="psg-edit-field psg-edit-grid-full">
                          <label className="psg-edit-label">
                            Your Answer
                          </label>
                          <textarea
                            className="psg-edit-textarea"
                            value={question.answer}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'answer', e.target.value, 'behavioral')}
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

          {/* Overall Experience Section */}
          <div className="psg-edit-section">
            <div className="psg-edit-section-header">
              <h2 className="psg-edit-section-title">
                📊 Overall Experience
              </h2>
              <div className="psg-edit-section-divider"></div>
            </div>

            <div className="psg-edit-grid">
              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Overall Rating (1-10)
                </label>
                <input
                  type="number"
                  className="psg-edit-input"
                  min="1"
                  max="10"
                  value={formData.overallRating}
                  onChange={(e) => setFormData(prev => ({...prev, overallRating: parseInt(e.target.value)}))}
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Final Result
                </label>
                <select
                  className="psg-edit-select"
                  value={formData.finalResult}
                  onChange={(e) => setFormData(prev => ({...prev, finalResult: e.target.value}))}
                >
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Waitlisted">Waitlisted</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Preparation Time
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData(prev => ({...prev, preparationTime: e.target.value}))}
                  placeholder="e.g., 2 weeks"
                />
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-checkbox">
                  <input
                    type="checkbox"
                    className="psg-edit-checkbox-input"
                    checked={formData.wouldRecommend}
                    onChange={(e) => setFormData(prev => ({...prev, wouldRecommend: e.target.checked}))}
                  />
                  Would you recommend this company to others?
                </label>
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-label">
                  Key Tips for Success
                </label>
                <textarea
                  className="psg-edit-textarea"
                  value={formData.keyTips}
                  onChange={(e) => setFormData(prev => ({...prev, keyTips: e.target.value}))}
                  placeholder="Share your top tips for future candidates..."
                  rows="4"
                />
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-label">
                  Mistakes to Avoid
                </label>
                <textarea
                  className="psg-edit-textarea"
                  value={formData.mistakesToAvoid}
                  onChange={(e) => setFormData(prev => ({...prev, mistakesToAvoid: e.target.value}))}
                  placeholder="What should future candidates avoid?"
                  rows="4"
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
                <label className="psg-edit-label">
                  Year of Study
                </label>
                <select
                  className="psg-edit-select"
                  value={formData.backgroundInfo.yearOfStudy}
                  onChange={(e) => handleInputChange('backgroundInfo', 'yearOfStudy', e.target.value)}
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
                  type="text"
                  className="psg-edit-input"
                  value={formData.backgroundInfo.cgpa}
                  onChange={(e) => handleInputChange('backgroundInfo', 'cgpa', e.target.value)}
                  placeholder="e.g., 8.5"
                />
              </div>

              <div className="psg-edit-field">
                <label className="psg-edit-label">
                  Previous Internships
                </label>
                <input
                  type="text"
                  className="psg-edit-input"
                  value={formData.backgroundInfo.previousInternships}
                  onChange={(e) => handleInputChange('backgroundInfo', 'previousInternships', e.target.value)}
                  placeholder="Brief description of previous internships"
                />
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-label">
                  Relevant Skills
                </label>
                <textarea
                  className="psg-edit-textarea"
                  value={formData.backgroundInfo.skills}
                  onChange={(e) => handleInputChange('backgroundInfo', 'skills', e.target.value)}
                  placeholder="List your relevant technical and soft skills..."
                  rows="3"
                />
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-label">
                  Relevant Projects
                </label>
                <textarea
                  className="psg-edit-textarea"
                  value={formData.backgroundInfo.projects}
                  onChange={(e) => handleInputChange('backgroundInfo', 'projects', e.target.value)}
                  placeholder="Describe your relevant projects..."
                  rows="3"
                />
              </div>

              <div className="psg-edit-field psg-edit-grid-full">
                <label className="psg-edit-checkbox">
                  <input
                    type="checkbox"
                    className="psg-edit-checkbox-input"
                    checked={formData.isAnonymous}
                    onChange={(e) => setFormData(prev => ({...prev, isAnonymous: e.target.checked}))}
                  />
                  Make this experience anonymous
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
