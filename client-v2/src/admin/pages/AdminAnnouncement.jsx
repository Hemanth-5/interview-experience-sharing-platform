import React, { useState, useEffect } from 'react';
import { fetchWithAdminAuth } from '../utils/adminAuth';
import PSGNotification from '../../components/PSGNotification';
import { 
  Megaphone, 
  Send, 
  Users, 
  Bell, 
  AlertCircle, 
  CheckCircle,
  RefreshCw,
  MessageSquare,
  Target,
  Settings,
  User,
  Search,
  Filter,
  X
} from 'lucide-react';

const AdminAnnouncement = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [announcementType, setAnnouncementType] = useState('global'); // 'global' or 'targeted'
  const [priority, setPriority] = useState('medium');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Toast notification state
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
  };

  useEffect(() => {
    if (announcementType === 'targeted') {
      fetchUsers();
    }
  }, [announcementType]);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetchWithAdminAuth('/api/admin/users?role=Student&limit=1000');
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUsers(data.data.users || []);
        }
      } else {
        showNotification('Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Failed to fetch users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (announcementType === 'global') {
        // Send to all users
        const response = await fetchWithAdminAuth('/api/admin/announce', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, message, priority })
        });

        if (response.ok) {
          const data = await response.json();
          showNotification(data.message || 'Announcement sent to all users!', 'success');
          setTitle('');
          setMessage('');
        } else {
          const errorData = await response.json();
          showNotification(errorData.message || 'Failed to send announcement', 'error');
        }
      } else {
        // Send to selected users
        if (selectedUsers.length === 0) {
          showNotification('Please select at least one user', 'warning');
          return;
        }

        const response = await fetchWithAdminAuth('/api/admin/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userIds: selectedUsers,
            title,
            message,
            priority,
            type: 'admin_announcement'
          })
        });

        if (response.ok) {
          const data = await response.json();
          showNotification(data.message || `Notification sent to ${selectedUsers.length} users!`, 'success');
          setTitle('');
          setMessage('');
          setSelectedUsers([]);
        } else {
          const errorData = await response.json();
          showNotification(errorData.message || 'Failed to send notification', 'error');
        }
      }
    } catch (err) {
      console.error('Error sending announcement:', err);
      showNotification('Failed to send announcement', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const selectAllUsers = () => {
    const filteredUserIds = filteredUsers.map(user => user._id);
    setSelectedUsers(prev => 
      prev.length === filteredUserIds.length 
        ? [] 
        : filteredUserIds
    );
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Send Announcements</h1>
              <p className="text-gray-600 dark:text-gray-400">Broadcast messages to users across the platform</p>
            </div>
          </div>
        </div>

        {/* Toast Notification */}
        <PSGNotification 
          show={notification.show} 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification({ show: false, message: '', type: '' })} 
        />

        {/* Announcement Type Selection */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Announcement Type</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
              announcementType === 'global' 
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}>
              <input
                type="radio"
                name="announcementType"
                value="global"
                checked={announcementType === 'global'}
                onChange={(e) => setAnnouncementType(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <Users className={`w-6 h-6 ${announcementType === 'global' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                <div>
                  <p className={`font-medium ${announcementType === 'global' ? 'text-blue-900 dark:text-blue-200' : 'text-gray-900 dark:text-white'}`}>
                    Global Announcement
                  </p>
                  <p className={`text-sm ${announcementType === 'global' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}`}>
                    Send to all platform users
                  </p>
                </div>
              </div>
            </label>

            <label className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
              announcementType === 'targeted' 
                ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}>
              <input
                type="radio"
                name="announcementType"
                value="targeted"
                checked={announcementType === 'targeted'}
                onChange={(e) => setAnnouncementType(e.target.value)}
                className="sr-only"
              />
              <div className="flex items-center space-x-3">
                <Target className={`w-6 h-6 ${announcementType === 'targeted' ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                <div>
                  <p className={`font-medium ${announcementType === 'targeted' ? 'text-green-900 dark:text-green-200' : 'text-gray-900 dark:text-white'}`}>
                    Targeted Notification
                  </p>
                  <p className={`text-sm ${announcementType === 'targeted' ? 'text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}`}>
                    Send to selected users
                  </p>
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* User Selection (for targeted announcements) */}
        {announcementType === 'targeted' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Recipients</h3>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {selectedUsers.length} of {filteredUsers.length} users selected
              </div>
            </div>

            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-between items-center mb-4">
              <button
                type="button"
                onClick={selectAllUsers}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                <CheckCircle className="w-4 h-4" />
                <span>{selectedUsers.length === filteredUsers.length ? 'Deselect All' : 'Select All'}</span>
              </button>
              
              {selectedUsers.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedUsers([])}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                >
                  <X className="w-4 h-4" />
                  <span>Clear Selection</span>
                </button>
              )}
            </div>

            {loadingUsers ? (
              <div className="text-center py-8">
                <RefreshCw className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-2" />
                <p className="text-gray-600 dark:text-gray-400">Loading users...</p>
              </div>
            ) : (
              <div className="max-h-64 overflow-y-auto border border-gray-200 dark:border-gray-600 rounded-lg">
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-gray-600 dark:text-gray-400">
                    No users found matching your search.
                  </div>
                ) : (
                  <div className="divide-y divide-gray-200 dark:divide-gray-600">
                    {filteredUsers.map(user => (
                      <label key={user._id} className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user._id)}
                          onChange={() => toggleUserSelection(user._id)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                        />
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Priority Selection (for targeted announcements) */}
        {announcementType === 'targeted' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Priority Level</h3>
            </div>
            
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        )}

        {/* Announcement Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Announcement Content</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={100}
                placeholder="Enter announcement title..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {title.length}/100 characters
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={6}
                placeholder="Write your announcement here. You can use line breaks for formatting."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {message.length} characters
              </p>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={loading || (announcementType === 'targeted' && selectedUsers.length === 0)}
                className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>
                  {loading ? 'Sending...' : 
                   announcementType === 'global' ? 'Send Global Announcement' : 
                   `Send to ${selectedUsers.length} User${selectedUsers.length !== 1 ? 's' : ''}`}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminAnnouncement;
