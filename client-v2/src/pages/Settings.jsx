import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import Avatar from '../components/Avatar.jsx';
import { extractUserName } from '../utils/avatar';
import DesktopOnlyPrompt from '../components/DesktopOnlyPrompt';
import { useIsDesktopRequired } from '../utils/deviceDetection';
import { 
  User, 
  Bell, 
  Shield, 
  Settings as SettingsIcon, 
  Check, 
  AlertTriangle, 
  Lock, 
  Mail, 
  Globe, 
  Eye, 
  EyeOff,
  Save,
  Calendar,
  GraduationCap,
  Building,
  Star,
  Loader,
  ChevronDown,
  Search
} from 'lucide-react';

// Branch options
const BRANCH_OPTIONS = [
  "B. E.",
  "B. Tech.",
  "B. Sc.",
  "Other"
];

// Department options
const DEPARTMENT_OPTIONS = [
  "Automobile Engineering",
  "Biomedical Engineering", 
  "Civil Engineering",
  "Computer Science and Engineering",
  "Computer Science and Engineering (AI and ML)",
  "Electrical and Electronics Engineering",
  "Electronics and Communication Engineering",
  "Instrumentation and Control Engineering",
  "Mechanical Engineering",
  "Metallurgical Engineering",
  "Production Engineering",
  "Robotics and Automation",
  "Bio Technology",
  "Fashion Technology",
  "Information Technology",
  "Textile Technology",
  "Electrical and Electronics Engineering (Sandwich)",
  "Mechanical Engineering (Sandwich)",
  "Production Engineering (Sandwich)",
  "Applied Science",
  "Computer Systems and Design"
];

// Searchable Dropdown Component
const SearchableDropdown = ({ 
  value, 
  onChange, 
  options, 
  placeholder, 
  className = "",
  icon: Icon,
  required = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (option) => {
    onChange(option);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputClick = () => {
    setIsOpen(!isOpen);
    setSearchTerm('');
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
        )}
        <input
          type="text"
          className={`w-full ${Icon ? 'pl-10' : 'pl-4'} pr-10 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground cursor-pointer`}
          value={isOpen ? searchTerm : value}
          onClick={handleInputClick}
          onChange={handleSearchChange}
          placeholder={placeholder}
          required={required}
          autoComplete="off"
        />
        <ChevronDown 
          className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className="px-4 py-2 hover:bg-secondary cursor-pointer text-foreground"
                onClick={() => handleSelect(option)}
              >
                {option}
              </div>
            ))
          ) : (
            <div className="px-4 py-2 text-muted-foreground">
              No options found
            </div>
          )}
        </div>
      )}
      
      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const Settings = () => {
  const { user, updateUser } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('profile');

  // Form data for profile settings
  const [profileData, setProfileData] = useState({
    name: '',
    university: '',
    graduationYear: '',
  });

  // Form data for background information
  const [backgroundData, setBackgroundData] = useState({
    cgpa: '',
    previousInternships: 0,
    relevantProjects: [],
    skills: [],
    yearOfStudy: '3rd Year',
    branch: '',
    department: ''
  });

  // Form data for preferences
  const [preferences, setPreferences] = useState({
    notifications: {
      email: true,
      browser: true
    },
    privacy: {
      showEmail: false,
      showUniversity: true
    }
  });

  // Temporarily disable desktop-only restriction to debug
  // TODO: Re-enable after fixing the core issue
  // Add error boundary for device detection
  // let isDesktopRequired = false;
  // try {
  //   isDesktopRequired = useIsDesktopRequired();
  // } catch (error) {
  //   console.error('Device detection error:', error);
  //   isDesktopRequired = false; // Default to allowing access
  // }
  
  // // Early return for mobile users (after all hooks)
  // if (isDesktopRequired) {
  //   try {
  //     return <DesktopOnlyPrompt />;
  //   } catch (error) {
  //     console.error('DesktopOnlyPrompt error:', error);
  //     // Fallback UI if DesktopOnlyPrompt fails
  //     return (
  //       <div className="min-h-screen bg-background flex items-center justify-center p-4">
  //         <div className="max-w-md w-full text-center">
  //           <h2 className="text-2xl font-bold text-foreground mb-4">Desktop Required</h2>
  //           <p className="text-muted-foreground">This feature is optimized for desktop use only.</p>
  //         </div>
  //       </div>
  //     );
  //   }
  // }

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        university: user.university || '',
        graduationYear: user.graduationYear || '',
      });

      setBackgroundData({
        cgpa: user.backgroundData?.cgpa || '',
        previousInternships: user.backgroundData?.previousInternships || 0,
        relevantProjects: Array.isArray(user.backgroundData?.relevantProjects) 
          ? user.backgroundData.relevantProjects.join(', ') 
          : user.backgroundData?.relevantProjects || '',
        skills: Array.isArray(user.backgroundData?.skills) 
          ? user.backgroundData.skills.join(', ') 
          : user.backgroundData?.skills || '',
        yearOfStudy: user.backgroundData?.yearOfStudy || '3rd Year',
        branch: user.backgroundData?.branch || '',
        department: user.backgroundData?.department || ''
      });

      setPreferences({
        notifications: {
          email: user.preferences?.notifications?.email !== false,
          browser: user.preferences?.notifications?.browser !== false
        },
        privacy: {
          showEmail: user.preferences?.privacy?.showEmail === true,
          showUniversity: user.preferences?.privacy?.showUniversity !== false
        }
      });
    }
  }, [user]);

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleBackgroundChange = (field, value) => {
    setBackgroundData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleArrayInputChange = (field, value) => {
    // Store the raw string value, convert to array only when saving
    setBackgroundData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (category, field, value) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      setError('');
      setMessage('');

      const response = await axios.put(
        createApiUrl('/api/users/profile'),
        profileData,
        { withCredentials: true }
      );

      if (response.data.success) {
        updateUser(response.data.data);
        setMessage('Profile updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update profile');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSaveBackground = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setError('');
    setMessage('');

    try {
      // Convert string fields to arrays before saving
      const processedBackgroundData = {
        ...backgroundData,
        skills: typeof backgroundData.skills === 'string' 
          ? backgroundData.skills.split(',').map(item => item.trim()).filter(item => item)
          : backgroundData.skills,
        relevantProjects: typeof backgroundData.relevantProjects === 'string'
          ? backgroundData.relevantProjects.split(',').map(item => item.trim()).filter(item => item)
          : backgroundData.relevantProjects
      };

      const response = await axios.put(
        createApiUrl('/api/users/profile'),
        { backgroundData: processedBackgroundData },
        { withCredentials: true }
      );

      if (response.data.success) {
        updateUser(response.data.data);
        setMessage('Background information updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update background information');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    try {
      setSaveLoading(true);
      setError('');
      setMessage('');

      const response = await axios.put(
        createApiUrl('/api/users/profile'),
        { preferences },
        { withCredentials: true }
      );

      if (response.data.success) {
        updateUser(response.data.data);
        setMessage('Preferences updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update preferences');
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      if (window.confirm('This will permanently delete all your experiences and data. Type "DELETE" to confirm.')) {
        const confirmation = prompt('Please type "DELETE" to confirm account deletion:');
        if (confirmation === 'DELETE') {
          try {
            setLoading(true);
            await axios.delete(createApiUrl('/api/users/account'), {
              withCredentials: true
            });
            
            // Redirect to home page
            window.location.href = '/';
          } catch (error) {
            setError(error.response?.data?.message || 'Failed to delete account');
            setLoading(false);
          }
        }
      }
    }
  };

  const renderProfileSettings = () => (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Profile Information</h2>
        <p className="text-muted-foreground">Manage your public profile information</p>
      </div>

      <form onSubmit={handleSaveProfile} className="space-y-6">
        <div className="flex items-center space-x-6 p-4 bg-muted/50 rounded-lg">
          <Avatar 
            user={user}
            size={80}
            className="ring-4 ring-blue-100 dark:ring-blue-900/30 shadow-lg"
          />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">{extractUserName(user?.name) || user?.name}</h3>
            <p className="text-muted-foreground mb-1">{user?.email}</p>
            <p className="text-sm text-muted-foreground flex items-center space-x-1">
              <Lock className="w-3 h-3" />
              <span>Profile picture is managed through your Google account</span>
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                id="name"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                value={profileData.name}
                onChange={(e) => handleProfileChange('name', e.target.value)}
                disabled
              />
            </div>
          </div>

          <div>
            <label htmlFor="university" className="block text-sm font-medium text-foreground mb-2">University/College</label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                id="university"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                value={profileData.university}
                onChange={(e) => handleProfileChange('university', e.target.value)}
                placeholder="e.g., PSG College of Technology"
                disabled
              />
            </div>
          </div>

          <div>
            <label htmlFor="graduationYear" className="block text-sm font-medium text-foreground mb-2">Graduation Year</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                id="graduationYear"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground appearance-none"
                value={profileData.graduationYear}
                onChange={(e) => handleProfileChange('graduationYear', e.target.value)}
              >
                <option value="">Select year</option>
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saveLoading}
          >
            {saveLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Profile
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderBackgroundSettings = () => (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Background Information</h2>
        <p className="text-muted-foreground">Manage your academic and professional background</p>
      </div>

      {/* Current Background Status Display */}
      {user?.backgroundData && (
        <div className="mb-8 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h3 className="text-lg font-medium text-blue-700 dark:text-blue-300 mb-4 flex items-center space-x-2">
            <GraduationCap className="w-5 h-5" />
            <span>Current Background Status</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {user.backgroundData.yearOfStudy || 'Not set'}
              </div>
              <div className="text-xs text-muted-foreground">Year of Study</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <div className="text-lg font-bold text-green-600 dark:text-green-400">
                {user.backgroundData.cgpa || 'Not set'}
              </div>
              <div className="text-xs text-muted-foreground">CGPA</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {user.backgroundData.previousInternships || 0}
              </div>
              <div className="text-xs text-muted-foreground">Internships</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {user.backgroundData.branch || 'Not set'}
              </div>
              <div className="text-xs text-muted-foreground">Branch</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
              <div className="text-sm font-bold text-cyan-600 dark:text-cyan-400 text-center">
                {user.backgroundData.department || 'Not set'}
              </div>
              <div className="text-xs text-muted-foreground">Department</div>
            </div>
          </div>

          {/* Current Skills */}
          {user.backgroundData.skills && user.backgroundData.skills.length > 0 && (
            <div className="mb-3">
              <h4 className="font-medium mb-2 text-sm text-blue-700 dark:text-blue-300">Current Skills</h4>
              <div className="flex flex-wrap gap-2">
                {user.backgroundData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Current Projects */}
          {user.backgroundData.relevantProjects && user.backgroundData.relevantProjects.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-sm text-blue-700 dark:text-blue-300">Current Projects</h4>
              <div className="space-y-1">
                {user.backgroundData.relevantProjects.map((project, index) => (
                  <div
                    key={index}
                    className="text-sm text-blue-600 dark:text-blue-400 bg-white/50 dark:bg-gray-800/50 rounded px-2 py-1"
                  >
                    • {project}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <form onSubmit={handleSaveBackground} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="yearOfStudy" className="block text-sm font-medium text-foreground mb-2">
              Year of Study <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <select
                id="yearOfStudy"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground"
                value={backgroundData.yearOfStudy}
                onChange={(e) => handleBackgroundChange('yearOfStudy', e.target.value)}
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
          </div>

          <div>
            <label htmlFor="cgpa" className="block text-sm font-medium text-foreground mb-2">CGPA/GPA</label>
            <div className="relative">
              <Star className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                id="cgpa"
                step="0.01"
                min="0"
                max="10"
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground"
                value={backgroundData.cgpa}
                onChange={(e) => handleBackgroundChange('cgpa', e.target.value)}
                placeholder="8.5"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="branch" className="block text-sm font-medium text-foreground mb-2">
              Branch <span className="text-red-500">*</span>
            </label>
            <SearchableDropdown
              value={backgroundData.branch}
              onChange={(value) => handleBackgroundChange('branch', value)}
              options={BRANCH_OPTIONS}
              placeholder="Select your branch"
              icon={GraduationCap}
              required
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-foreground mb-2">
              Department <span className="text-red-500">*</span>
            </label>
            <SearchableDropdown
              value={backgroundData.department}
              onChange={(value) => handleBackgroundChange('department', value)}
              options={DEPARTMENT_OPTIONS}
              placeholder="Search and select your department"
              icon={Building}
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="previousInternships" className="block text-sm font-medium text-foreground mb-2">Previous Internships</label>
          <div className="relative">
            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="number"
              id="previousInternships"
              min="0"
              className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground"
              value={backgroundData.previousInternships}
              onChange={(e) => handleBackgroundChange('previousInternships', parseInt(e.target.value) || 0)}
              placeholder="Number of previous internships"
            />
          </div>
        </div>

        <div>
          <label htmlFor="relevantProjects" className="block text-sm font-medium text-foreground mb-2">Relevant Projects</label>
          <textarea
            id="relevantProjects"
            rows="3"
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground resize-none"
            value={backgroundData.relevantProjects}
            onChange={(e) => handleArrayInputChange('relevantProjects', e.target.value)}
            placeholder="E-commerce Website, Task Manager App, Data Analysis Tool (comma-separated)"
          />
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-foreground mb-2">Skills & Technologies</label>
          <textarea
            id="skills"
            rows="3"
            className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-background text-foreground resize-none"
            value={backgroundData.skills}
            onChange={(e) => handleArrayInputChange('skills', e.target.value)}
            placeholder="JavaScript, Python, React, Node.js, MongoDB (comma-separated)"
          />
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saveLoading}
          >
            {saveLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Background Info
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Notification Preferences</h2>
        <p className="text-muted-foreground">Choose how you want to receive notifications</p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
            <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Email Notifications</span>
          </h3>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="emailNotifications" className="block font-medium text-foreground mb-1">
                  Email Notifications
                </label>
                <p className="text-sm text-muted-foreground">
                  Receive email notifications for comments, upvotes, and announcements
                </p>
              </div>
              <div className="ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    checked={preferences.notifications.email}
                    onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
            <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span>Browser Notifications</span>
          </h3>
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="browserNotifications" className="block font-medium text-foreground mb-1">
                  Browser Notifications
                </label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in your browser when the site is open
                </p>
              </div>
              <div className="ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="browserNotifications"
                    checked={preferences.notifications.browser}
                    onChange={(e) => handlePreferenceChange('notifications', 'browser', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saveLoading}
          >
            {saveLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Notification Preferences
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Privacy Settings</h2>
        <p className="text-muted-foreground">Control what information is visible to other users</p>
      </div>

      <form onSubmit={handleSavePreferences} className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground flex items-center space-x-2">
            <Eye className="w-5 h-5 text-green-600 dark:text-green-400" />
            <span>Profile Visibility</span>
          </h3>
          
          <div className="bg-muted/50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <label htmlFor="showEmail" className="block font-medium text-foreground mb-1">
                  Show Email Address
                </label>
                <p className="text-sm text-muted-foreground">
                  Allow other users to see your email address on your public profile
                </p>
              </div>
              <div className="ml-4">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    id="showEmail"
                    checked={preferences.privacy.showEmail}
                    onChange={(e) => handlePreferenceChange('privacy', 'showEmail', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <Lock className="w-4 h-4 text-white" />
            </div>
            <div>
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Privacy Notice</h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Your experiences and contributions will always be associated with your profile. 
                These settings only control the visibility of your personal information like email and university.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button 
            type="submit" 
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saveLoading}
          >
            {saveLoading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Privacy Settings
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="bg-card rounded-xl shadow-lg border border-border p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-2">Account Management</h2>
        <p className="text-muted-foreground">Manage your account and data</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/10 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Account Type</div>
                <div className="font-medium text-blue-700 dark:text-blue-300">{user?.role || 'Student'}</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-green-600 dark:text-green-400">Total Experiences</div>
                <div className="font-medium text-green-700 dark:text-green-300">{user?.stats?.experiencesShared || 0}</div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/10 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Member Status</div>
                <div className="font-medium text-purple-700 dark:text-purple-300">Active</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-accent/30">
      <div className="container mx-auto px-4 py-8">
        {/* Settings Header */}
        <div className="bg-card rounded-2xl shadow-xl border border-border p-8 mb-8 relative overflow-hidden">
          <div className="absolute inset-0"></div>
          <div className="relative">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">
              Settings
            </h1>
            <p className="text-muted-foreground">Manage your account preferences and privacy settings</p>
          </div>
        </div>

        {message && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/10 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Check className="w-4 h-4 text-white" />
              </div>
              <div className="text-green-700 dark:text-green-300 font-medium">{message}</div>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/10 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-pink-500 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-white" />
              </div>
              <div className="text-red-700 dark:text-red-300 font-medium">{error}</div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-lg border border-border p-6 sticky top-8">
              <nav className="space-y-2">
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                    activeSection === 'profile' 
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveSection('profile')}
                >
                  <User className="w-5 h-5" />
                  <span>Profile</span>
                </button>
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                    activeSection === 'background' 
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveSection('background')}
                >
                  <GraduationCap className="w-5 h-5" />
                  <span>Background</span>
                </button>
                {/* <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                    activeSection === 'notifications' 
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveSection('notifications')}
                >
                  <Bell className="w-5 h-5" />
                  <span>Notifications</span>
                </button> */}
                {/* <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                    activeSection === 'privacy' 
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveSection('privacy')}
                >
                  <Shield className="w-5 h-5" />
                  <span>Privacy</span>
                </button> */}
                <button
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left font-medium transition-all duration-200 ${
                    activeSection === 'account' 
                      ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                  onClick={() => setActiveSection('account')}
                >
                  <SettingsIcon className="w-5 h-5" />
                  <span>Account</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3">
            {activeSection === 'profile' && renderProfileSettings()}
            {activeSection === 'background' && renderBackgroundSettings()}
            {/* {activeSection === 'notifications' && renderNotificationSettings()} */}
            {/* {activeSection === 'privacy' && renderPrivacySettings()} */}
            {activeSection === 'account' && renderAccountSettings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
