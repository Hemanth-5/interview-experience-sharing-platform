import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import './CreateExperience.css';

const CreateExperience = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  const handleInputChange = (section, field, value, index = null) => {
    setFormData(prev => {
      const newData = { ...prev };
      
      if (section === 'rounds' && index !== null) {
        newData.rounds[index][field] = value;
      } else if (section) {
        newData[section][field] = value;
      } else {
        newData[field] = value;
      }
      
      return newData;
    });
  };

  const addRound = () => {
    setFormData(prev => ({
      ...prev,
      rounds: [...prev.rounds, {
        roundNumber: prev.rounds.length + 1,
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
      }]
    }));
  };

  const removeRound = (index) => {
    if (formData.rounds.length > 1) {
      setFormData(prev => ({
        ...prev,
        rounds: prev.rounds.filter((_, i) => i !== index).map((round, i) => ({
          ...round,
          roundNumber: i + 1
        }))
      }));
    }
  };

  const addQuestion = (roundIndex, type) => {
    const newQuestion = type === 'technical' 
      ? { question: '', difficulty: 'Medium', topics: [], leetcodeLink: '', solution: '', timeGiven: '' }
      : { question: '', category: 'Personal', yourAnswer: '', tips: '' };

    setFormData(prev => {
      const newData = { ...prev };
      const questionField = type === 'technical' ? 'technicalQuestions' : 'behavioralQuestions';
      newData.rounds[roundIndex][questionField] = [...newData.rounds[roundIndex][questionField], newQuestion];
      return newData;
    });
  };

  const removeQuestion = (roundIndex, questionIndex, type) => {
    setFormData(prev => {
      const newData = { ...prev };
      const questionField = type === 'technical' ? 'technicalQuestions' : 'behavioralQuestions';
      newData.rounds[roundIndex][questionField] = newData.rounds[roundIndex][questionField].filter((_, i) => i !== questionIndex);
      return newData;
    });
  };

  const updateQuestion = (roundIndex, questionIndex, field, value, type) => {
    setFormData(prev => {
      const newData = { ...prev };
      const questionField = type === 'technical' ? 'technicalQuestions' : 'behavioralQuestions';
      newData.rounds[roundIndex][questionField][questionIndex][field] = value;
      return newData;
    });
  };

  const handleArrayInput = (section, field, value, index = null) => {
    const array = value.split(',').map(item => item.trim()).filter(item => item);
    handleInputChange(section, field, array, index);
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return formData.companyInfo.companyName && formData.companyInfo.role && formData.companyInfo.department;
      case 2:
        return formData.rounds.every(round => round.tips && round.duration);
      case 3:
        return formData.keyTips && formData.mistakesToAvoid;
      case 4:
        return formData.backgroundInfo.yearOfStudy;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
      setError(null);
    } else {
      setError('Please fill in all required fields before proceeding.');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(currentStep)) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(createApiUrl('/api/experiences'), formData, {
        withCredentials: true
      });

      if (response.data.success) {
        navigate(`/experiences/${response.data.data._id}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create experience');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4, 5].map(step => (
        <div 
          key={step} 
          className={`step ${step === currentStep ? 'active' : step < currentStep ? 'completed' : ''}`}
        >
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && 'Company Info'}
            {step === 2 && 'Interview Rounds'}
            {step === 3 && 'Preparation & Tips'}
            {step === 4 && 'Background'}
            {step === 5 && 'Review & Submit'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderCompanyInfo = () => (
    <div className="form-section">
      <h2>Company Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Company Name *</label>
          <input
            type="text"
            value={formData.companyInfo.companyName}
            onChange={(e) => handleInputChange('companyInfo', 'companyName', e.target.value)}
            placeholder="e.g., Google"
            required
          />
        </div>
        <div className="form-group">
          <label>Role *</label>
          <input
            type="text"
            value={formData.companyInfo.role}
            onChange={(e) => handleInputChange('companyInfo', 'role', e.target.value)}
            placeholder="e.g., Software Engineer Intern"
            required
          />
        </div>
        <div className="form-group">
          <label>Department *</label>
          <input
            type="text"
            value={formData.companyInfo.department}
            onChange={(e) => handleInputChange('companyInfo', 'department', e.target.value)}
            placeholder="e.g., Engineering"
            required
          />
        </div>
        <div className="form-group">
          <label>Internship Type</label>
          <select
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
        <div className="form-group">
          <label>Duration</label>
          <input
            type="text"
            value={formData.companyInfo.duration}
            onChange={(e) => handleInputChange('companyInfo', 'duration', e.target.value)}
            placeholder="e.g., 3 months"
          />
        </div>
        <div className="form-group">
          <label>Work Location</label>
          <select
            value={formData.companyInfo.location}
            onChange={(e) => handleInputChange('companyInfo', 'location', e.target.value)}
          >
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div className="form-group">
          <label>City</label>
          <input
            type="text"
            value={formData.companyInfo.city}
            onChange={(e) => handleInputChange('companyInfo', 'city', e.target.value)}
            placeholder="e.g., San Francisco"
          />
        </div>
        <div className="form-group">
          <label>Country</label>
          <input
            type="text"
            value={formData.companyInfo.country}
            onChange={(e) => handleInputChange('companyInfo', 'country', e.target.value)}
            placeholder="e.g., USA"
          />
        </div>
        <div className="form-group">
          <label>Stipend</label>
          <div className="input-group">
            <select
              value={formData.companyInfo.currency}
              onChange={(e) => handleInputChange('companyInfo', 'currency', e.target.value)}
              className="currency-select"
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <input
              type="number"
              value={formData.companyInfo.stipend}
              onChange={(e) => handleInputChange('companyInfo', 'stipend', e.target.value)}
              placeholder="Amount"
            />
          </div>
        </div>
        <div className="form-group">
          <label>Application Date</label>
          <input
            type="date"
            value={formData.companyInfo.applicationDate}
            onChange={(e) => handleInputChange('companyInfo', 'applicationDate', e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Result Date</label>
          <input
            type="date"
            value={formData.companyInfo.resultDate}
            onChange={(e) => handleInputChange('companyInfo', 'resultDate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderRounds = () => (
    <div className="form-section">
      <div className="section-header">
        <h2>Interview Rounds</h2>
        <button type="button" onClick={addRound} className="add-btn">
          + Add Round
        </button>
      </div>
      
      {formData.rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="round-card">
          <div className="round-header">
            <h3>Round {round.roundNumber}</h3>
            {formData.rounds.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeRound(roundIndex)}
                className="remove-btn"
              >
                Remove
              </button>
            )}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Round Type</label>
              <select
                value={round.roundType}
                onChange={(e) => handleInputChange('rounds', 'roundType', e.target.value, roundIndex)}
              >
                <option value="Online Assessment">Online Assessment</option>
                <option value="Technical">Technical</option>
                <option value="HR">HR</option>
                <option value="Group Discussion">Group Discussion</option>
                <option value="Presentation">Presentation</option>
                <option value="Case Study">Case Study</option>
                <option value="Coding Round">Coding Round</option>
                <option value="System Design">System Design</option>
              </select>
            </div>
            <div className="form-group">
              <label>Duration (minutes) *</label>
              <input
                type="number"
                value={round.duration}
                onChange={(e) => handleInputChange('rounds', 'duration', parseInt(e.target.value), roundIndex)}
                required
              />
            </div>
            <div className="form-group">
              <label>Platform</label>
              <input
                type="text"
                value={round.platform}
                onChange={(e) => handleInputChange('rounds', 'platform', e.target.value, roundIndex)}
                placeholder="e.g., Zoom, Teams, In-person"
              />
            </div>
            <div className="form-group">
              <label>Round Result</label>
              <select
                value={round.roundResult}
                onChange={(e) => handleInputChange('rounds', 'roundResult', e.target.value, roundIndex)}
              >
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
                <option value="Pending">Pending</option>
                <option value="Waitlisted">Waitlisted</option>
              </select>
            </div>
          </div>

          {/* Technical Questions */}
          <div className="questions-section">
            <div className="question-header">
              <h4>Technical Questions</h4>
              <button 
                type="button" 
                onClick={() => addQuestion(roundIndex, 'technical')}
                className="add-question-btn"
              >
                + Add Question
              </button>
            </div>
            {round.technicalQuestions.map((question, qIndex) => (
              <div key={qIndex} className="question-card">
                <div className="question-actions">
                  <button
                    type="button"
                    onClick={() => removeQuestion(roundIndex, qIndex, 'technical')}
                    className="remove-question-btn"
                  >
                    ×
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Question</label>
                    <textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(roundIndex, qIndex, 'question', e.target.value, 'technical')}
                      placeholder="Describe the technical question asked..."
                      rows="3"
                    />
                  </div>
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select
                      value={question.difficulty}
                      onChange={(e) => updateQuestion(roundIndex, qIndex, 'difficulty', e.target.value, 'technical')}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Topics (comma separated)</label>
                    <input
                      type="text"
                      value={question.topics?.join(', ') || ''}
                      onChange={(e) => updateQuestion(roundIndex, qIndex, 'topics', e.target.value.split(',').map(t => t.trim()).filter(t => t), 'technical')}
                      placeholder="Arrays, Dynamic Programming, etc."
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Solution Approach</label>
                    <textarea
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
          <div className="questions-section">
            <div className="question-header">
              <h4>Behavioral Questions</h4>
              <button 
                type="button" 
                onClick={() => addQuestion(roundIndex, 'behavioral')}
                className="add-question-btn"
              >
                + Add Question
              </button>
            </div>
            {round.behavioralQuestions.map((question, qIndex) => (
              <div key={qIndex} className="question-card">
                <div className="question-actions">
                  <button
                    type="button"
                    onClick={() => removeQuestion(roundIndex, qIndex, 'behavioral')}
                    className="remove-question-btn"
                  >
                    ×
                  </button>
                </div>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Question</label>
                    <textarea
                      value={question.question}
                      onChange={(e) => updateQuestion(roundIndex, qIndex, 'question', e.target.value, 'behavioral')}
                      placeholder="Describe the behavioral question asked..."
                      rows="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={question.category}
                      onChange={(e) => updateQuestion(roundIndex, qIndex, 'category', e.target.value, 'behavioral')}
                    >
                      <option value="Personal">Personal</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Situational">Situational</option>
                      <option value="Company-specific">Company-specific</option>
                    </select>
                  </div>
                  <div className="form-group full-width">
                    <label>Your Answer</label>
                    <textarea
                      value={question.yourAnswer}
                      onChange={(e) => updateQuestion(roundIndex, qIndex, 'yourAnswer', e.target.value, 'behavioral')}
                      placeholder="How did you answer this question?"
                      rows="3"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Overall Experience (1-5)</label>
              <select
                value={round.overallExperience}
                onChange={(e) => handleInputChange('rounds', 'overallExperience', parseInt(e.target.value), roundIndex)}
              >
                <option value={1}>1 - Poor</option>
                <option value={2}>2 - Below Average</option>
                <option value={3}>3 - Average</option>
                <option value={4}>4 - Good</option>
                <option value={5}>5 - Excellent</option>
              </select>
            </div>
          </div>

          <div className="form-group full-width">
            <label>Tips for this round *</label>
            <textarea
              value={round.tips}
              onChange={(e) => handleInputChange('rounds', 'tips', e.target.value, roundIndex)}
              placeholder="Share tips and advice for this specific round..."
              rows="3"
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Feedback Received</label>
            <textarea
              value={round.feedback}
              onChange={(e) => handleInputChange('rounds', 'feedback', e.target.value, roundIndex)}
              placeholder="Any feedback you received after this round..."
              rows="2"
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderPreparation = () => (
    <div className="form-section">
      <h2>Preparation & Tips</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Preparation Time (weeks)</label>
          <input
            type="number"
            value={formData.preparationTime}
            onChange={(e) => handleInputChange(null, 'preparationTime', parseInt(e.target.value))}
            placeholder="How many weeks did you prepare?"
          />
        </div>
        <div className="form-group">
          <label>Overall Rating (1-5)</label>
          <select
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
        <div className="form-group">
          <label>Final Result</label>
          <select
            value={formData.finalResult}
            onChange={(e) => handleInputChange(null, 'finalResult', e.target.value)}
          >
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div className="form-group">
          <label>Would you recommend this company?</label>
          <select
            value={formData.wouldRecommend}
            onChange={(e) => handleInputChange(null, 'wouldRecommend', e.target.value === 'true')}
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>
        <div className="form-group full-width">
          <label>Resources Used (comma separated)</label>
          <input
            type="text"
            value={formData.resourcesUsed.join(', ')}
            onChange={(e) => handleArrayInput(null, 'resourcesUsed', e.target.value)}
            placeholder="LeetCode, GeeksforGeeks, System Design Primer, etc."
          />
        </div>
        <div className="form-group full-width">
          <label>Key Tips *</label>
          <textarea
            value={formData.keyTips}
            onChange={(e) => handleInputChange(null, 'keyTips', e.target.value)}
            placeholder="Share your most important tips for others..."
            rows="4"
            required
          />
        </div>
        <div className="form-group full-width">
          <label>Mistakes to Avoid *</label>
          <textarea
            value={formData.mistakesToAvoid}
            onChange={(e) => handleInputChange(null, 'mistakesToAvoid', e.target.value)}
            placeholder="What mistakes should others avoid?"
            rows="4"
            required
          />
        </div>
      </div>
    </div>
  );

  const renderBackground = () => (
    <div className="form-section">
      <h2>Background Information</h2>
      <div className="form-grid">
        <div className="form-group">
          <label>Year of Study *</label>
          <select
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
        <div className="form-group">
          <label>CGPA</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="10"
            value={formData.backgroundInfo.cgpa}
            onChange={(e) => handleInputChange('backgroundInfo', 'cgpa', parseFloat(e.target.value))}
            placeholder="e.g., 8.5"
          />
        </div>
        <div className="form-group">
          <label>Previous Internships</label>
          <input
            type="number"
            min="0"
            value={formData.backgroundInfo.previousInternships}
            onChange={(e) => handleInputChange('backgroundInfo', 'previousInternships', parseInt(e.target.value))}
            placeholder="Number of previous internships"
          />
        </div>
        <div className="form-group full-width">
          <label>Relevant Projects (comma separated)</label>
          <input
            type="text"
            value={formData.backgroundInfo.relevantProjects.join(', ')}
            onChange={(e) => handleArrayInput('backgroundInfo', 'relevantProjects', e.target.value)}
            placeholder="Project 1, Project 2, etc."
          />
        </div>
        <div className="form-group full-width">
          <label>Skills (comma separated)</label>
          <input
            type="text"
            value={formData.backgroundInfo.skills.join(', ')}
            onChange={(e) => handleArrayInput('backgroundInfo', 'skills', e.target.value)}
            placeholder="JavaScript, Python, React, etc."
          />
        </div>
        <div className="form-group">
          <label>
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => handleInputChange(null, 'isAnonymous', e.target.checked)}
            />
            Share anonymously
          </label>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="form-section">
      <h2>Review & Submit</h2>
      <div className="review-summary">
        <div className="summary-card">
          <h3>{formData.companyInfo.companyName}</h3>
          <p>{formData.companyInfo.role}</p>
          <p>{formData.companyInfo.department} • {formData.companyInfo.internshipType}</p>
          <p>{formData.companyInfo.location}</p>
          <p className="result">{formData.finalResult}</p>
        </div>
        
        <div className="summary-stats">
          <div className="stat">
            <strong>{formData.rounds.length}</strong>
            <span>Rounds</span>
          </div>
          <div className="stat">
            <strong>{formData.overallRating}/5</strong>
            <span>Rating</span>
          </div>
          <div className="stat">
            <strong>{formData.preparationTime || 0}</strong>
            <span>Weeks Prep</span>
          </div>
        </div>

        <div className="final-checks">
          <h4>Before submitting, please ensure:</h4>
          <ul>
            <li>✅ All company information is accurate</li>
            <li>✅ Interview rounds are detailed with helpful tips</li>
            <li>✅ Questions and answers are clearly described</li>
            <li>✅ Tips will help other candidates</li>
            <li>✅ Personal information is appropriate for sharing</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="create-experience">
      <div className="create-header">
        <h1>Share Your Interview Experience</h1>
        <p>Help others succeed by sharing your interview journey</p>
      </div>

      {renderStepIndicator()}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && renderCompanyInfo()}
        {currentStep === 2 && renderRounds()}
        {currentStep === 3 && renderPreparation()}
        {currentStep === 4 && renderBackground()}
        {currentStep === 5 && renderReview()}

        <div className="form-navigation">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="nav-btn prev-btn">
              Previous
            </button>
          )}
          {currentStep < 5 ? (
            <button type="button" onClick={nextStep} className="nav-btn next-btn">
              Next
            </button>
          ) : (
            <button type="submit" disabled={loading} className="nav-btn submit-btn">
              {loading ? 'Creating...' : 'Create Experience'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default CreateExperience;
