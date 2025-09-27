import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { experienceAPI } from '../utils/api';
import { createApiUrl } from '../config/api';
import CompanySearch from '../components/CompanySearch';
import SearchableDropdown from '../components/SearchableDropdown';
import MarkdownEditor from '../components/MarkdownEditor';
// import DesktopOnlyPrompt from '../components/DesktopOnlyPrompt';
import { useIsDesktopRequired } from '../utils/deviceDetection';
import {
  X, 
  Building, 
  Users,
  MapPin, 
  Calendar, 
  Star, 
  Tag, 
  BookOpen, 
  Lightbulb, 
  CheckCircle,
  ClipboardCheck,
  ClipboardList,
  Hash,
  ArrowLeft,
  ArrowRight,
  Save,
  Send,
  Plus,
  Minus,
  Code,
  Timer,
  Target,
  Trash2,
  Edit3,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Loader
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
                className="px-3 py-1 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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

const EditExperience = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  // const isDesktopRequired = useIsDesktopRequired();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const errorRef = useRef(null);
  
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
      currency: 'USD',
      applicationDate: ''
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

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [pendingCompany, setPendingCompany] = useState(null); // For companies to be created
  const [pendingAppDatabaseCompany, setPendingAppDatabaseCompany] = useState(null); // For application database companies

  const handleCompanySelection = (company) => {
    // console.log('Company selected:', company); // Debug log
    setSelectedCompany(company);
    
    if (company?.isPending) {
      // This is a new company that needs to be created
      setPendingCompany(company.pendingName);
      setPendingAppDatabaseCompany(null);
      handleInputChange('companyInfo', 'companyName', company.pendingName);
      handleInputChange('companyInfo', 'companyId', null); // Clear any existing ID
    } else if ((company?.isFromAppDatabase || company?.isAppDatabaseVerified) && !company?.existingId) {
      // This is a company from the application database that needs to be created in our DB
      // Only if it doesn't already exist (checked by existingId)
      setPendingAppDatabaseCompany(company);
      setPendingCompany(null);
      handleInputChange('companyInfo', 'companyName', company.displayName || company.name);
      handleInputChange('companyInfo', 'companyId', null); // Clear any existing ID since we'll create new
    } else if (company?._id && company._id.match(/^[0-9a-fA-F]{24}$/)) {
      // This is an existing company in our database (has valid MongoDB ObjectId)
      setPendingCompany(null);
      setPendingAppDatabaseCompany(null);
      handleInputChange('companyInfo', 'companyName', company.displayName || company.name);
      handleInputChange('companyInfo', 'companyId', company._id);
      // console.log('Set existing company:', {
      //   name: company.displayName || company.name,
      //   id: company._id
      // });
    } else {
      // Clear selections if no valid company, or treat as new company to be created
      // console.log('Unclear company type, treating as new:', company);
      setPendingCompany(company.displayName || company.name);
      setPendingAppDatabaseCompany(null);
      handleInputChange('companyInfo', 'companyName', company.displayName || company.name);
      handleInputChange('companyInfo', 'companyId', null);
    }
  };

  const fetchExperience = useCallback(async () => {
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
          // country: experienceData.companyInfo?.country || '',
          stipend: experienceData.companyInfo?.stipend || '',
          currency: experienceData.companyInfo?.currency || 'USD',
          applicationDate: experienceData.companyInfo?.applicationDate ? 
            experienceData.companyInfo.applicationDate.split('T')[0] : '',
          // resultDate: experienceData.companyInfo?.resultDate ? 
          //   experienceData.companyInfo.resultDate.split('T')[0] : ''
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
        isAnonymous: experienceData.isAnonymous || false
      };
      
      setFormData(transformedData);
    } catch (error) {
      // console.error('Error fetching experience:', error);
      setError('Failed to load experience data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchExperience();
  }, [id, user, navigate, fetchExperience]);

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
          // resultDate: formData.companyInfo.resultDate ? 
          //   new Date(formData.companyInfo.resultDate).toISOString() : null,
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
        isAnonymous: formData.isAnonymous
      };
      
      // Pre-submission company creation if pending
      // console.log('Checking company creation needs:', {
      //   pendingCompany,
      //   pendingAppDatabaseCompany,
      //   selectedCompanyId: selectedCompany?._id,
      //   formDataCompanyId: submitData.companyInfo.companyId,
      //   formDataCompanyName: submitData.companyInfo.companyName
      // });
      
      // Only create a company if:
      // 1. There's a pending company name AND no existing company is selected, OR
      // 2. There's a pending app database company
      if ((pendingCompany && !selectedCompany?._id && !submitData.companyInfo.companyId) || pendingAppDatabaseCompany) {
        // console.log('Creating new company...');
        try {
          let companyData;
          
          if (pendingAppDatabaseCompany) {
            // Create company from application database data
            companyData = {
              name: pendingAppDatabaseCompany.displayName || pendingAppDatabaseCompany.name,
              companyId: pendingAppDatabaseCompany.companyId,
              requireAppValidation: false // Skip validation since it's from application database
            };
          } else {
            // Create regular company
            companyData = {
              name: pendingCompany,
              requireAppValidation: true // Enable application database validation
            };
          }

          const companyResponse = await fetch(createApiUrl('/api/companies'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials: 'include', // This sends cookies for authentication
            body: JSON.stringify(companyData)
          });

          if (!companyResponse.ok) {
            const errorData = await companyResponse.json();
            
            // If application database validation failed, show specific error
            if (errorData.code === 'APP_DATABASE_VALIDATION_FAILED') {
              setError(`Company "${pendingCompany}" not found in application database. Please select a database-verified company.`);
              setSubmitting(false);
              return;
            }
            
            throw new Error('Failed to create company');
          }

          const newCompany = await companyResponse.json();
          
          // Update the form data with the new company
          submitData.companyInfo.companyName = newCompany.data.name;
          submitData.companyInfo.companyId = newCompany.data._id;
          
          // Reset pending state
          setPendingCompany(null);
          setPendingAppDatabaseCompany(null);
          setSelectedCompany({ id: newCompany.data._id, name: newCompany.data.name });
        } catch (companyError) {
          console.error('Company creation error:', companyError);
          setError('Failed to create company. Please try again.');
          setSubmitting(false);
          return;
        }
      } else if (selectedCompany?._id) {
        // Use existing selected company
        // console.log('Using existing company:', selectedCompany);
        submitData.companyInfo.companyId = selectedCompany._id;
        submitData.companyInfo.companyName = selectedCompany.displayName || selectedCompany.name;
      } else {
        // If no company is selected but we have a company name, check if it's already linked
        // console.log('No specific company selected, using form data as-is');
      }
      
      await experienceAPI.update(id, submitData);
      
      setSuccessMessage('Experience updated successfully!');
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

  // Alias for compatibility with existing UI
  const handleQuestionChange = (roundIndex, questionIndex, type, field, value) => {
    updateQuestion(roundIndex, questionIndex, field, value, type);
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

  // Interviewer details functions
  const addInterviewerDetail = (roundIndex) => {
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.map((round, rIndex) => {
        if (rIndex === roundIndex) {
          const newInterviewer = {
            role: '',
            team: '',
            experienceLevel: 'Senior'
          };
          return {
            ...round,
            interviewerDetails: [...(round.interviewerDetails || []), newInterviewer]
          };
        }
        return round;
      })
    }));
  };

  const removeInterviewerDetail = (roundIndex, interviewerIndex) => {
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.map((round, rIndex) => {
        if (rIndex === roundIndex) {
          return {
            ...round,
            interviewerDetails: (round.interviewerDetails || []).filter((_, iIndex) => iIndex !== interviewerIndex)
          };
        }
        return round;
      })
    }));
  };

  const updateInterviewerDetail = (roundIndex, interviewerIndex, field, value) => {
    setFormData(prev => ({
      ...prev,
      rounds: prev.rounds.map((round, rIndex) => {
        if (rIndex === roundIndex) {
          return {
            ...round,
            interviewerDetails: (round.interviewerDetails || []).map((interviewer, iIndex) => 
              iIndex === interviewerIndex ? { ...interviewer, [field]: value } : interviewer
            )
          };
        }
        return round;
      })
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Authentication Required</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">Please log in to edit your experience.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading Experience</h3>
            <p className="text-gray-600 dark:text-gray-300">Please wait while we load your experience...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !formData?.companyInfo?.companyName) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Unable to Load Experience</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">{error}</p>
            <button 
              onClick={() => navigate('/experiences')}
              className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
            >
              Back to Experiences
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Safety check to ensure formData is properly structured
  if (!formData || !formData.companyInfo || !formData.rounds) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900/20 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Initializing Form</h3>
            <p className="text-gray-600 dark:text-gray-300">Setting up the edit form...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
            Edit Experience
          </h1>
          <p className="text-muted-foreground text-lg">
            Update your interview experience to help others in their journey
          </p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div ref={errorRef} className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <div>
                <strong>Error:</strong> {error}
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-800/50 rounded transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-card rounded-2xl shadow-xl border border-border overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Company Information */}
            <div className="space-y-6">
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
                  <label className="block text-sm font-medium text-foreground mb-1">Business Unit</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.companyInfo.department}
                    onChange={(e) => handleInputChange('companyInfo', 'department', e.target.value)}
                    placeholder="e.g., Engineering, Product, Marketing (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Internship Type</label>
                  <SearchableDropdown
                    value={formData.companyInfo.internshipType}
                    onChange={(value) => handleInputChange('companyInfo', 'internshipType', value)}
                    options={['Summer', 'Winter', 'Full-time', 'Part-time', 'PPO', 'Contract']}
                    placeholder="Select internship type"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Work Location</label>
                  <SearchableDropdown
                    value={formData.companyInfo.location}
                    onChange={(value) => handleInputChange('companyInfo', 'location', value)}
                    options={['Remote', 'On-site', 'Hybrid']}
                    placeholder="Select work location"
                  />
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
                    <div className="w-20">
                      <SearchableDropdown
                        value={formData.companyInfo.currency}
                        onChange={(value) => handleInputChange('companyInfo', 'currency', value)}
                        options={['INR', 'USD']}
                        placeholder="Currency"
                        className="rounded-r-none border-r-0"
                      />
                    </div>
                    <input
                      type="number"
                      className="flex-1 px-4 py-2 border border-border rounded-r-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent border-l-0"
                      value={formData.companyInfo.stipend}
                      onChange={(e) => handleInputChange('companyInfo', 'stipend', e.target.value)}
                      placeholder="50000"
                    />
                  </div>
                </div>
                {/* <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Country</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.companyInfo.country}
                    onChange={(e) => handleInputChange('companyInfo', 'country', e.target.value)}
                    placeholder="e.g., India"
                  />
                </div> */}
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

              {/* <div className="grid grid-cols-1 md:grid-cols-1 gap-6"> */}
                
                {/* <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Result Date</label>
                  <DatePicker
                    value={formData.companyInfo.resultDate}
                    onChange={(value) => handleInputChange('companyInfo', 'resultDate', value)}
                    placeholder="Select result date"
                  />
                </div> */}
              {/* </div> */}
            </div>

            {/* Rounds Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-6">
                <ClipboardList className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Interview Rounds</h2>
              </div>

              {(formData?.rounds || []).map((round, roundIndex) => (
                <div key={roundIndex} className="bg-muted/50 p-6 rounded-xl border border-border space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-foreground flex items-center space-x-2">
                      {/* <Hash className="w-4 h-4" /> */}
                      <span>Round {roundIndex + 1}</span>
                    </h3>
                    {formData?.rounds?.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRound(roundIndex)}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Round Type</label>
                      <SearchableDropdown
                        value={round?.roundType || 'Technical'}
                        onChange={(value) => handleInputChange('rounds', 'roundType', value, roundIndex)}
                        options={['Online Assessment', 'Technical', 'HR', 'Group Discussion', 'Case Study', 'System Design', 'Coding Round']}
                        placeholder="Select round type"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Duration</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={round?.duration || ''}
                        onChange={(e) => handleInputChange('rounds', 'duration', e.target.value, roundIndex)}
                        placeholder="e.g., 60 minutes"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Platform</label>
                      <input
                        type="text"
                        className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={round?.platform || ''}
                        onChange={(e) => handleInputChange('rounds', 'platform', e.target.value, roundIndex)}
                        placeholder="e.g., Zoom, Teams, In-person"
                      />
                    </div>
                    {/* <div>
                      <label className="block text-sm font-medium text-foreground mb-1">Interview Date</label>
                      <DatePicker
                        value={round?.interviewDate || ''}
                        onChange={(value) => handleInputChange('rounds', 'interviewDate', value, roundIndex)}
                        placeholder="Select interview date"
                      />
                    </div> */}
                  </div>

                  <div>
                    {/* <MarkdownEditor
                      label="Round Description"
                      value={round?.description || ''}
                      onChange={(value) => handleInputChange('rounds', 'description', value, roundIndex)}
                      placeholder="Describe what happened in this round...

**Example:**
This was a **technical round** focused on data structures and algorithms.

### Key Topics:
- Arrays and hashing
- Dynamic programming
- System design basics

The interviewer was friendly and provided hints when needed."
                      rows={3}
                    /> */}
                  </div>

                  {/* Technical Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Code className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="font-medium text-foreground">Technical Questions</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          addQuestion(roundIndex, 'technical');
                        }}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    {(round?.technicalQuestions || []).map((question, qIndex) => (
                      <div key={qIndex} className="bg-background p-4 rounded-lg border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Question {qIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(roundIndex, qIndex, 'technical')}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                          <div>
                            <MarkdownEditor
                              label="Question"
                              value={question?.question || ''}
                              onChange={(value) => handleQuestionChange(roundIndex, qIndex, 'technical', 'question', value)}
                              placeholder="Enter the technical question...

**Example:**
Given an array of integers, find the number of triplets that can form a triangle.

### Constraints:
- Array length: 1 ≤ n ≤ 1000
- Element values: 1 ≤ arr[i] ≤ 1000

```python
# Input example
arr = [4, 6, 3, 7]
# Output: 3 triplets
```"
                              rows={2}
                            />
                          </div>
                          <div>
                            <MarkdownEditor
                              label="Answer/Approach"
                              value={question?.solution || question?.answer || ''}
                              onChange={(value) => handleQuestionChange(roundIndex, qIndex, 'technical', 'solution', value)}
                              placeholder="Your answer or approach...

**My Approach:**
1. Sort the array in ascending order
2. Use two-pointer technique for each element
3. Check triangle inequality: `a + b > c`

```python
def count_triangles(arr):
    arr.sort()
    count = 0
    for i in range(len(arr)-2):
        left, right = i+1, len(arr)-1
        while left < right:
            if arr[i] + arr[left] > arr[right]:
                count += right - left
                left += 1
            else:
                right -= 1
    return count
```

**Time Complexity:** O(n²)
**Space Complexity:** O(1)"
                              rows={2}
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Difficulty</label>
                            <SearchableDropdown
                              value={question?.difficulty || 'Medium'}
                              onChange={(value) => handleQuestionChange(roundIndex, qIndex, 'technical', 'difficulty', value)}
                              options={['Easy', 'Medium', 'Hard']}
                              placeholder="Select difficulty"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Topics (comma-separated)</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={Array.isArray(question?.topics) ? question.topics.join(', ') : (question?.topics || '')}
                              onChange={(e) => handleQuestionChange(roundIndex, qIndex, 'technical', 'topics', e.target.value)}
                              onBlur={(e) => handleQuestionChange(roundIndex, qIndex, 'technical', 'topics', e.target.value.split(',').map(t => t.trim()).filter(t => t))}
                              placeholder="Arrays, Algorithms, etc."
                            />
                          </div>
                          {/* <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Time Given (minutes)</label>
                            <input
                              type="number"
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={question?.timeGiven || ''}
                              onChange={(e) => handleQuestionChange(roundIndex, qIndex, 'technical', 'timeGiven', e.target.value)}
                              placeholder="e.g., 30"
                            />
                          </div> */}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-1">LeetCode Link (optional)</label>
                          <input
                            type="url"
                            className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            value={question?.leetcodeLink || ''}
                            onChange={(e) => handleQuestionChange(roundIndex, qIndex, 'technical', 'leetcodeLink', e.target.value)}
                            placeholder="https://leetcode.com/problems/..."
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Behavioral Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-600 dark:text-green-400" />
                        <span className="font-medium text-foreground">Behavioral Questions</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          addQuestion(roundIndex, 'behavioral');
                        }}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    {(round?.behavioralQuestions || []).map((question, qIndex) => (
                      <div key={qIndex} className="bg-background p-4 rounded-lg border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Question {qIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeQuestion(roundIndex, qIndex, 'behavioral')}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {/* <div className="grid grid-cols-1 md:grid-cols- gap-4"> */}
                          <div>
                            <MarkdownEditor
                              label="Question"
                              value={question?.question || ''}
                              onChange={(value) => handleQuestionChange(roundIndex, qIndex, 'behavioral', 'question', value)}
                              placeholder="Enter the behavioral question...

**Example:**
Tell me about a time when you had to **work under pressure** to meet a tight deadline.

### Follow-up questions they might ask:
- How did you prioritize tasks?
- What would you do differently?
- How did your team react?"
                              rows={2}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Category</label>
                            <SearchableDropdown
                              value={question?.category || 'Personal'}
                              onChange={(value) => handleQuestionChange(roundIndex, qIndex, 'behavioral', 'category', value)}
                              options={['Personal', 'Behavioral', 'Situational', 'Company-specific']}
                              placeholder="Select category"
                            />
                          </div>
                        {/* </div> */}
                        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> */}
                          <div>
                            <MarkdownEditor
                              label="Your Answer"
                              value={question?.yourAnswer || question?.answer || ''}
                              onChange={(value) => handleQuestionChange(roundIndex, qIndex, 'behavioral', 'yourAnswer', value)}
                              placeholder="Your answer using STAR method...

**STAR Method Structure:**

### Situation:
During my final semester project, our team had only 2 weeks to deliver a fully functional web application for a client presentation.

### Task:
As the **team lead**, I needed to ensure we met the deadline while maintaining code quality and team morale.

### Action:
- Created a daily standup schedule
- Broke down tasks into smaller, manageable chunks
- Implemented pair programming for complex features
- Set up automated testing to catch bugs early

### Result:
We delivered the project *2 days early* with **zero critical bugs**. The client was impressed and offered our team internship positions."
                              rows={2}
                            />
                          </div>
                          {/* <div>
                            <MarkdownEditor
                              label="Tips for this question"
                              value={question?.tips || ''}
                              onChange={(value) => handleQuestionChange(roundIndex, qIndex, 'behavioral', 'tips', value)}
                              placeholder="Tips for future candidates...

**Key Tips:**

### Preparation:
- Have **3-4 STAR stories** ready that showcase different skills
- Practice timing - keep answers to *2-3 minutes*
- Use specific numbers and metrics when possible

### During the answer:
- Start with the situation/context clearly
- Focus on YOUR actions, not the team's
- Show leadership and problem-solving skills

### Common mistakes to avoid:
- Don't make the story too long
- Don't focus on negative aspects of teammates
- Don't use hypothetical scenarios"
                              rows={2}
                            />
                          </div> */}
                        {/* </div> */}
                      </div>
                    ))}
                  </div>

                  {/* MCQ Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold flex items-center space-x-2">
                        <Timer className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>MCQ/Online Assessment</span>
                      </h4>
                    </div>
                    
                    {(round?.mcqSection?.totalQuestions || round?.mcqSection?.timeLimit || round?.mcqSection?.cutoff || 
                      (Array.isArray(round?.mcqSection?.topics) && round.mcqSection.topics.length > 0) ||
                      (typeof round?.mcqSection?.topics === 'string' && round.mcqSection.topics.trim())) ? (
                      <div className="border border-purple-200 dark:border-purple-800 rounded-lg">
                        <div className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">MCQ Assessment Details</span>
                            <button
                              type="button"
                              onClick={() => handleInputChange('rounds', 'mcqSection', {
                                totalQuestions: '',
                                timeLimit: '',
                                topics: [],
                                difficulty: 'Medium',
                                cutoff: ''
                              }, roundIndex)}
                              className="p-1 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
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
                                  value={round?.mcqSection?.totalQuestions || ''}
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
                                  value={round?.mcqSection?.timeLimit || ''}
                                  onChange={(e) => handleInputChange('rounds', 'mcqSection', { ...round.mcqSection, timeLimit: e.target.value ? parseInt(e.target.value) : '' }, roundIndex)}
                                  placeholder="60"
                                  min="1"
                                />
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Difficulty Level</label>
                                <SearchableDropdown
                                  value={round?.mcqSection?.difficulty || 'Medium'}
                                  onChange={(value) => handleInputChange('rounds', 'mcqSection', { ...round.mcqSection, difficulty: value }, roundIndex)}
                                  options={['Easy', 'Medium', 'Hard']}
                                  placeholder="Select difficulty"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-foreground mb-1">Cutoff Percentage</label>
                                <input
                                  type="number"
                                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  value={round?.mcqSection?.cutoff || ''}
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
                                value={Array.isArray(round?.mcqSection?.topics) ? round.mcqSection.topics.join(', ') : (round?.mcqSection?.topics || '')}
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
                          className="flex items-center space-x-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary dark:hover:bg-secondary/50 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add MCQ Assessment Details</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Interviewer Details */}
                  {/* <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-foreground">Interviewer Details</span>
                        <span className="text-sm text-muted-foreground">(Optional)</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          addInterviewerDetail(roundIndex);
                        }}
                        className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Interviewer</span>
                      </button>
                    </div> */}

                    {/* {(round?.interviewerDetails || []).map((interviewer, interviewerIndex) => (
                      <div key={interviewerIndex} className="bg-background p-4 rounded-lg border border-border space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-muted-foreground">Interviewer {interviewerIndex + 1}</span>
                          <button
                            type="button"
                            onClick={() => removeInterviewerDetail(roundIndex, interviewerIndex)}
                            className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={interviewer?.role || ''}
                              onChange={(e) => updateInterviewerDetail(roundIndex, interviewerIndex, 'role', e.target.value)}
                              placeholder="e.g., Software Engineer"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Team</label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={interviewer?.team || ''}
                              onChange={(e) => updateInterviewerDetail(roundIndex, interviewerIndex, 'team', e.target.value)}
                              placeholder="e.g., Backend Team"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-foreground mb-1">Experience Level</label>
                            <select
                              className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              value={interviewer?.experienceLevel || 'Senior'}
                              onChange={(e) => updateInterviewerDetail(roundIndex, interviewerIndex, 'experienceLevel', e.target.value)}
                            >
                              <option value="Junior">Junior</option>
                              <option value="Senior">Senior</option>
                              <option value="Lead">Lead</option>
                              <option value="Manager">Manager</option>
                              <option value="Director">Director</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))} */}
                  {/* </div> */}
                </div>
              ))}

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  addRound();
                }}
                className="w-full flex items-center justify-center space-x-2 py-3 px-6 border-2 border-dashed border-border hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span className="font-medium text-blue-600 dark:text-blue-400">Add Another Round</span>
              </button>
            </div>

            {/* Preparation & Tips Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-6">
                <BookOpen className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Preparation & Tips</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Preparation Time (weeks)</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={formData.preparationTime || ''}
                    onChange={(e) => handleInputChange(null, 'preparationTime', e.target.value)}
                    placeholder="e.g., 4"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Resources Used (comma-separated)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    value={Array.isArray(formData.resourcesUsed) ? formData.resourcesUsed.join(', ') : formData.resourcesUsed || ''}
                    onChange={(e) => handleArrayInput(null, 'resourcesUsed', e.target.value)}
                    placeholder="e.g., LeetCode, GeeksforGeeks, YouTube"
                  />
                </div>
              </div>

              <div>
                <MarkdownEditor
                  label="Key Tips for Future Candidates"
                  value={formData.keyTips || ''}
                  onChange={(value) => handleInputChange(null, 'keyTips', value)}
                  placeholder="Share your most important tips...

**Essential Preparation Tips:**

### Technical Preparation:
- Practice **50+ LeetCode problems** focusing on medium difficulty
- Master fundamental algorithms: *sorting, searching, dynamic programming*
- Review system design basics for senior roles

### Interview Day Tips:
1. **Arrive 10 minutes early** to compose yourself
2. Ask clarifying questions before jumping into solutions
3. Think out loud - communicate your thought process
4. Test your solution with edge cases

### Key Resources:
- `LeetCode` for algorithm practice
- `Cracking the Coding Interview` book
- `System Design Primer` on GitHub

### Pro Tips:
- **Practice mock interviews** with friends
- Record yourself explaining solutions
- Focus on *clean, readable code* over optimal solutions initially"
                  rows={4}
                />
              </div>

              <div>
                <MarkdownEditor
                  label="Mistakes to Avoid"
                  value={formData.mistakesToAvoid || ''}
                  onChange={(value) => handleInputChange(null, 'mistakesToAvoid', value)}
                  placeholder="What mistakes should others avoid?

**Common Mistakes to Avoid:**

### Technical Interview Mistakes:
- **Don't** start coding immediately without understanding the problem
- **Avoid** hardcoding values instead of using variables
- **Don't** ignore edge cases like empty arrays or null inputs
- **Never** give up if stuck - ask for hints instead

### Communication Mistakes:
1. Staying silent while thinking
2. Not asking clarifying questions
3. Being defensive when receiving feedback
4. Rushing through explanations

### Preparation Mistakes:
- Only practicing *easy* problems on LeetCode
- Memorizing solutions without understanding concepts
- Ignoring behavioral questions preparation
- Not researching the company culture

### Day-of Mistakes:
- **Arriving late** or unprepared with documents
- Dressing inappropriately for company culture
- Not preparing thoughtful questions for the interviewer
- Giving one-word answers to behavioral questions

### Code Quality Issues:
```python
# Avoid this - poor variable names
def solve(a):
    for i in a:
        # confusing logic
        pass

# Do this instead - clear and readable
def find_duplicates(numbers):
    seen = set()
    duplicates = []
    for num in numbers:
        if num in seen:
            duplicates.append(num)
        else:
            seen.add(num)
    return duplicates
```"
                  rows={3}
                />
              </div>
            </div>

            {/* Overall Experience & Results */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400 mb-6">
                <Star className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Overall Experience & Results</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Overall Rating</label>
                  <SearchableDropdown
                    value={formData.overallRating}
                    onChange={(value) => handleInputChange(null, 'overallRating', parseInt(value))}
                    options={['5', '4', '3', '2', '1']}
                    placeholder="Select rating"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Final Result</label>
                  <SearchableDropdown
                    value={formData.finalResult}
                    onChange={(value) => handleInputChange(null, 'finalResult', value)}
                    options={['Selected', 'Rejected', 'Withdrawn', 'Pending']}
                    placeholder="Select result"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Would Recommend?</label>
                  <SearchableDropdown
                    value={formData.wouldRecommend ? 'true' : 'false'}
                    onChange={(value) => handleInputChange(null, 'wouldRecommend', value === 'true')}
                    options={['true', 'false']}
                    placeholder="Select recommendation"
                  />
                </div>
              </div>

              <div>
                <MarkdownEditor
                  label="Overall Experience Summary"
                  value={formData.overallExperience || ''}
                  onChange={(value) => handleInputChange(null, 'overallExperience', value)}
                  placeholder="Describe your overall experience with the interview process...

**My Interview Experience:**

### Overall Process:
The interview process was **well-structured** and lasted approximately 3 weeks from application to final result.

### Positive Aspects:
- Interviewers were *friendly and encouraging*
- Questions were fair and relevant to the role
- Clear communication throughout the process
- Good work-life balance emphasis during discussions

### Challenges Faced:
1. **Technical rounds** were challenging but fair
2. Time pressure during coding exercises
3. System design questions required deep thinking

### Company Culture:
The company culture seemed **collaborative and innovative**. Team members were eager to share their experiences and answer questions about growth opportunities.

### Recommendation:
I would **definitely recommend** this company to other candidates. The interview process reflects their commitment to finding the right fit while being respectful of candidates' time.

### Final Thoughts:
- Well-prepared candidates should feel confident
- Focus on problem-solving approach over perfect solutions
- Company values cultural fit as much as technical skills"
                  rows={4}
                />
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-6">
              <div className="flex items-center space-x-2 text-purple-600 dark:text-purple-400 mb-6">
                <Settings className="w-5 h-5" />
                <h2 className="text-xl font-semibold">Privacy Settings</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Post Anonymously?</label>
                <select
                  className="w-full px-4 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={formData.isAnonymous}
                  onChange={(e) => handleInputChange(null, 'isAnonymous', e.target.value === 'true')}
                >
                  <option value={false}>No - Show my name</option>
                  <option value={true}>Yes - Keep anonymous</option>
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  When enabled, your name and profile will not be visible to other users
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <button
                type="button"
                onClick={() => navigate('/experiences')}
                className="flex-1 sm:flex-none px-6 py-3 border border-border rounded-xl text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white rounded-xl transition-all duration-200 transform disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    <span>Updating Experience...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Update Experience</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditExperience;
//                   Department
//                 </label>
//                 <input
//                   type="text"
//                   className="psg-edit-input"
//                   value={formData.companyInfo.department}
//                   onChange={(e) => handleInputChange('companyInfo', 'department', e.target.value)}
//                   placeholder="e.g., Engineering"
//                   required
//                 />
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label">
//                   Internship Type
//                 </label>
//                 <select
//                   className="psg-edit-select"
//                   value={formData.companyInfo.internshipType}
//                   onChange={(e) => handleInputChange('companyInfo', 'internshipType', e.target.value)}
//                 >
//                   <option value="Summer">Summer</option>
//                   <option value="Winter">Winter</option>
//                   <option value="Full-time">Full-time</option>
//                   <option value="Part-time">Part-time</option>
//                   <option value="PPO">PPO</option>
//                   <option value="Contract">Contract</option>
//                 </select>
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label psg-edit-label-required">
//                   Duration
//                 </label>
//                 <input
//                   type="text"
//                   className="psg-edit-input"
//                   value={formData.companyInfo.duration}
//                   onChange={(e) => handleInputChange('companyInfo', 'duration', e.target.value)}
//                   placeholder="e.g., 3 months"
//                   required
//                 />
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label">
//                   Work Location
//                 </label>
//                 <select
//                   className="psg-edit-select"
//                   value={formData.companyInfo.location}
//                   onChange={(e) => handleInputChange('companyInfo', 'location', e.target.value)}
//                 >
//                   <option value="Remote">Remote</option>
//                   <option value="On-site">On-site</option>
//                   <option value="Hybrid">Hybrid</option>
//                 </select>
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label">
//                   City
//                 </label>
//                 <input
//                   type="text"
//                   className="psg-edit-input"
//                   value={formData.companyInfo.city}
//                   onChange={(e) => handleInputChange('companyInfo', 'city', e.target.value)}
//                   placeholder="e.g., San Francisco"
//                 />
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label">
//                   Country
//                 </label>
//                 <input
//                   type="text"
//                   className="psg-edit-input"
//                   value={formData.companyInfo.country}
//                   onChange={(e) => handleInputChange('companyInfo', 'country', e.target.value)}
//                   placeholder="e.g., USA"
//                 />
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label">
//                   Stipend
//                 </label>
//                 <div style={{display: 'flex', gap: 'var(--psg-edit-spacing-sm)'}}>
//                   <select
//                     value={formData.companyInfo.currency}
//                     onChange={(e) => handleInputChange('companyInfo', 'currency', e.target.value)}
//                     className="psg-edit-select"
//                     style={{maxWidth: '100px'}}
//                   >
//                     <option value="USD">USD</option>
//                     <option value="INR">INR</option>
//                   </select>
//                   <input
//                     type="number"
//                     className="psg-edit-input"
//                     value={formData.companyInfo.stipend}
//                     onChange={(e) => handleInputChange('companyInfo', 'stipend', e.target.value)}
//                     placeholder="Amount"
//                   />
//                 </div>
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label psg-edit-label-required">
//                   Application Date
//                 </label>
//                 <input
//                   type="date"
//                   className="psg-edit-input"
//                   value={formData.companyInfo.applicationDate}
//                   onChange={(e) => handleInputChange('companyInfo', 'applicationDate', e.target.value)}
//                   required
//                 />
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label">
//                   Result Date
//                 </label>
//                 <input
//                   type="date"
//                   className="psg-edit-input"
//                   value={formData.companyInfo.resultDate}
//                   onChange={(e) => handleInputChange('companyInfo', 'resultDate', e.target.value)}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Rounds Section */}
//           <div className="psg-edit-section">
//             <div className="psg-edit-section-header">
//               <h2 className="psg-edit-section-title">
//                 Interview Rounds
//               </h2>
//               <div className="psg-edit-section-divider"></div>
//             </div>

//             {(formData?.rounds || []).map((round, roundIndex) => (
//               <div key={roundIndex} className="psg-edit-round-card">
//                 <div className="psg-edit-round-header">
//                   <h3 className="psg-edit-round-title">
//                     Round {roundIndex + 1}
//                   </h3>
//                   {formData?.rounds?.length > 1 && (
//                     <button
//                       type="button"
//                       className="psg-edit-btn psg-edit-btn-danger psg-edit-btn-sm"
//                       onClick={() => removeRound(roundIndex)}
//                     >
//                       Remove Round
//                     </button>
//                   )}
//                 </div>

//                 <div className="psg-edit-grid">
//                   <div className="psg-edit-field">
//                     <label className="psg-edit-label">
//                       Round Type
//                     </label>
//                     <select
//                       className="psg-edit-select"
//                       value={round?.roundType || 'Technical'}
//                       onChange={(e) => handleInputChange('rounds', 'roundType', e.target.value, roundIndex)}
//                     >
//                       <option value="Online Assessment">Online Assessment</option>
//                       <option value="Technical">Technical Round</option>
//                       <option value="HR">HR Round</option>
//                       <option value="Group Discussion">Group Discussion</option>
//                       <option value="Case Study">Case Study</option>
//                       <option value="System Design">System Design</option>
//                       <option value="Coding Round">Coding Round</option>
//                     </select>
//                   </div>

//                   <div className="psg-edit-field">
//                     <label className="psg-edit-label psg-edit-label-required">
//                       Duration (minutes)
//                     </label>
//                     <input
//                       type="number"
//                       className="psg-edit-input"
//                       value={round.duration}
//                       onChange={(e) => handleInputChange('rounds', 'duration', e.target.value ? parseInt(e.target.value) : '', roundIndex)}
//                       placeholder="e.g., 60"
//                       min="1"
//                       required
//                     />
//                   </div>

//                   <div className="psg-edit-field">
//                     <label className="psg-edit-label">
//                       Platform
//                     </label>
//                     <input
//                       type="text"
//                       className="psg-edit-input"
//                       value={round.platform}
//                       onChange={(e) => handleInputChange('rounds', 'platform', e.target.value, roundIndex)}
//                       placeholder="e.g., Zoom, Teams, In-person"
//                     />
//                   </div>

//                   <div className="psg-edit-field">
//                     <label className="psg-edit-label">
//                       Result
//                     </label>
//                     <select
//                       className="psg-edit-select"
//                       value={round.roundResult}
//                       onChange={(e) => handleInputChange('rounds', 'roundResult', e.target.value, roundIndex)}
//                     >
//                       <option value="Selected">Selected</option>
//                       <option value="Rejected">Rejected</option>
//                       <option value="Waitlisted">Waitlisted</option>
//                       <option value="Pending">Pending</option>
//                     </select>
//                   </div>

//                   <div className="psg-edit-field">
//                     <label className="psg-edit-label">
//                       Overall Experience (1-5)
//                     </label>
//                     <input
//                       type="number"
//                       className="psg-edit-input"
//                       min="1"
//                       max="10"
//                       value={round.overallExperience}
//                       onChange={(e) => handleInputChange('rounds', 'overallExperience', parseInt(e.target.value), roundIndex)}
//                     />
//                   </div>

//                   <div className="psg-edit-field psg-edit-grid-full">
//                     <label className="psg-edit-label psg-edit-label-required">
//                       Tips for this round
//                     </label>
//                     <textarea
//                       className="psg-edit-textarea"
//                       value={round.tips}
//                       onChange={(e) => handleInputChange('rounds', 'tips', e.target.value, roundIndex)}
//                       placeholder="Share tips and advice for this specific round..."
//                       rows="3"
//                       required
//                     />
//                   </div>

//                   <div className="psg-edit-field psg-edit-grid-full">
//                     <label className="psg-edit-label">
//                       Feedback & Notes
//                     </label>
//                     <textarea
//                       className="psg-edit-textarea"
//                       value={round.feedback}
//                       onChange={(e) => handleInputChange('rounds', 'feedback', e.target.value, roundIndex)}
//                       placeholder="Share your thoughts about this round..."
//                       rows="3"
//                     />
//                   </div>
//                 </div>

//                 {/* Technical Questions */}
//                 <div className="psg-edit-question-section">
//                   <div className="psg-edit-question-header">
//                     <h4 className="psg-edit-question-title">
//                       Technical Questions
//                     </h4>
//                     <button
//                       type="button"
//                       className="psg-edit-btn psg-edit-btn-secondary psg-edit-btn-sm"
//                       onClick={() => addQuestion(roundIndex, 'technical')}
//                     >
//                       Add Question
//                     </button>
//                   </div>

//                   {(round?.technicalQuestions || []).map((question, qIndex) => (
//                     <div key={qIndex} className="psg-edit-question-card">
//                       <div className="psg-edit-question-meta">
//                         <span className="psg-edit-question-number">
//                           Question {qIndex + 1}
//                         </span>
//                         <button
//                           type="button"
//                           className="psg-edit-btn psg-edit-btn-danger psg-edit-btn-sm"
//                           onClick={() => removeQuestion(roundIndex, qIndex, 'technical')}
//                         >
//                           Remove
//                         </button>
//                       </div>

//                       <div className="psg-edit-grid">
//                         <div className="psg-edit-field psg-edit-grid-full">
//                           <label className="psg-edit-label">
//                             Question
//                           </label>
//                           <textarea
//                             className="psg-edit-textarea"
//                             value={question.question}
//                             onChange={(e) => updateQuestion(roundIndex, qIndex, 'question', e.target.value, 'technical')}
//                             placeholder="Describe the technical question asked..."
//                             rows="3"
//                           />
//                         </div>

//                         <div className="psg-edit-field">
//                           <label className="psg-edit-label">
//                             Difficulty Level
//                           </label>
//                           <select
//                             className="psg-edit-select"
//                             value={question.difficulty}
//                             onChange={(e) => updateQuestion(roundIndex, qIndex, 'difficulty', e.target.value, 'technical')}
//                           >
//                             <option value="Easy">Easy</option>
//                             <option value="Medium">Medium</option>
//                             <option value="Hard">Hard</option>
//                           </select>
//                         </div>

//                         <div className="psg-edit-field">
//                           <label className="psg-edit-label">
//                             Topics (comma separated)
//                           </label>
//                           <input
//                             type="text"
//                             className="psg-edit-input"
//                             value={Array.isArray(question.topics) ? question.topics.join(', ') : (question.topics || '')}
//                             onChange={(e) => updateQuestion(roundIndex, qIndex, 'topics', e.target.value, 'technical')}
//                             onBlur={(e) => updateQuestion(roundIndex, qIndex, 'topics', e.target.value.split(',').map(t => t.trim()).filter(t => t), 'technical')}
//                             placeholder="Arrays, Dynamic Programming, etc."
//                           />
//                         </div>

//                         <div className="psg-edit-field psg-edit-grid-full">
//                           <label className="psg-edit-label">
//                             Solution Approach
//                           </label>
//                           <textarea
//                             className="psg-edit-textarea"
//                             value={question.solution}
//                             onChange={(e) => updateQuestion(roundIndex, qIndex, 'solution', e.target.value, 'technical')}
//                             placeholder="Describe your approach to solving this question..."
//                             rows="3"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Behavioral Questions */}
//                 <div className="psg-edit-question-section">
//                   <div className="psg-edit-question-header">
//                     <h4 className="psg-edit-question-title">
//                       Behavioral Questions
//                     </h4>
//                     <button
//                       type="button"
//                       className="psg-edit-btn psg-edit-btn-secondary psg-edit-btn-sm"
//                       onClick={() => addQuestion(roundIndex, 'behavioral')}
//                     >
//                       Add Question
//                     </button>
//                   </div>

//                   {(round?.behavioralQuestions || []).map((question, qIndex) => (
//                     <div key={qIndex} className="psg-edit-question-card">
//                       <div className="psg-edit-question-meta">
//                         <span className="psg-edit-question-number">
//                           Question {qIndex + 1}
//                         </span>
//                         <button
//                           type="button"
//                           className="psg-edit-btn psg-edit-btn-danger psg-edit-btn-sm"
//                           onClick={() => removeQuestion(roundIndex, qIndex, 'behavioral')}
//                         >
//                           Remove
//                         </button>
//                       </div>

//                       <div className="psg-edit-grid">
//                         <div className="psg-edit-field psg-edit-grid-full">
//                           <label className="psg-edit-label">
//                             Question
//                           </label>
//                           <textarea
//                             className="psg-edit-textarea"
//                             value={question.question}
//                             onChange={(e) => updateQuestion(roundIndex, qIndex, 'question', e.target.value, 'behavioral')}
//                             placeholder="Describe the behavioral question asked..."
//                             rows="2"
//                           />
//                         </div>

//                         <div className="psg-edit-field">
//                           <label className="psg-edit-label">
//                             Category
//                           </label>
//                           <select
//                             className="psg-edit-select"
//                             value={question.category}
//                             onChange={(e) => updateQuestion(roundIndex, qIndex, 'category', e.target.value, 'behavioral')}
//                           >
//                             <option value="Personal">Personal</option>
//                             <option value="Behavioral">Behavioral</option>
//                             <option value="Situational">Situational</option>
//                             <option value="Company-specific">Company-specific</option>
//                           </select>
//                         </div>

//                         <div className="psg-edit-field psg-edit-grid-full">
//                           <label className="psg-edit-label">
//                             Your Answer
//                           </label>
//                           <textarea
//                             className="psg-edit-textarea"
//                             value={question.yourAnswer}
//                             onChange={(e) => updateQuestion(roundIndex, qIndex, 'yourAnswer', e.target.value, 'behavioral')}
//                             placeholder="How did you answer this question?"
//                             rows="3"
//                           />
//                         </div>

//                         <div className="psg-edit-field psg-edit-grid-full">
//                           <label className="psg-edit-label">
//                             Tips for Others
//                           </label>
//                           <textarea
//                             className="psg-edit-textarea"
//                             value={question.tips}
//                             onChange={(e) => updateQuestion(roundIndex, qIndex, 'tips', e.target.value, 'behavioral')}
//                             placeholder="Any tips for future candidates?"
//                             rows="2"
//                           />
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             ))}

//             <div className="psg-edit-text-center">
//               <button
//                 type="button"
//                 className="psg-edit-btn psg-edit-btn-ghost"
//                 onClick={addRound}
//               >
//                 Add Another Round
//               </button>
//             </div>
//           </div>

//           {/* Preparation & Tips Section */}
//           <div className="psg-edit-section">
//             <div className="psg-edit-section-header">
//               <h2 className="psg-edit-section-title">
//                 Preparation & Tips
//               </h2>
//               <div className="psg-edit-section-divider"></div>
//             </div>

//             <div className="psg-edit-grid">
//               <div className="psg-edit-field">
//                 <label className="psg-edit-label psg-edit-label-required">
//                   Preparation Time (weeks)
//                 </label>
//                 <input
//                   type="number"
//                   className="psg-edit-input"
//                   value={formData.preparationTime}
//                   onChange={(e) => handleInputChange(null, 'preparationTime', e.target.value ? parseInt(e.target.value) : '')}
//                   placeholder="How many weeks did you prepare?"
//                   required
//                 />
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label">
//                   Overall Rating (1-5)
//                 </label>
//                 <select
//                   className="psg-edit-select"
//                   value={formData.overallRating}
//                   onChange={(e) => handleInputChange(null, 'overallRating', parseInt(e.target.value))}
//                 >
//                   <option value={1}>1 - Poor</option>
//                   <option value={2}>2 - Below Average</option>
//                   <option value={3}>3 - Average</option>
//                   <option value={4}>4 - Good</option>
//                   <option value={5}>5 - Excellent</option>
//                 </select>
//               </div>

//               <div className="psg-edit-field psg-edit-grid-full">
//                 <label className="psg-edit-label">
//                   Overall Experience Summary
//                 </label>
//                 <textarea
//                   className="psg-edit-textarea"
//                   value={formData.overallExperience}
//                   onChange={(e) => handleInputChange(null, 'overallExperience', e.target.value)}
//                   placeholder="Summarize your overall interview experience in a few sentences..."
//                   rows="3"
//                 />
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label">
//                   Final Result
//                 </label>
//                 <select
//                   className="psg-edit-select"
//                   value={formData.finalResult}
//                   onChange={(e) => handleInputChange(null, 'finalResult', e.target.value)}
//                 >
//                   <option value="Selected">Selected</option>
//                   <option value="Rejected">Rejected</option>
//                   <option value="Withdrawn">Withdrawn</option>
//                   <option value="Pending">Pending</option>
//                 </select>
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label psg-edit-label-required">
//                   Would you recommend this company?
//                 </label>
//                 <select
//                   className="psg-edit-select"
//                   value={formData.wouldRecommend}
//                   onChange={(e) => handleInputChange(null, 'wouldRecommend', e.target.value === 'true')}
//                   required
//                 >
//                   <option value={true}>Yes</option>
//                   <option value={false}>No</option>
//                 </select>
//               </div>

//               <div className="psg-edit-field psg-edit-grid-full">
//                 <label className="psg-edit-label">
//                   Resources Used (comma separated)
//                 </label>
//                 <input
//                   type="text"
//                   className="psg-edit-input"
//                   value={Array.isArray(formData.resourcesUsed) ? formData.resourcesUsed.join(', ') : formData.resourcesUsed || ''}
//                   onChange={(e) => handleStringInput(null, 'resourcesUsed', e.target.value)}
//                   onBlur={(e) => handleArrayInput(null, 'resourcesUsed', e.target.value)}
//                   placeholder="LeetCode, GeeksforGeeks, System Design Primer, etc."
//                 />
//               </div>

//               <div className="psg-edit-field psg-edit-grid-full">
//                 <label className="psg-edit-label psg-edit-label-required">
//                   Key Tips
//                 </label>
//                 <textarea
//                   className="psg-edit-textarea"
//                   value={formData.keyTips}
//                   onChange={(e) => handleInputChange(null, 'keyTips', e.target.value)}
//                   placeholder="Share your most important tips for others..."
//                   rows="4"
//                   required
//                 />
//               </div>

//               <div className="psg-edit-field psg-edit-grid-full">
//                 <label className="psg-edit-label psg-edit-label-required">
//                   Mistakes to Avoid
//                 </label>
//                 <textarea
//                   className="psg-edit-textarea"
//                   value={formData.mistakesToAvoid}
//                   onChange={(e) => handleInputChange(null, 'mistakesToAvoid', e.target.value)}
//                   placeholder="What mistakes should others avoid?"
//                   rows="4"
//                   required
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Background Information Section */}
//           <div className="psg-edit-section">
//             <div className="psg-edit-section-header">
//               <h2 className="psg-edit-section-title">
//                 Background Information
//               </h2>
//               <div className="psg-edit-section-divider"></div>
//             </div>

//             <div className="psg-edit-grid">
//               <div className="psg-edit-field">
//                 <label className="psg-edit-label psg-edit-label-required">
//                   Year of Study
//                 </label>
//                 <select
//                   className="psg-edit-select"
//                   value={formData.backgroundInfo.yearOfStudy}
//                   onChange={(e) => handleInputChange('backgroundInfo', 'yearOfStudy', e.target.value)}
//                   required
//                 >
//                   <option value="1st Year">1st Year</option>
//                   <option value="2nd Year">2nd Year</option>
//                   <option value="3rd Year">3rd Year</option>
//                   <option value="4th Year">4th Year</option>
//                   <option value="Graduate">Graduate</option>
//                   <option value="Postgraduate">Postgraduate</option>
//                 </select>
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label">
//                   CGPA
//                 </label>
//                 <input
//                   type="number"
//                   className="psg-edit-input"
//                   step="0.01"
//                   min="0"
//                   max="10"
//                   value={formData.backgroundInfo.cgpa}
//                   onChange={(e) => handleInputChange('backgroundInfo', 'cgpa', e.target.value ? parseFloat(e.target.value) : '')}
//                   placeholder="e.g., 8.5"
//                 />
//               </div>

//               <div className="psg-edit-field">
//                 <label className="psg-edit-label">
//                   Previous Internships
//                 </label>
//                 <input
//                   type="number"
//                   className="psg-edit-input"
//                   min="0"
//                   value={formData.backgroundInfo.previousInternships}
//                   onChange={(e) => handleInputChange('backgroundInfo', 'previousInternships', e.target.value ? parseInt(e.target.value) : '')}
//                   placeholder="Number of previous internships"
//                 />
//               </div>

//               <div className="psg-edit-field psg-edit-grid-full">
//                 <label className="psg-edit-label">
//                   Relevant Projects (comma separated)
//                 </label>
//                 <input
//                   type="text"
//                   className="psg-edit-input"
//                   value={Array.isArray(formData.backgroundInfo.relevantProjects) ? formData.backgroundInfo.relevantProjects.join(', ') : formData.backgroundInfo.relevantProjects || ''}
//                   onChange={(e) => handleStringInput('backgroundInfo', 'relevantProjects', e.target.value)}
//                   onBlur={(e) => handleArrayInput('backgroundInfo', 'relevantProjects', e.target.value)}
//                   placeholder="Project 1, Project 2, etc."
//                 />
//               </div>

//               <div className="psg-edit-field psg-edit-grid-full">
//                 <label className="psg-edit-label">
//                   Skills (comma separated)
//                 </label>
//                 <input
//                   type="text"
//                   className="psg-edit-input"
//                   value={Array.isArray(formData.backgroundInfo.skills) ? formData.backgroundInfo.skills.join(', ') : formData.backgroundInfo.skills || ''}
//                   onChange={(e) => handleStringInput('backgroundInfo', 'skills', e.target.value)}
//                   onBlur={(e) => handleArrayInput('backgroundInfo', 'skills', e.target.value)}
//                   placeholder="JavaScript, Python, React, etc."
//                 />
//               </div>

//               <div className="psg-edit-field">
//                 <label style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer'}}>
//                   <input
//                     type="checkbox"
//                     checked={formData.isAnonymous}
//                     onChange={(e) => handleInputChange(null, 'isAnonymous', e.target.checked)}
//                     style={{width: 'auto', margin: 0}}
//                   />
//                   <span className="psg-edit-label" style={{margin: 0, padding: 0}}>Share anonymously</span>
//                 </label>
//               </div>
//             </div>
//           </div>

//           {/* Form Actions */}
//           <div className="psg-edit-actions">
//             <button
//               type="button"
//               className="psg-edit-btn psg-edit-btn-ghost"
//               onClick={() => navigate('/experiences')}
//               disabled={submitting}
//             >
//               Cancel
//             </button>

//             <button
//               type="submit"
//               className={`psg-edit-btn psg-edit-btn-primary psg-edit-btn-lg ${submitting ? 'psg-edit-loading' : ''}`}
//               disabled={submitting}
//             >
//               {submitting ? (
//                 <>
//                   <div className="psg-edit-spinner" style={{width: '20px', height: '20px', border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white'}}></div>
//                   Saving Changes...
//                 </>
//               ) : (
//                 <>
//                   Save Changes
//                 </>
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default EditExperience;
