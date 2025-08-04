import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import './CreateExperience_new.css';

const CreateExperience = () => {
  const navigate = useNavigate();
  // const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const errorRef = useRef(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  // Scroll to error when error state changes
  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [error]);

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

  const handleStringInput = (section, field, value) => {
    handleInputChange(section, field, value);
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
    <div className="psg-create-step-indicator">
      {[1, 2, 3, 4, 5].map(step => (
        <div 
          key={step} 
          className={`psg-create-step ${step === currentStep ? 'active' : step < currentStep ? 'completed' : ''}`}
        >
          <div className="psg-create-step-number">{step}</div>
          <div className="psg-create-step-label">
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
    <div className="psg-create-section">
      <div className="psg-create-section-header">
        <h2 className="psg-create-section-title">Company Information</h2>
        <div className="psg-create-section-divider"></div>
      </div>
      <div className="psg-create-grid">
        <div className="psg-create-field">
          <label className="psg-create-label psg-create-label-required">Company Name</label>
          <input
            type="text"
            className="psg-create-input"
            value={formData.companyInfo.companyName}
            onChange={(e) => handleInputChange('companyInfo', 'companyName', e.target.value)}
            placeholder="e.g., Google"
            required
          />
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label psg-create-label-required">Role</label>
          <input
            type="text"
            className="psg-create-input"
            value={formData.companyInfo.role}
            onChange={(e) => handleInputChange('companyInfo', 'role', e.target.value)}
            placeholder="e.g., Software Engineer Intern"
            required
          />
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label psg-create-label-required">Department</label>
          <input
            type="text"
            className="psg-create-input"
            value={formData.companyInfo.department}
            onChange={(e) => handleInputChange('companyInfo', 'department', e.target.value)}
            placeholder="e.g., Engineering"
            required
          />
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label">Internship Type</label>
          <select
            className="psg-create-select"
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
        <div className="psg-create-field">
          <label className="psg-create-label psg-create-label-required">Duration</label>
          <input
            type="text"
            className="psg-create-input"
            value={formData.companyInfo.duration}
            onChange={(e) => handleInputChange('companyInfo', 'duration', e.target.value)}
            placeholder="e.g., 3 months"
            required
          />
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label">Work Location</label>
          <select
            className="psg-create-select"
            value={formData.companyInfo.location}
            onChange={(e) => handleInputChange('companyInfo', 'location', e.target.value)}
          >
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label">City</label>
          <input
            type="text"
            className="psg-create-input"
            value={formData.companyInfo.city}
            onChange={(e) => handleInputChange('companyInfo', 'city', e.target.value)}
            placeholder="e.g., San Francisco"
          />
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label">Country</label>
          <input
            type="text"
            className="psg-create-input"
            value={formData.companyInfo.country}
            onChange={(e) => handleInputChange('companyInfo', 'country', e.target.value)}
            placeholder="e.g., USA"
          />
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label">Stipend</label>
          <div style={{display: 'flex', gap: 'var(--psg-create-spacing-sm)'}}>
            <select
              value={formData.companyInfo.currency}
              onChange={(e) => handleInputChange('companyInfo', 'currency', e.target.value)}
              className="psg-create-select"
              style={{maxWidth: '100px'}}
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
            </select>
            <input
              type="number"
              className="psg-create-input"
              value={formData.companyInfo.stipend}
              onChange={(e) => handleInputChange('companyInfo', 'stipend', e.target.value)}
              placeholder="Amount"
            />
          </div>
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label psg-create-label-required">Application Date</label>
          <input
            type="date"
            className="psg-create-input"
            value={formData.companyInfo.applicationDate}
            onChange={(e) => handleInputChange('companyInfo', 'applicationDate', e.target.value)}
          />
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label">Result Date</label>
          <input
            type="date"
            className="psg-create-input"
            value={formData.companyInfo.resultDate}
            onChange={(e) => handleInputChange('companyInfo', 'resultDate', e.target.value)}
          />
        </div>
      </div>
    </div>
  );

  const renderRounds = () => (
    <div className="psg-create-section">
      <div className="psg-create-section-header">
        <h2 className="psg-create-section-title">Interview Rounds</h2>
        <div className="psg-create-section-divider"></div>
        <button type="button" onClick={addRound} className="psg-create-btn psg-create-btn-primary psg-create-btn-sm">
          Add Round
        </button>
      </div>
      
      {formData.rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="psg-create-round-card">
          <div className="psg-create-round-header">
            <h3 className="psg-create-round-title">
              Round {round.roundNumber}
            </h3>
            {formData.rounds.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeRound(roundIndex)}
                className="psg-create-btn psg-create-btn-danger psg-create-btn-sm"
              >
                ✕ Remove
              </button>
            )}
          </div>

          <div className="psg-create-grid">
            <div className="psg-create-field">
              <label className="psg-create-label">Round Type</label>
              <select
                className="psg-create-select"
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
            <div className="psg-create-field">
              <label className="psg-create-label psg-create-label-required">Duration (minutes)</label>
              <input
                type="number"
                className="psg-create-input"
                value={round.duration}
                onChange={(e) => handleInputChange('rounds', 'duration', e.target.value ? parseInt(e.target.value) : '', roundIndex)}
                required
              />
            </div>
            <div className="psg-create-field">
              <label className="psg-create-label">Platform</label>
              <input
                type="text"
                className="psg-create-input"
                value={round.platform}
                onChange={(e) => handleInputChange('rounds', 'platform', e.target.value, roundIndex)}
                placeholder="e.g., Zoom, Teams, In-person"
              />
            </div>
            <div className="psg-create-field">
              <label className="psg-create-label">Round Result</label>
              <select
                className="psg-create-select"
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
          <div className="psg-create-question-section">
            <div className="psg-create-question-header">
              <h4 className="psg-create-question-title">Technical Questions</h4>
              <button 
                type="button" 
                onClick={() => addQuestion(roundIndex, 'technical')}
                className="psg-create-btn psg-create-btn-primary psg-create-btn-sm"
              >
                Add Question
              </button>
            </div>
            {round.technicalQuestions.map((question, qIndex) => (
              <div key={qIndex} className="psg-create-question-card">
                <div className="psg-create-question-meta">
                  <span className="psg-create-question-number">Q{qIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(roundIndex, qIndex, 'technical')}
                    className="psg-create-btn psg-create-btn-danger psg-create-btn-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="psg-create-grid">
                  <div className="psg-create-field psg-create-grid-full">
                    <label className="psg-create-label">Question</label>
                    <textarea
                      className="psg-create-textarea"
                      value={question.question}
                      onChange={(e) => updateQuestion(roundIndex, qIndex, 'question', e.target.value, 'technical')}
                      placeholder="Describe the technical question asked..."
                      rows="3"
                    />
                  </div>
                  <div className="psg-create-field">
                    <label className="psg-create-label">Difficulty</label>
                    <select
                      className="psg-create-select"
                      value={question.difficulty}
                      onChange={(e) => updateQuestion(roundIndex, qIndex, 'difficulty', e.target.value, 'technical')}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                  <div className="psg-create-field">
                    <label className="psg-create-label">Topics (comma separated)</label>
                    <input
                      type="text"
                      className="psg-create-input"
                      value={question.topics?.join(', ') || ''}
                      onChange={(e) => updateQuestion(roundIndex, qIndex, 'topics', e.target.value.split(',').map(t => t.trim()).filter(t => t), 'technical')}
                      placeholder="Arrays, Dynamic Programming, etc."
                    />
                  </div>
                  <div className="psg-create-field psg-create-grid-full">
                    <label className="psg-create-label">Solution Approach</label>
                    <textarea
                      className="psg-create-textarea"
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
          <div className="psg-create-question-section">
            <div className="psg-create-question-header">
              <h4 className="psg-create-question-title">Behavioral Questions</h4>
              <button 
                type="button" 
                onClick={() => addQuestion(roundIndex, 'behavioral')}
                className="psg-create-btn psg-create-btn-primary psg-create-btn-sm"
              >
                Add Question
              </button>
            </div>
            {round.behavioralQuestions.map((question, qIndex) => (
              <div key={qIndex} className="psg-create-question-card">
                <div className="psg-create-question-meta">
                  <span className="psg-create-question-number">Q{qIndex + 1}</span>
                  <button
                    type="button"
                    onClick={() => removeQuestion(roundIndex, qIndex, 'behavioral')}
                    className="psg-create-btn psg-create-btn-danger psg-create-btn-sm"
                  >
                    ✕
                  </button>
                </div>
                <div className="psg-create-grid">
                  <div className="psg-create-field psg-create-grid-full">
                    <label className="psg-create-label">Question</label>
                    <textarea
                      className="psg-create-textarea"
                      value={question.question}
                      onChange={(e) => updateQuestion(roundIndex, qIndex, 'question', e.target.value, 'behavioral')}
                      placeholder="Describe the behavioral question asked..."
                      rows="2"
                    />
                  </div>
                  <div className="psg-create-field">
                    <label className="psg-create-label">Category</label>
                    <select
                      className="psg-create-select"
                      value={question.category}
                      onChange={(e) => updateQuestion(roundIndex, qIndex, 'category', e.target.value, 'behavioral')}
                    >
                      <option value="Personal">Personal</option>
                      <option value="Behavioral">Behavioral</option>
                      <option value="Situational">Situational</option>
                      <option value="Company-specific">Company-specific</option>
                    </select>
                  </div>
                  <div className="psg-create-field psg-create-grid-full">
                    <label className="psg-create-label">Your Answer</label>
                    <textarea
                      className="psg-create-textarea"
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

          <div className="psg-create-grid">
            <div className="psg-create-field">
              <label className="psg-create-label">Overall Experience (1-5)</label>
              <select
                className="psg-create-select"
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

          <div className="psg-create-field psg-create-grid-full">
            <label className="psg-create-label psg-create-label-required">Tips for this round</label>
            <textarea
              className="psg-create-textarea"
              value={round.tips}
              onChange={(e) => handleInputChange('rounds', 'tips', e.target.value, roundIndex)}
              placeholder="Share tips and advice for this specific round..."
              rows="3"
            />
          </div>

          <div className="psg-create-field psg-create-grid-full">
            <label className="psg-create-label">Feedback Received</label>
            <textarea
              className="psg-create-textarea"
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
    <div className="psg-create-section">
      <div className="psg-create-section-header">
        <h2 className="psg-create-section-title">Preparation & Tips</h2>
        <div className="psg-create-section-divider"></div>
      </div>
      <div className="psg-create-grid">
        <div className="psg-create-field">
          <label className="psg-create-label psg-create-label-required">Preparation Time (weeks)</label>
          <input
            type="number"
            className="psg-create-input"
            value={formData.preparationTime}
            onChange={(e) => handleInputChange(null, 'preparationTime', e.target.value ? parseInt(e.target.value) : '')}
            placeholder="How many weeks did you prepare?"
          />
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label">Overall Rating (1-5)</label>
          <select
            className="psg-create-select"
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
        <div className="psg-create-field psg-create-grid-full">
          <label className="psg-create-label psg-create-label-required">Overall Experience Summary</label>
          <textarea
            className="psg-create-textarea"
            value={formData.overallExperience}
            onChange={(e) => handleInputChange(null, 'overallExperience', e.target.value)}
            placeholder="Summarize your overall interview experience in a few sentences..."
            rows="3"
          />
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label">Final Result</label>
          <select
            className="psg-create-select"
            value={formData.finalResult}
            onChange={(e) => handleInputChange(null, 'finalResult', e.target.value)}
          >
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label">Would you recommend this company?</label>
          <select
            className="psg-create-select"
            value={formData.wouldRecommend}
            onChange={(e) => handleInputChange(null, 'wouldRecommend', e.target.value === 'true')}
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>
        <div className="psg-create-field psg-create-grid-full">
          <label className="psg-create-label">Resources Used (comma separated)</label>
          <input
            type="text"
            className="psg-create-input"
            value={Array.isArray(formData.resourcesUsed) ? formData.resourcesUsed.join(', ') : formData.resourcesUsed || ''}
            onChange={(e) => handleStringInput(null, 'resourcesUsed', e.target.value)}
            onBlur={(e) => handleArrayInput(null, 'resourcesUsed', e.target.value)}
            placeholder="LeetCode, GeeksforGeeks, System Design Primer, etc."
          />
        </div>
        <div className="psg-create-field psg-create-grid-full">
          <label className="psg-create-label psg-create-label-required">Key Tips</label>
          <textarea
            className="psg-create-textarea"
            value={formData.keyTips}
            onChange={(e) => handleInputChange(null, 'keyTips', e.target.value)}
            placeholder="Share your most important tips for others..."
            rows="4"
            required
          />
        </div>
        <div className="psg-create-field psg-create-grid-full">
          <label className="psg-create-label psg-create-label-required">Mistakes to Avoid</label>
          <textarea
            className="psg-create-textarea"
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
    <div className="psg-create-section">
      <div className="psg-create-section-header">
        <h2 className="psg-create-section-title">Background Information</h2>
        <div className="psg-create-section-divider"></div>
      </div>
      <div className="psg-create-grid">
        <div className="psg-create-field">
          <label className="psg-create-label psg-create-label-required">Year of Study</label>
          <select
            className="psg-create-select"
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
        <div className="psg-create-field">
          <label className="psg-create-label">CGPA</label>
          <input
            type="number"
            className="psg-create-input"
            step="0.01"
            min="0"
            max="10"
            value={formData.backgroundInfo.cgpa}
            onChange={(e) => handleInputChange('backgroundInfo', 'cgpa', e.target.value ? parseFloat(e.target.value) : '')}
            placeholder="e.g., 8.5"
          />
        </div>
        <div className="psg-create-field">
          <label className="psg-create-label">Previous Internships</label>
          <input
            type="number"
            className="psg-create-input"
            min="0"
            value={formData.backgroundInfo.previousInternships}
            onChange={(e) => handleInputChange('backgroundInfo', 'previousInternships', e.target.value ? parseInt(e.target.value) : '')}
            placeholder="Number of previous internships"
          />
        </div>
        <div className="psg-create-field psg-create-grid-full">
          <label className="psg-create-label">Relevant Projects (comma separated)</label>
          <input
            type="text"
            className="psg-create-input"
            value={Array.isArray(formData.backgroundInfo.relevantProjects) ? formData.backgroundInfo.relevantProjects.join(', ') : formData.backgroundInfo.relevantProjects || ''}
            onChange={(e) => handleStringInput('backgroundInfo', 'relevantProjects', e.target.value)}
            onBlur={(e) => handleArrayInput('backgroundInfo', 'relevantProjects', e.target.value)}
            placeholder="Project 1, Project 2, etc."
          />
        </div>
        <div className="psg-create-field psg-create-grid-full">
          <label className="psg-create-label">Skills (comma separated)</label>
          <input
            type="text"
            className="psg-create-input"
            value={Array.isArray(formData.backgroundInfo.skills) ? formData.backgroundInfo.skills.join(', ') : formData.backgroundInfo.skills || ''}
            onChange={(e) => handleStringInput('backgroundInfo', 'skills', e.target.value)}
            onBlur={(e) => handleArrayInput('backgroundInfo', 'skills', e.target.value)}
            placeholder="JavaScript, Python, React, etc."
          />
        </div>
        <div className="psg-create-field">
          <label style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}}>
            <input
              type="checkbox"
              checked={formData.isAnonymous}
              onChange={(e) => handleInputChange(null, 'isAnonymous', e.target.checked)}
              style={{width: 'auto', margin: 0}}
            />
            <span className="psg-create-label" style={{margin: 0, padding: 0}}>Share anonymously</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="psg-create-section">
      <div className="psg-create-section-header">
        <h2 className="psg-create-section-title">Review & Submit</h2>
        <div className="psg-create-section-divider"></div>
      </div>
      <div className="psg-create-grid">
        <div className="psg-create-round-card" style={{gridColumn: '1 / -1'}}>
          <h3 style={{color: 'var(--psg-create-primary)', marginBottom: 'var(--psg-create-spacing-lg)'}}>{formData.companyInfo.companyName}</h3>
          <p style={{fontSize: '1.125rem', fontWeight: '600', marginBottom: 'var(--psg-create-spacing-sm)'}}>{formData.companyInfo.role}</p>
          <p style={{color: 'var(--psg-create-gray-600)', marginBottom: 'var(--psg-create-spacing-md)'}}>{formData.companyInfo.department} • {formData.companyInfo.internshipType}</p>
          <p style={{color: 'var(--psg-create-gray-600)', marginBottom: 'var(--psg-create-spacing-md)'}}>{formData.companyInfo.location}</p>
          <p style={{
            padding: 'var(--psg-create-spacing-sm) var(--psg-create-spacing-md)',
            background: formData.finalResult === 'Selected' ? 'var(--psg-create-success)' : 'var(--psg-create-danger)',
            color: 'white',
            borderRadius: 'var(--psg-create-radius-md)',
            display: 'inline-block',
            fontWeight: '600'
          }}>{formData.finalResult}</p>
        </div>
        
        <div style={{display: 'flex', gap: 'var(--psg-create-spacing-xl)', justifyContent: 'center', gridColumn: '1 / -1'}}>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '2rem', fontWeight: '700', color: 'var(--psg-create-primary)'}}>{formData.rounds.length}</div>
            <div style={{color: 'var(--psg-create-gray-600)', fontSize: '0.875rem'}}>Rounds</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '2rem', fontWeight: '700', color: 'var(--psg-create-primary)'}}>{formData.overallRating}/5</div>
            <div style={{color: 'var(--psg-create-gray-600)', fontSize: '0.875rem'}}>Rating</div>
          </div>
          <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '2rem', fontWeight: '700', color: 'var(--psg-create-primary)'}}>{formData.preparationTime || 0}</div>
            <div style={{color: 'var(--psg-create-gray-600)', fontSize: '0.875rem'}}>Weeks Prep</div>
          </div>
        </div>

        <div className="psg-create-round-card" style={{gridColumn: '1 / -1'}}>
          <h4 style={{color: 'var(--psg-create-gray-800)', marginBottom: 'var(--psg-create-spacing-lg)'}}>Before submitting, please ensure:</h4>
          <ul style={{listStyle: 'none', padding: 0}}>
            <li style={{marginBottom: 'var(--psg-create-spacing-sm)', color: 'var(--psg-create-success)'}}>✅ All company information is accurate</li>
            <li style={{marginBottom: 'var(--psg-create-spacing-sm)', color: 'var(--psg-create-success)'}}>✅ Interview rounds are detailed with helpful tips</li>
            <li style={{marginBottom: 'var(--psg-create-spacing-sm)', color: 'var(--psg-create-success)'}}>✅ Questions and answers are clearly described</li>
            <li style={{marginBottom: 'var(--psg-create-spacing-sm)', color: 'var(--psg-create-success)'}}>✅ Tips will help other candidates</li>
            <li style={{marginBottom: 'var(--psg-create-spacing-sm)', color: 'var(--psg-create-success)'}}>✅ Personal information is appropriate for sharing</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="psg-create-container">
      <div className="psg-create-card">
        <div className="psg-create-header">
          <div className="psg-create-header-content">
            <h1 className="psg-create-title">
              <span className="psg-create-title-icon">📝</span>
              Share Your Interview Experience
            </h1>
            <p className="psg-create-subtitle">Help others succeed by sharing your interview journey</p>
          </div>
        </div>

        {renderStepIndicator()}

        {error && (
          <div ref={errorRef} className="psg-create-error">
            <span className="psg-create-error-icon">⚠️</span>
            {error}
          </div>
        )}

      <form onSubmit={handleSubmit}>
        {currentStep === 1 && renderCompanyInfo()}
        {currentStep === 2 && renderRounds()}
        {currentStep === 3 && renderPreparation()}
        {currentStep === 4 && renderBackground()}
        {currentStep === 5 && renderReview()}

        <div className="psg-create-actions">
          {currentStep > 1 && (
            <button type="button" onClick={prevStep} className="psg-create-btn psg-create-btn-ghost">
              ← Previous
            </button>
          )}
          {currentStep < 5 ? (
            <button type="button" onClick={nextStep} className="psg-create-btn psg-create-btn-primary">
              Next →
            </button>
          ) : (
            <button type="submit" disabled={loading} className="psg-create-btn psg-create-btn-secondary psg-create-btn-lg">
              {loading ? 'Creating...' : '✨ Create Experience'}
            </button>
          )}
        </div>
      </form>
      </div>
    </div>
  );
};

export default CreateExperience;
