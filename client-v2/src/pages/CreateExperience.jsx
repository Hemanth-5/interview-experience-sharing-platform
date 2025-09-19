import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import CompanySearch from '../components/CompanySearch';
import MarkdownEditor from '../components/MarkdownEditor';
// import DesktopOnlyPrompt from '../components/DesktopOnlyPrompt';
import { useIsDesktopRequired } from '../utils/deviceDetection';
import {
  X, 
  Building, 
  MapPin, 
  Calendar, 
  Star, 
  Tag, 
  BookOpen, 
  Lightbulb, 
  CheckCircle,
  ClipboardCheck,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Plus,
  Minus,
  Code,
  Brain,
  Timer,
  Target,
  Trash2,
  Edit3,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader,
  RefreshCw
} from "lucide-react";

// Custom DatePicker Component
const DatePicker = ({ value, onChange, placeholder, required = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(value ? new Date(value) : null);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const formatDate = (date) => {
    if (!date) return '';
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDay = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    onChange(formatDate(date));
    setIsOpen(false);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const isToday = (date) => {
    const today = new Date();
    return date && 
           date.getDate() === today.getDate() &&
           date.getMonth() === today.getMonth() &&
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date) => {
    return selectedDate &&
           date &&
           date.getDate() === selectedDate.getDate() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getFullYear() === selectedDate.getFullYear();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div 
        className="w-full px-4 py-2 border border-border rounded-lg bg-background cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-colors flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedDate ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedDate ? formatDisplayDate(selectedDate) : placeholder}
        </span>
        <Calendar className="w-4 h-4 text-muted-foreground" />
      </div>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-1 bg-card border border-border rounded-lg shadow-2xl p-4 min-w-[300px]" style={{ zIndex: 999999 }}>
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <h3 className="font-semibold text-foreground">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {getDaysInMonth(currentDate).map((date, index) => (
              <button
                key={index}
                type="button"
                className={`p-2 text-sm rounded transition-colors ${
                  !date 
                    ? 'invisible' 
                    : isSelected(date)
                    ? 'bg-blue-600 text-white'
                    : isToday(date)
                    ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                    : 'hover:bg-secondary text-foreground'
                }`}
                onClick={() => date && handleDateSelect(date)}
                disabled={!date}
              >
                {date?.getDate()}
              </button>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mt-4 pt-4 border-t border-border flex justify-between">
            <button
              type="button"
              onClick={() => handleDateSelect(new Date())}
              className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors"
            >
              Today
            </button>
            {selectedDate && (
              <button
                type="button"
                onClick={() => {
                  setSelectedDate(null);
                  onChange('');
                  setIsOpen(false);
                }}
                className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Hidden input for form validation */}
      <input
        type="hidden"
        value={value}
        required={required}
      />
    </div>
  );
};

// Auto-save hook
const useAutoSave = (formData, key = 'createExperience_draft') => {
  const [lastSaved, setLastSaved] = useState(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);

  // Check if form has meaningful data
  const hasSignificantData = (data) => {
    return data.companyInfo.companyName?.trim() || 
           data.companyInfo.role?.trim() ||
           data.rounds.some(round => 
             round.technicalQuestions.length > 0 || 
             round.behavioralQuestions.length > 0 ||
             round.tips?.trim()
           );
  };

  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      // console.log('Auto-save check - saving all data:', formData);
      setIsAutoSaving(true);
      const saveData = {
        formData,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(key, JSON.stringify(saveData));
      setLastSaved(Date.now());
      // console.log('Auto-save completed');
      setTimeout(() => setIsAutoSaving(false), 500);
    }, 5000); // Save every 5 seconds

    return () => clearInterval(autoSaveInterval);
  }, [formData, key]);

  // Immediate save on form changes (debounced)
  useEffect(() => {
    const debouncedSave = setTimeout(() => {
      // console.log('Debounced save triggered:', formData);
      const saveData = {
        formData,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(key, JSON.stringify(saveData));
      setLastSaved(Date.now());
    }, 1000); // Save 1 second after user stops typing

    return () => clearTimeout(debouncedSave);
  }, [formData, key]);

  const clearSavedData = () => {
    localStorage.removeItem(key);
    setLastSaved(null);
  };

  const getSavedData = () => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsedData = JSON.parse(saved);
        // Check if data is not older than 7 days
        if (Date.now() - parsedData.timestamp < 7 * 24 * 60 * 60 * 1000) {
          return parsedData;
        } else {
          // Remove expired data
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
      localStorage.removeItem(key); // Remove corrupted data
    }
    return null;
  };

  const manualSave = () => {
    // console.log('Manual save triggered - saving all data:', formData);
    const saveData = {
      formData,
      timestamp: Date.now(),
      version: '1.0'
    };
    localStorage.setItem(key, JSON.stringify(saveData));
    setLastSaved(Date.now());
    // console.log('Manual save completed');
    return true;
  };

  return { lastSaved, isAutoSaving, clearSavedData, getSavedData, manualSave };
};

// Recovery Modal Component
const UnsavedChangesModal = ({ isOpen, onRestore, onDiscard, savedData }) => {
  if (!isOpen || !savedData) return null;

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const modalContent = (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-2xl max-w-md w-full">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Unsaved Changes Found</h3>
              <p className="text-sm text-muted-foreground">
                Last saved: {formatDate(savedData.timestamp)}
              </p>
            </div>
          </div>
          
          <p className="text-muted-foreground mb-6">
            We found an unsaved draft of your experience. Would you like to restore it and continue where you left off?
          </p>
          
          <div className="bg-muted/50 rounded-lg p-3 mb-6">
            <p className="text-sm font-medium mb-2">Draft contains:</p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {savedData.formData.companyInfo.companyName && (
                <li>• Company: {savedData.formData.companyInfo.companyName}</li>
              )}
              {savedData.formData.companyInfo.role && (
                <li>• Role: {savedData.formData.companyInfo.role}</li>
              )}
              <li>• {savedData.formData.rounds.length} interview round(s)</li>
              {savedData.formData.keyTips && (
                <li>• Key tips and preparation notes</li>
              )}
            </ul>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onRestore}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Load Changes</span>
            </button>
            <button
              onClick={onDiscard}
              className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Start Fresh
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

// Auto-save Indicator Component
const AutoSaveIndicator = ({ lastSaved, isAutoSaving }) => {
  if (!lastSaved && !isAutoSaving) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg px-3 py-2 shadow-lg z-40">
      <div className="flex items-center space-x-2 text-sm">
        {isAutoSaving ? (
          <>
            <Loader className="w-4 h-4 animate-spin text-blue-600" />
            <span className="text-muted-foreground">Saving draft...</span>
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-muted-foreground">
              Saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

const CreateExperience = () => {
  const navigate = useNavigate();
  const location = useLocation();
  // const { user } = useAuth();
  // const isDesktopRequired = useIsDesktopRequired();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const errorRef = useRef(null);

  // Auto-save related state
  const [showRecoveryModal, setShowRecoveryModal] = useState(false);
  const [savedDraft, setSavedDraft] = useState(null);

  // Early return for mobile users
  // if (isDesktopRequired) {
  //   return <DesktopOnlyPrompt />;
  // }

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
      stipend: '',
      currency: 'INR',
      applicationDate: '',
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
    isAnonymous: false
  });

  // Auto-save functionality
  const { lastSaved, isAutoSaving, clearSavedData, getSavedData, manualSave } = useAutoSave(formData);

  // Check for saved data on component mount
  useEffect(() => {
    const saved = getSavedData();
    if (saved) {
      setSavedDraft(saved);
      setShowRecoveryModal(true);
    }
  }, []);

  // Handle restoring draft
  const handleRestoreDraft = () => {
    if (savedDraft) {
      setFormData(savedDraft.formData);
      setShowRecoveryModal(false);
      setSavedDraft(null);
      // Optionally show a success message
    }
  };

  // Handle discarding draft - THIS IS THE KEY PART FOR YOUR REQUIREMENT
  const handleDiscardDraft = () => {
    clearSavedData(); // This removes the saved data from localStorage
    setShowRecoveryModal(false);
    setSavedDraft(null);
  };

  // Prefill logic from ?prefill param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const prefill = params.get('prefill');
    if (prefill) {
      try {
        // Decode base64-encoded, URI-encoded JSON
        const decoded = JSON.parse(
          decodeURIComponent(
            escape(window.atob(decodeURIComponent(prefill)))
          )
        );
        // Defensive: Only update fields that exist in our formData
        setFormData(prev => ({
          ...prev,
          ...decoded,
          companyInfo: {
            ...prev.companyInfo,
            ...decoded.companyInfo
          },
          rounds: Array.isArray(decoded.rounds) && decoded.rounds.length > 0
            ? decoded.rounds.map((r, i) => ({
                ...prev.rounds[0],
                ...r,
                roundNumber: i + 1
              }))
            : prev.rounds
        }));
      } catch (e) {
        // Ignore prefill errors
      }
    }
    // eslint-disable-next-line
  }, []);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [pendingCompany, setPendingCompany] = useState(null); // For companies to be created
  const [pendingAppDatabaseCompany, setPendingAppDatabaseCompany] = useState(null); // For AppDatabase companies

  const handleCompanySelection = (company) => {
    setSelectedCompany(company);
    if (company?.isPending) {
      setPendingCompany(company.pendingName);
      setPendingAppDatabaseCompany(null);
    } else if (company?.isFromAppDatabase || company?.isAppDatabaseVerified) {
      setPendingAppDatabaseCompany(company);
      setPendingCompany(null);
    } else {
      setPendingCompany(null);
      setPendingAppDatabaseCompany(null);
    }
  };

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
      : { question: '', category: 'Personal', yourAnswer: '' };

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
      case 1: // Company Info - companyName, role, department, internshipType, duration, location, applicationDate are required
        return (
          formData.companyInfo.companyName && 
          formData.companyInfo.role && 
          formData.companyInfo.department && 
          formData.companyInfo.internshipType && 
          formData.companyInfo.duration && 
          formData.companyInfo.location && 
          formData.companyInfo.applicationDate
        );
      case 2: // Rounds - Each round needs roundType, duration, roundResult, overallExperience, and at least tips
        return formData.rounds.every(round => 
          round.roundType && 
          round.duration && 
          Number(round.duration) > 0 && 
          round.roundResult && 
          round.overallExperience && 
          round.overallExperience >= 1 && 
          round.overallExperience <= 5
        );
      case 3: // Preparation - overallRating, finalResult, wouldRecommend, preparationTime, keyTips, mistakesToAvoid are required
        return (
          formData.overallRating && 
          formData.overallRating >= 1 && 
          formData.overallRating <= 5 && 
          formData.finalResult && 
          formData.wouldRecommend !== undefined && 
          formData.preparationTime !== '' && 
          Number(formData.preparationTime) >= 0 && 
          formData.keyTips && 
          formData.mistakesToAvoid
        );
      case 4: // Review - All previous validations should pass
        return (
          validateStep(1) && 
          validateStep(2) && 
          validateStep(3)
        );
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
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
      let submissionData = { ...formData };

      // Handle pending company creation
      if ((pendingCompany && !selectedCompany?._id) || pendingAppDatabaseCompany) {
        try {
          let companyData;
          
          if (pendingAppDatabaseCompany) {
            // Create company from AppDatabase data
            companyData = {
              name: pendingAppDatabaseCompany.displayName || pendingAppDatabaseCompany.name,
              linkedinId: pendingAppDatabaseCompany.linkedinId,
              requireAppDatabaseValidation: false // Skip validation since it's from AppDatabase
            };
          } else {
            // Create regular company
            companyData = {
              companyName: pendingCompany,
              requireAppDatabaseValidation: true // Enable AppDatabase validation
            };
          }

          // Create the company first
          const companyResponse = await axios.post(createApiUrl('/api/companies'), companyData, {
            withCredentials: true
          });

          if (companyResponse.data.success) {
            const createdCompany = companyResponse.data.data;
            submissionData.companyInfo.companyId = createdCompany._id;
            submissionData.companyInfo.companyName = createdCompany.displayName;
          }
        } catch (companyError) {
          console.warn('Failed to create company, proceeding without company ID:', companyError);
          
          // If AppDatabase validation failed, show specific error
          if (companyError.response?.data?.code === 'LINKEDIN_VALIDATION_FAILED') {
            setError(`Company "${pendingCompany}" not found on AppDatabase. Please select a AppDatabase-verified company or contact support.`);
            setLoading(false);
            return;
          }
          // Continue with submission even if company creation fails
        }
      }

      const response = await axios.post(createApiUrl('/api/experiences'), submissionData, {
        withCredentials: true
      });

      if (response.data.success) {
        // Clear saved draft on successful submission
        clearSavedData();
        navigate(`/experiences/${response.data.data._id}`);
      }
    } catch (error) {
      // setError(error.response?.data?.message || 'Failed to create experience');
      // The error may contains multiple errors in "data.errors" so join all errors.message
      const errorMessage = error.response?.data?.errors ? error.response?.data?.errors.map(err => err.message).join(', ') || 'Failed to create experience' : error.response?.data?.error || 'Failed to create experience';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  const renderStepIndicator = () => (
    <div className="relative mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3, 4].map((step) => (
          <div
            key={step}
            className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300 ${
              step <= currentStep
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'border-border bg-background text-muted-foreground'
            }`}
          >
            {step < currentStep ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <span className="font-medium">{step}</span>
            )}
          </div>
        ))}
      </div>
      <div className="absolute top-5 left-5 right-5 h-0.5 bg-border -z-10">
        <div
          className="h-full bg-blue-600 transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground mt-2">
        <span>Company</span>
        <span>Rounds</span>
        <span>Preparation</span>
        <span>Review</span>
      </div>
    </div>
  );

  const renderCompanyInfo = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-6">
        <Building className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Company Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Company Name *</label>
          <CompanySearch
            value={formData.companyInfo.companyName}
            onChange={(value) => handleInputChange('companyInfo', 'companyName', value)}
            onCompanySelect={(company) => {
              handleCompanySelection(company);
              if (company && !company.isPending) {
                handleInputChange('companyInfo', 'companyName', company.displayName);
                handleInputChange('companyInfo', 'companyId', company._id);
              } else if (company?.isPending) {
                handleInputChange('companyInfo', 'companyName', company.displayName);
              }
            }}
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Google"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Role/Position *</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.companyInfo.role}
            onChange={(e) => handleInputChange('companyInfo', 'role', e.target.value)}
            placeholder="e.g., Software Engineer Intern"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Business Department *</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.companyInfo.department}
            onChange={(e) => handleInputChange('companyInfo', 'department', e.target.value)}
            placeholder="e.g., Engineering"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Internship Type</label>
          <select
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.companyInfo.internshipType}
            onChange={(e) => handleInputChange('companyInfo', 'internshipType', e.target.value)}
          >
            <option value="Summer">Summer Internship</option>
            <option value="Winter">Winter Internship</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="PPO">PPO</option>
            <option value="Contract">Contract</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Work Location</label>
          <select
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.companyInfo.location}
            onChange={(e) => handleInputChange('companyInfo', 'location', e.target.value)}
          >
            <option value="Remote">Remote</option>
            <option value="On-site">On-site</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">City</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.companyInfo.city}
            onChange={(e) => handleInputChange('companyInfo', 'city', e.target.value)}
            placeholder="e.g., Bangalore"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Duration *</label>
          <input
            type="text"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.companyInfo.duration}
            onChange={(e) => handleInputChange('companyInfo', 'duration', e.target.value)}
            placeholder="e.g., 3 months"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Monthly Stipend</label>
          <div className="flex">
            <select
              value={formData.companyInfo.currency}
              onChange={(e) => handleInputChange('companyInfo', 'currency', e.target.value)}
              className="w-20 px-2 py-2 border border-border rounded-l-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INR">INR</option>
              <option value="USD">USD</option>
            </select>
            <input
              type="number"
              className="flex-1 px-4 py-2 border border-border rounded-r-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border-l-0"
              value={formData.companyInfo.stipend}
              onChange={(e) => handleInputChange('companyInfo', 'stipend', e.target.value)}
              placeholder="50000"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Application Date *</label>
          <DatePicker
            value={formData.companyInfo.applicationDate}
            onChange={(value) => handleInputChange('companyInfo', 'applicationDate', value)}
            placeholder="Select application date"
            required
          />
        </div>
      </div>

      {/* <div>
        <label className="block text-sm font-medium text-foreground mb-1">Result Date</label>
        <DatePicker
          value={formData.companyInfo.resultDate}
          onChange={(value) => handleInputChange('companyInfo', 'resultDate', value)}
          placeholder="Select result date (optional)"
        />
      </div> */}
    </div>
  );

  const renderRounds = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400">
          <Target className="w-5 h-5" />
          <h2 className="text-xl font-semibold">Interview Rounds</h2>
        </div>
      </div>
      
      {formData.rounds.map((round, roundIndex) => (
        <div key={roundIndex} className="bg-card border-2 border-dashed border-border rounded-2xl shadow-lg">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Round {round.roundNumber}</h3>
              {formData.rounds.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removeRound(roundIndex)}
                  className="flex items-center space-x-1 px-3 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Remove</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Round Type *</label>
                <select
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={round.roundType}
                  onChange={(e) => handleInputChange('rounds', 'roundType', e.target.value, roundIndex)}
                  required
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
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Duration (minutes) *</label>
                <input
                  type="number"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={round.duration}
                  onChange={(e) => handleInputChange('rounds', 'duration', e.target.value ? parseInt(e.target.value) : '', roundIndex)}
                  placeholder="60"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Platform</label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={round.platform}
                  onChange={(e) => handleInputChange('rounds', 'platform', e.target.value, roundIndex)}
                  placeholder="e.g., Zoom, Teams, In-person"
                />
              </div>
            </div>

            {/* Technical Questions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center space-x-2">
                  <Code className="w-4 h-4 text-blue-600" />
                  <span>Technical Questions</span>
                </h4>
              </div>
              
              {round.technicalQuestions.map((question, qIndex) => (
                <div key={qIndex} className="mb-4 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-blue-600">Technical Q{qIndex + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(roundIndex, qIndex, 'technical')}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <MarkdownEditor
                          label="Question"
                          value={question.question}
                          onChange={(value) => updateQuestion(roundIndex, qIndex, 'question', value, 'technical')}
                          placeholder="Describe the technical question asked...

**Example:**
Given an array of integers, find the number of triplets that can form a triangle.

### Constraints:
- Array length: 1 ≤ n ≤ 1000
- Values: 1 ≤ arr[i] ≤ 100"
                          rows={4}
                          required
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Difficulty *</label>
                          <select
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={question.difficulty}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'difficulty', e.target.value, 'technical')}
                            required
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Topics (comma separated)</label>
                          <input
                            type="text"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={Array.isArray(question.topics) ? question.topics.join(', ') : (question.topics || '')}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'topics', e.target.value, 'technical')}
                            onBlur={(e) => updateQuestion(roundIndex, qIndex, 'topics', e.target.value.split(',').map(t => t.trim()).filter(t => t), 'technical')}
                            placeholder="Arrays, Dynamic Programming, etc."
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">LeetCode Link</label>
                          <input
                            type="url"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={question.leetcodeLink || ''}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'leetcodeLink', e.target.value, 'technical')}
                            placeholder="https://leetcode.com/problems/..."
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Time Given (minutes)</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={question.timeGiven || ''}
                            onChange={(e) => updateQuestion(roundIndex, qIndex, 'timeGiven', e.target.value ? parseInt(e.target.value) : '', 'technical')}
                            placeholder="30"
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <MarkdownEditor
                          label="Solution Approach"
                          value={question.solution}
                          onChange={(value) => updateQuestion(roundIndex, qIndex, 'solution', value, 'technical')}
                          placeholder="Describe your approach to solving this question...

**Example formatting:**
### Algorithm Approach
- Sort the array 
- Use `binary search` for optimization
- Time complexity: *O(n log n)*

```
def solution():
    return result
```"
                          rows={6}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    addQuestion(roundIndex, 'technical');
                  }} 
                  className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Technical Question</span>
                </button>
              </div>

            </div>

            {/* Behavioral Questions */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center space-x-2">
                  <Brain className="w-4 h-4 text-green-600" />
                  <span>Behavioral Questions</span>
                </h4>
              </div>
              
              {round.behavioralQuestions.map((question, qIndex) => (
                <div key={qIndex} className="mb-4 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-green-600">Behavioral Q{qIndex + 1}</span>
                      <button
                        type="button"
                        onClick={() => removeQuestion(roundIndex, qIndex, 'behavioral')}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <MarkdownEditor
                          label="Question"
                          value={question.question}
                          onChange={(value) => updateQuestion(roundIndex, qIndex, 'question', value, 'behavioral')}
                          placeholder="Describe the behavioral question asked...

**Examples:**
- Tell me about a time when you faced a challenging problem
- Describe a situation where you had to work with a difficult team member
- How do you handle tight deadlines?"
                          rows={3}
                          required
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Category *</label>
                        <select
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={question.category}
                          onChange={(e) => updateQuestion(roundIndex, qIndex, 'category', e.target.value, 'behavioral')}
                          required
                        >
                          <option value="Personal">Personal</option>
                          <option value="Behavioral">Behavioral</option>
                          <option value="Situational">Situational</option>
                          <option value="Company-specific">Company-specific</option>
                        </select>
                      </div>
                      
                      <div>
                        <MarkdownEditor
                          label="Your Answer"
                          value={question.yourAnswer}
                          onChange={(value) => updateQuestion(roundIndex, qIndex, 'yourAnswer', value, 'behavioral')}
                          placeholder="How did you answer this question?

Use the **STAR method**:
### Situation
Describe the context...

### Task
What needed to be done...

### Action
What actions you took...

### Result
What was the outcome..."
                          rows={5}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={(e) => {
                    e.preventDefault();
                    addQuestion(roundIndex, 'behavioral');
                  }} 
                  className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Behavioral Question</span>
                </button>
              </div>
            </div>

            {/* MCQ Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-semibold flex items-center space-x-2">
                  <Timer className="w-4 h-4 text-purple-600" />
                  <span>MCQ/Online Assessment</span>
                </h4>
              </div>
              
              {(round.mcqSection.totalQuestions || round.mcqSection.timeLimit || round.mcqSection.cutoff || 
                (Array.isArray(round.mcqSection.topics) && round.mcqSection.topics.length > 0) ||
                (typeof round.mcqSection.topics === 'string' && round.mcqSection.topics.trim())) ? (
                <div className="border border-purple-200 dark:border-purple-800 rounded-lg">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-purple-600">MCQ Assessment Details</span>
                      <button
                        type="button"
                        onClick={() => handleInputChange('rounds', 'mcqSection', {
                          totalQuestions: '',
                          timeLimit: '',
                          topics: [],
                          difficulty: 'Medium',
                          cutoff: ''
                        }, roundIndex)}
                        className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Total Questions</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={round.mcqSection.totalQuestions}
                            onChange={(e) => handleInputChange('rounds', 'mcqSection', { ...round.mcqSection, totalQuestions: e.target.value ? parseInt(e.target.value) : '' }, roundIndex)}
                            placeholder="50"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Time Limit (minutes)</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={round.mcqSection.timeLimit}
                            onChange={(e) => handleInputChange('rounds', 'mcqSection', { ...round.mcqSection, timeLimit: e.target.value ? parseInt(e.target.value) : '' }, roundIndex)}
                            placeholder="60"
                            min="1"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Difficulty Level</label>
                          <select
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={round.mcqSection.difficulty}
                            onChange={(e) => handleInputChange('rounds', 'mcqSection', { ...round.mcqSection, difficulty: e.target.value }, roundIndex)}
                          >
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">Cutoff Percentage</label>
                          <input
                            type="number"
                            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={round.mcqSection.cutoff}
                            onChange={(e) => handleInputChange('rounds', 'mcqSection', { ...round.mcqSection, cutoff: e.target.value ? parseFloat(e.target.value) : '' }, roundIndex)}
                            placeholder="70"
                            min="0"
                            max="100"
                            step="0.1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-foreground mb-1">Topics Covered (comma separated)</label>
                        <input
                          type="text"
                          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          value={Array.isArray(round.mcqSection.topics) ? round.mcqSection.topics.join(', ') : (round.mcqSection.topics || '')}
                          onChange={(e) => handleInputChange('rounds', 'mcqSection', { ...round.mcqSection, topics: e.target.value }, roundIndex)}
                          onBlur={(e) => handleInputChange('rounds', 'mcqSection', { ...round.mcqSection, topics: e.target.value.split(',').map(t => t.trim()).filter(t => t) }, roundIndex)}
                          placeholder="Aptitude, Programming, Data Structures, Algorithms"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <button 
                    type="button" 
                    onClick={() => handleInputChange('rounds', 'mcqSection', {
                      totalQuestions: 1,
                      timeLimit: '',
                      topics: [],
                      difficulty: 'Medium',
                      cutoff: ''
                    }, roundIndex)}
                    className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add MCQ Assessment Details</span>
                  </button>
                </div>
              )}
            </div>

            {/* Round Outcome & Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Round Result *</label>
                <select
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={round.roundResult}
                  onChange={(e) => handleInputChange('rounds', 'roundResult', e.target.value, roundIndex)}
                  required
                >
                  <option value="Selected">Selected</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Pending">Pending</option>
                  <option value="Waitlisted">Waitlisted</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Overall Experience (1-5) *</label>
                <select
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={round.overallExperience}
                  onChange={(e) => handleInputChange('rounds', 'overallExperience', parseInt(e.target.value), roundIndex)}
                  required
                >
                  <option value={1}>1 - Poor</option>
                  <option value={2}>2 - Below Average</option>
                  <option value={3}>3 - Average</option>
                  <option value={4}>4 - Good</option>
                  <option value={5}>5 - Excellent</option>
                </select>
              </div>
            </div>

            <div className="mb-4">
              <MarkdownEditor
                label="Tips for this round"
                value={round.tips}
                onChange={(value) => handleInputChange('rounds', 'tips', value, roundIndex)}
                placeholder="Share tips and advice for this specific round...

### Preparation Tips:
- Review specific topics: `arrays`, `dynamic programming`
- Practice similar problems on LeetCode
- **Time management** is crucial

### During the Interview:
- Think out loud while solving
- Ask clarifying questions
- Test your solution with examples"
                rows={4}
                required
              />
            </div>

            <div>
              <MarkdownEditor
                label="Feedback Received"
                value={round.feedback}
                onChange={(value) => handleInputChange('rounds', 'feedback', value, roundIndex)}
                placeholder="Any feedback you received after this round...

**Positive feedback:**
- Good problem-solving approach
- Clear communication

**Areas for improvement:**
- Could optimize the solution further
- Consider edge cases more carefully"
                rows={3}
              />
            </div>
          </div>
        </div>
      ))}

      <div className="text-center">
        <button 
          type="button" 
          onClick={addRound} 
          className="flex items-center space-x-2 px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors w-full justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Another Round</span>
        </button>
      </div>
    </div>
  );

  const renderPreparation = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-2 text-orange-600 dark:text-orange-400 mb-6">
        <Lightbulb className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Preparation & Tips</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Preparation Time (weeks) *</label>
          <input
            type="number"
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.preparationTime}
            onChange={(e) => handleInputChange(null, 'preparationTime', e.target.value ? parseInt(e.target.value) : '')}
            placeholder="8"
            min="0"
            max="52"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Overall Rating (1-5) *</label>
          <select
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.overallRating}
            onChange={(e) => handleInputChange(null, 'overallRating', parseInt(e.target.value))}
            required
          >
            <option value={5}>⭐⭐⭐⭐⭐ Excellent (5/5)</option>
            <option value={4}>⭐⭐⭐⭐ Good (4/5)</option>
            <option value={3}>⭐⭐⭐ Average (3/5)</option>
            <option value={2}>⭐⭐ Below Average (2/5)</option>
            <option value={1}>⭐ Poor (1/5)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Final Result *</label>
          <select
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.finalResult}
            onChange={(e) => handleInputChange(null, 'finalResult', e.target.value)}
            required
          >
            <option value="Selected">Selected</option>
            <option value="Rejected">Rejected</option>
            <option value="Withdrawn">Withdrawn</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Would you recommend this company? *</label>
          <select
            className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={formData.wouldRecommend}
            onChange={(e) => handleInputChange(null, 'wouldRecommend', e.target.value === 'true')}
            required
          >
            <option value={true}>Yes</option>
            <option value={false}>No</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Overall Experience Summary</label>
        <textarea
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          label="Overall Experience Summary"
          value={formData.overallExperience}
          onChange={(value) => handleInputChange(null, 'overallExperience', value)}
          placeholder="Summarize your overall interview experience..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Resources Used (comma separated)</label>
        <input
          type="text"
          className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          value={Array.isArray(formData.resourcesUsed) ? formData.resourcesUsed.join(', ') : formData.resourcesUsed || ''}
          onChange={(e) => handleStringInput(null, 'resourcesUsed', e.target.value)}
          onBlur={(e) => handleArrayInput(null, 'resourcesUsed', e.target.value)}
          placeholder="LeetCode, GeeksforGeeks, System Design Primer, etc."
        />
      </div>

      <div>
        <MarkdownEditor
          label="Key Tips"
          value={formData.keyTips}
          onChange={(value) => handleInputChange(null, 'keyTips', value)}
          placeholder="Share your most important tips for others...

### Preparation:
- Practice `coding problems` daily for at least **2-3 weeks**
- Review system design fundamentals
- Mock interviews are extremely helpful

### Technical Tips:
1. Start with brute force, then optimize
2. Explain your approach before coding
3. Test with multiple examples

### Behavioral Tips:
- Use the **STAR method** for answers
- Prepare specific examples from your experience"
          rows={6}
          required
        />
      </div>

      <div>
        <MarkdownEditor
          label="Mistakes to Avoid"
          value={formData.mistakesToAvoid}
          onChange={(value) => handleInputChange(null, 'mistakesToAvoid', value)}
          placeholder="What mistakes should others avoid?

### Common Mistakes:
- **Don't** jump straight into coding without thinking
- *Avoid* giving generic answers to behavioral questions
- Don't forget to ask questions at the end

### Technical Mistakes:
- Not considering edge cases
- Poor variable naming
- Not optimizing when asked

### Communication Mistakes:
- Being too quiet during problem solving
- Not asking clarifying questions"
          rows={6}
          required
        />
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 mb-6">
        <CheckCircle className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Review & Submit</h2>
      </div>

      {/* Company Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6">
        <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-2">
          {formData.companyInfo.companyName}
        </h3>
        <p className="text-lg font-semibold text-foreground mb-1">
          {formData.companyInfo.role}
        </p>
        <p className="text-muted-foreground mb-2">
          {formData.companyInfo.department} • {formData.companyInfo.internshipType}
        </p>
        <p className="text-muted-foreground mb-4">
          {formData.companyInfo.location}
        </p>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
          formData.finalResult === 'Selected' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
            : formData.finalResult === 'Rejected'
            ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
        }`}>
          {formData.finalResult}
        </span>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {formData.rounds.length}
          </div>
          <div className="text-sm text-muted-foreground">Rounds</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {formData.overallRating}/5
          </div>
          <div className="text-sm text-muted-foreground">Rating</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formData.preparationTime || 0}
          </div>
          <div className="text-sm text-muted-foreground">Weeks Prep</div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-secondary/50 rounded-lg p-4">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.isAnonymous}
            onChange={(e) => handleInputChange(null, 'isAnonymous', e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-background border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="text-sm font-medium text-foreground">Share anonymously</span>
        </label>
        <p className="text-xs text-muted-foreground mt-1 ml-7">
          When enabled, your name and profile will not be visible to other users
        </p>
      </div>

      {/* Checklist Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-green-800 dark:text-green-400 mb-4 flex items-center space-x-2">
          <ClipboardCheck className="w-5 h-5" />
          <span>Before submitting, please ensure:</span>
        </h4>
        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>All company information is accurate</span>
          </div>
          <div className="flex items-center space-x-3 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Interview rounds are detailed with helpful tips</span>
          </div>
          <div className="flex items-center space-x-3 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Questions and answers are clearly described</span>
          </div>
          <div className="flex items-center space-x-3 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Tips will help other candidates</span>
          </div>
          <div className="flex items-center space-x-3 text-green-700 dark:text-green-300">
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
            <span>Personal information is appropriate for sharing</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30 transition-colors duration-300 py-8">
      {/* Recovery Modal */}
      <UnsavedChangesModal
        isOpen={showRecoveryModal}
        onRestore={handleRestoreDraft}
        onDiscard={handleDiscardDraft}
        savedData={savedDraft}
      />

      {/* Auto-save Indicator */}
      <AutoSaveIndicator lastSaved={lastSaved} isAutoSaving={isAutoSaving} />

      <div className="container mx-auto px-4">
        <div className="bg-card/95 backdrop-blur-sm border border-border rounded-2xl shadow-2xl">
          <div className="p-6 pb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                  Share Your Interview Experience
                </h1>
                <p className="text-muted-foreground mt-2">
                  Help your fellow PSG students by sharing your detailed interview journey
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    manualSave();
                    // console.log('Manual save triggered from button');
                  }}
                  className="flex items-center space-x-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                  title="Save your progress"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Now</span>
                </button>
                <button 
                  onClick={() => navigate('/experiences')}
                  className="p-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {renderStepIndicator()}

            {error && (
              <div ref={errorRef} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button 
                  onClick={() => setError(null)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-red-800/20 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          <div className="px-6 pb-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {currentStep === 1 && renderCompanyInfo()}
              {currentStep === 2 && renderRounds()}
              {currentStep === 3 && renderPreparation()}
              {currentStep === 4 && renderReview()}

              {/* Navigation Buttons */}
              <div className="border-t border-border pt-6">
                <div className="flex justify-between">
                  <div>
                    {currentStep > 1 && (
                      <button 
                        type="button" 
                        onClick={prevStep} 
                        className="flex items-center space-x-2 px-6 py-3 border border-border rounded-lg hover:bg-secondary transition-colors"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Previous</span>
                      </button>
                    )}
                  </div>
                  
                  <div className="flex space-x-3">
                    {currentStep < totalSteps ? (
                      <button 
                        type="button" 
                        onClick={nextStep}
                        className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      >
                        <span>Next</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button 
                        type="submit" 
                        disabled={loading} 
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" />
                        <span>{loading ? 'Creating...' : 'Share Experience'}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateExperience;
