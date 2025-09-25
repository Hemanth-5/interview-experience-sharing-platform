import React, { useState, useEffect, useContext, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { createApiUrl } from '../config/api';
import { Bell, Check, Trash2, ExternalLink, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
// import './NotificationBell.css';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // sm breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Only fetch notifications on desktop
    if (user && !isMobile) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user, isMobile]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await fetch(createApiUrl('/api/users/notifications?limit=10&unreadOnly=false'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Sort notifications by priority and then by creation date
        const sortedNotifications = data.data.notifications.sort((a, b) => {
          // Priority order: urgent > high > medium > low
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority] || priorityOrder.medium;
          const bPriority = priorityOrder[b.priority] || priorityOrder.medium;
          
          // First sort by priority (descending)
          if (aPriority !== bPriority) {
            return bPriority - aPriority;
          }
          
          // Then sort by creation date (newest first)
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
        setNotifications(sortedNotifications);
        setUnreadCount(data.data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(createApiUrl(`/api/users/notifications/${notificationId}/read`), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true, readAt: new Date() }
              : notif
          )
        );
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(createApiUrl('/api/users/notifications/mark-all-read'), {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            read: true, 
            readAt: new Date() 
          }))
        );
        
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearNotification = async (notificationId, event) => {
    // Prevent triggering the notification click handler
    event.stopPropagation();
    
    try {
      const response = await fetch(createApiUrl(`/api/users/notifications/${notificationId}`), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove from local state
        setNotifications(prev => prev.filter(notif => notif._id !== notificationId));
        
        // Update unread count if it was unread
        const notification = notifications.find(n => n._id === notificationId);
        if (notification && !notification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  // Modal state for clear all confirmation
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const clearAllNotifications = async () => {
    setShowClearAllModal(true);
  };

  const handleConfirmClearAll = async () => {
    setShowClearAllModal(false);
    try {
      const response = await fetch(createApiUrl('/api/users/notifications/clear-all'), {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      const data = await response.json();
      if (data.success) {
        setNotifications([]);
        setUnreadCount(0);
        setShowDropdown(false); // Close dropdown after clearing
      } else {
        // Fallback: forcibly clear state even if backend fails
        setNotifications([]);
        setUnreadCount(0);
        setShowDropdown(false);
      }
    } catch (error) {
      setNotifications([]);
      setUnreadCount(0);
      setShowDropdown(false);
      console.error('Error clearing all notifications:', error);
    }
  };

  const handleCancelClearAll = () => {
    setShowClearAllModal(false);
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification._id);
    }

    // Close dropdown
    setShowDropdown(false);

    // Navigate to appropriate page based on notification type and actionUrl
    if (notification.actionUrl) {
      window.open(notification.actionUrl, '_blank');
    } else {
      // Default navigation based on notification type
      switch (notification.type) {
        case 'experience_flagged':
        case 'experience_unflagged':
        case 'experience_approved':
        case 'experience_unpublished':
          if (notification.relatedExperience) {
            window.open(`/experiences/${notification.relatedExperience._id || notification.relatedExperience}`, '_blank');
          } else {
            window.open('/profile', '_blank');
          }
          break;
        default:
          window.open('/notifications', '_blank');
      }
    }
  };

  const formatNotificationText = (notification) => {
    switch (notification.type) {
      case 'experience_flagged':
        return `Your interview experience for ${notification.relatedExperience?.companyInfo?.companyName || 'a company'} has been flagged for review.`;
      case 'experience_unflagged':
        return `Your interview experience for ${notification.relatedExperience?.companyInfo?.companyName || 'a company'} has been reviewed and is no longer flagged.`;
      case 'experience_approved':
        return `Your interview experience for ${notification.relatedExperience?.companyInfo?.companyName || 'a company'} has been approved.`;
      case 'experience_unpublished':
        return `Your interview experience for ${notification.relatedExperience?.companyInfo?.companyName || 'a company'} has been unpublished.`;
      case 'admin_message': {
        // Show the title and a truncated message
        const maxLen = 120;
        let msg = notification.message || '';
        if (msg.length > maxLen) {
          msg = msg.substring(0, maxLen) + '...';
        }
        return (
          <>
            <span style={{ fontWeight: 600, display: 'block', marginBottom: 2 }}>{notification.title}</span>
            {/* <span>{msg}</span> */}
          </>
        );
      }
      default:
        // Truncate long messages for other types
        const maxLen = 120;
        let msg = notification.message || '';
        if (msg.length > maxLen) {
          msg = msg.substring(0, maxLen) + '...';
        }
        return msg;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'experience_flagged':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'experience_unflagged':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'experience_approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'experience_unpublished':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'admin_message':
      case 'admin_announcement':
        return <Bell className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getPriorityIndicator = (priority) => {
    switch (priority) {
      case 'urgent':
        return {
          color: 'text-red-600 dark:text-red-400',
          bg: 'bg-red-100 dark:bg-red-900/20',
          border: 'border-red-300 dark:border-red-700',
          icon: '🔴',
          label: 'Urgent'
        };
      case 'high':
        return {
          color: 'text-orange-600 dark:text-orange-400',
          bg: 'bg-orange-100 dark:bg-orange-900/20',
          border: 'border-orange-300 dark:border-orange-700',
          icon: '🟠',
          label: 'High'
        };
      case 'medium':
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          border: 'border-blue-300 dark:border-blue-700',
          icon: '🔵',
          label: 'Normal'
        };
      case 'low':
        return {
          color: 'text-gray-600 dark:text-gray-400',
          bg: 'bg-gray-100 dark:bg-gray-700',
          border: 'border-gray-300 dark:border-gray-600',
          icon: '⚪',
          label: 'Low'
        };
      default:
        return {
          color: 'text-blue-600 dark:text-blue-400',
          bg: 'bg-blue-100 dark:bg-blue-900/20',
          border: 'border-blue-300 dark:border-blue-700',
          icon: '🔵',
          label: 'Normal'
        };
    }
  };

  const getTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return notificationDate.toLocaleDateString();
  };

  if (!user) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="relative group p-3 rounded-xl hover:bg-secondary/80 transition-all duration-200 hover:scale-105"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <Bell className="w-5 h-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-6 h-6 animate-ping opacity-20"></span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-card border border-border rounded-2xl shadow-2xl z-50 backdrop-blur-sm transform -translate-x-3/4 sm:translate-x-0">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border bg-gradient-to-r from-blue-50/50 to-purple-50/30 dark:from-blue-950/30 dark:to-purple-950/20 rounded-t-2xl">
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <Bell className="w-4 h-4 text-white" />
              </div> */}
              <div>
                <h3 className="font-bold text-base sm:text-lg text-foreground">Notifications</h3>
                {unreadCount > 0 && (
                  <p className="text-xs text-muted-foreground">{unreadCount} unread message{unreadCount > 1 ? 's' : ''}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              {unreadCount > 0 && (
                <button 
                  className="p-1.5 sm:p-2 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-xl transition-colors group"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600 group-hover:scale-110 transition-transform" />
                </button>
              )}
              {/* {notifications.length > 0 && (
                <button 
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-colors group"
                  onClick={clearAllNotifications}
                  title="Clear all notifications"
                >
                  <Trash2 className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                </button>
              )} */}
              <button 
                className="p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
                onClick={() => setShowDropdown(false)}
                title="Close"
              >
                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="max-h-80 sm:max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
            {loading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-muted-foreground text-sm">Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="font-semibold text-foreground mb-2">No notifications yet</h4>
                <p className="text-sm text-muted-foreground">We'll notify you when something interesting happens!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {notifications.map((notification, index) => {
                  const priority = getPriorityIndicator(notification.priority || 'medium');
                  return (
                  <div
                    key={notification._id}
                    className={`group relative p-3 sm:p-4 hover:bg-secondary/30 cursor-pointer transition-all duration-200 ${
                      !notification.read 
                        ? `bg-gradient-to-r from-blue-50/80 to-purple-50/40 dark:from-blue-950/40 dark:to-purple-950/20 border-l-4 ${
                            notification.priority === 'urgent' ? 'border-red-500' :
                            notification.priority === 'high' ? 'border-orange-500' :
                            notification.priority === 'medium' ? 'border-blue-500' :
                            'border-gray-400'
                          }` 
                        : 'hover:bg-gray-50/50 dark:hover:bg-gray-800/30'
                    } ${index === 0 ? 'rounded-t-none' : ''} ${index === notifications.length - 1 ? 'rounded-b-2xl' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-2 sm:space-x-4">
                      {/* Priority & Icon */}
                      <div className="flex-shrink-0 mt-1 relative">
                        <div className={`p-1.5 sm:p-2 rounded-xl ${
                          notification.type === 'experience_flagged' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          notification.type === 'experience_approved' ? 'bg-green-100 dark:bg-green-900/30' :
                          notification.type === 'experience_unflagged' ? 'bg-green-100 dark:bg-green-900/30' :
                          notification.type === 'experience_unpublished' ? 'bg-red-100 dark:bg-red-900/30' :
                          'bg-blue-100 dark:bg-blue-900/30'
                        }`}>
                          {getNotificationIcon(notification.type)}
                        </div>
                        {/* Priority indicator */}
                        {(notification.priority === 'urgent' || notification.priority === 'high') && (
                          <div className={`absolute -top-1 -right-1 w-4 h-4 ${priority.bg} ${priority.border} border rounded-full flex items-center justify-center text-xs`}>
                            <span className="text-[8px]">{priority.icon}</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <div className="text-xs sm:text-sm text-foreground leading-relaxed flex-1">
                            {formatNotificationText(notification)}
                          </div>
                          {/* Priority badge */}
                          {(notification.priority === 'urgent' || notification.priority === 'high') && (
                            <span className={`ml-2 px-2 py-0.5 text-[10px] font-medium rounded-full ${priority.bg} ${priority.color} border ${priority.border}`}>
                              {priority.label}
                            </span>
                          )}
                        </div>
                        
                        {notification.reason && (
                          <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
                            <div className="text-xs text-orange-800 dark:text-orange-300">
                              <strong>Reason:</strong> {notification.reason}
                            </div>
                          </div>
                        )}
                        
                        {notification.details && (
                          <div className="mt-2 text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800/50 p-2 rounded-lg">
                            {notification.details}
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between mt-2 sm:mt-3">
                          <div className="flex items-center space-x-1 sm:space-x-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{getTimeAgo(notification.createdAt)}</span>
                            {notification.priority && notification.priority !== 'medium' && (
                              <>
                                <span>•</span>
                                <span className={priority.color}>{priority.label}</span>
                              </>
                            )}
                          </div>
                          
                          {notification.actionUrl && (
                            <div className="flex items-center text-xs text-blue-600 dark:text-blue-400">
                              <ExternalLink className="w-3 h-3 mr-1" />
                              <span className="hidden sm:inline">View Details</span>
                              <span className="sm:hidden">View</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Status & Actions */}
                      <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                        {!notification.read && (
                          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse shadow-lg"></div>
                        )}
                        
                        <button
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                          onClick={(e) => clearNotification(notification._id, e)}
                          title="Remove notification"
                        >
                          <Trash2 className="w-3 h-3 text-red-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 sm:p-4 border-t border-border bg-gray-50/50 dark:bg-gray-800/30 rounded-b-2xl">
              <button 
                className="w-full flex items-center justify-center space-x-2 text-xs sm:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium py-2 px-3 sm:px-4 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20"
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/notifications');
                }}
              >
                <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">View All Notifications</span>
                <span className="sm:hidden">View All</span>
              </button>
            </div>
          )}
        </div>
      )}
      {/* Clear All Confirmation Modal */}
      {showClearAllModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-2xl shadow-2xl max-w-md w-full p-6 sm:p-8 text-center transform animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Trash2 className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" />
            </div>
            
            <h3 className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400 mb-2 sm:mb-3">
              Clear All Notifications?
            </h3>
            
            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
              Are you sure you want to permanently delete all notifications? This action cannot be undone and you'll lose all notification history.
            </p>
            
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 justify-center">
              <button
                onClick={handleCancelClearAll}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 border border-border rounded-xl bg-secondary hover:bg-secondary/80 transition-colors font-medium text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClearAll}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors font-medium shadow-lg hover:shadow-red-200 dark:hover:shadow-red-900/50 text-sm sm:text-base"
              >
                Yes, Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
