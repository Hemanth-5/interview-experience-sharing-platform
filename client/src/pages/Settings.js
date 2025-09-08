import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { createApiUrl } from '../config/api';
import Avatar from '../components/Avatar';
import { extractUserName } from '../utils/avatar';
import './Settings.css';

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
    <div className="settings-section">
      <div className="section-header">
        <h2>Profile Information</h2>
        <p>Manage your public profile information</p>
      </div>

      <form onSubmit={handleSaveProfile} className="settings-form">
        <div className="profile-avatar-section">
          <Avatar 
            user={user}
            size={80}
            className="settings-avatar"
          />
          <div className="avatar-info">
            <h3>{extractUserName(user?.name) || user?.name}</h3>
            <p className="avatar-email">{user?.email}</p>
            <p className="avatar-note">Profile picture is managed through your Google account</p>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="name" className="settings-form-label required">Full Name</label>
          <input
            type="text"
            id="name"
            className="form-input"
            value={profileData.name}
            onChange={(e) => handleProfileChange('name', e.target.value)}
            disabled
          />
        </div>

        <div className="form-group">
          <label htmlFor="university" className="settings-form-label">University/College</label>
          <input
            type="text"
            id="university"
            className="form-input"
            value={profileData.university}
            onChange={(e) => handleProfileChange('university', e.target.value)}
            placeholder="e.g., PSG College of Technology"
            disabled
          />
        </div>

        <div className="form-group">
          <label htmlFor="graduationYear" className="settings-form-label">Graduation Year</label>
          <select
            id="graduationYear"
            className="form-select"
            value={profileData.graduationYear}
            onChange={(e) => handleProfileChange('graduationYear', e.target.value)}
          >
            <option value="">Select year</option>
            {Array.from({ length: 11 }, (_, i) => 2020 + i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h2>Notification Preferences</h2>
        <p>Choose how you want to receive notifications</p>
      </div>

      <form onSubmit={handleSavePreferences} className="settings-form">
        <div className="preference-group">
          <h3>Email Notifications</h3>
          <div className="preference-item">
            <div className="preference-info">
              <label htmlFor="emailNotifications" className="preference-label">
                Email Notifications
              </label>
              <p className="preference-description">
                Receive email notifications for comments, upvotes, and announcements
              </p>
            </div>
            <div className="preference-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  checked={preferences.notifications.email}
                  onChange={(e) => handlePreferenceChange('notifications', 'email', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="preference-group">
          <h3>Browser Notifications</h3>
          <div className="preference-item">
            <div className="preference-info">
              <label htmlFor="browserNotifications" className="preference-label">
                Browser Notifications
              </label>
              <p className="preference-description">
                Receive push notifications in your browser when the site is open
              </p>
            </div>
            <div className="preference-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="browserNotifications"
                  checked={preferences.notifications.browser}
                  onChange={(e) => handlePreferenceChange('notifications', 'browser', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save Notification Preferences'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h2>Privacy Settings</h2>
        <p>Control what information is visible to other users</p>
      </div>

      <form onSubmit={handleSavePreferences} className="settings-form">
        <div className="preference-group">
          <h3>Profile Visibility</h3>
          
          <div className="preference-item">
            <div className="preference-info">
              <label htmlFor="showEmail" className="preference-label">
                Show Email Address
              </label>
              <p className="preference-description">
                Allow other users to see your email address on your public profile
              </p>
            </div>
            <div className="preference-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="showEmail"
                  checked={preferences.privacy.showEmail}
                  onChange={(e) => handlePreferenceChange('privacy', 'showEmail', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="preference-item">
            <div className="preference-info">
              <label htmlFor="showUniversity" className="preference-label">
                Show University
              </label>
              <p className="preference-description">
                Display your university/college information on your public profile
              </p>
            </div>
            <div className="preference-control">
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  id="showUniversity"
                  checked={preferences.privacy.showUniversity}
                  onChange={(e) => handlePreferenceChange('privacy', 'showUniversity', e.target.checked)}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        <div className="privacy-notice">
          <div className="notice-icon">🔒</div>
          <div className="notice-content">
            <h4>Privacy Notice</h4>
            <p>
              Your experiences and contributions will always be associated with your profile. 
              These settings only control the visibility of your personal information like email and university.
            </p>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={saveLoading}
          >
            {saveLoading ? 'Saving...' : 'Save Privacy Settings'}
          </button>
        </div>
      </form>
    </div>
  );

  const renderAccountSettings = () => (
    <div className="settings-section">
      <div className="section-header">
        <h2>Account Management</h2>
        <p>Manage your account and data</p>
      </div>

      <div className="account-info">
        <div className="info-item">
          <div className="info-label">Account Type</div>
          <div className="info-value">{user?.role || 'Student'}</div>
        </div>
        {/* <div className="info-item">
          <div className="info-label">Member Since</div>
          <div className="info-value">
            {user?.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'N/A'}
          </div>
        </div> */}
        <div className="info-item">
          <div className="info-label">Total Experiences</div>
          <div className="info-value">{user?.stats?.experiencesShared || 0}</div>
        </div>
      </div>

      {/* <div className="danger-zone">
        <h3>Danger Zone</h3>
        <p>Once you delete your account, there is no going back. Please be certain.</p>
        <button 
          onClick={handleDeleteAccount}
          className="btn btn-danger"
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete Account'}
        </button>
      </div> */}
    </div>
  );

  return (
    <div className="settings-page">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account preferences and privacy settings</p>
      </div>

      {message && (
        <div className="settings-message success">
          <i className="fas fa-check-circle"></i>
          {message}
        </div>
      )}

      {error && (
        <div className="settings-message error">
          <i className="fas fa-exclamation-triangle"></i>
          {error}
        </div>
      )}

      <div className="settings-content">
        <div className="settings-navigation">
          <nav className="settings-nav">
            <button
              className={`settings-nav-item ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveSection('profile')}
            >
              <i className="fas fa-user"></i>
              Profile
            </button>
            {/* <button
              className={`settings-nav-item ${activeSection === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveSection('notifications')}
            >
              <i className="fas fa-bell"></i>
              Notifications
            </button> */}
            <button
              className={`settings-nav-item ${activeSection === 'privacy' ? 'active' : ''}`}
              onClick={() => setActiveSection('privacy')}
            >
              <i className="fas fa-shield-alt"></i>
              Privacy
            </button>
            <button
              className={`settings-nav-item ${activeSection === 'account' ? 'active' : ''}`}
              onClick={() => setActiveSection('account')}
            >
              <i className="fas fa-cog"></i>
              Account
            </button>
          </nav>
        </div>

        <div className="settings-main">
          {activeSection === 'profile' && renderProfileSettings()}
          {/* {activeSection === 'notifications' && renderNotificationSettings()} */}
          {activeSection === 'privacy' && renderPrivacySettings()}
          {activeSection === 'account' && renderAccountSettings()}
        </div>
      </div>
    </div>
  );
};

export default Settings;
