import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createApiUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  X,
  Filter,
  Loader,
  MessageSquare,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertCircle,
  Star,
  Flag,
  Sparkles,
  Eye
} from 'lucide-react';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 5, total: 0, totalPages: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

  // Calculate unread count
  const unreadCount = notifications.filter(notif => !notif.read).length;

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, currentPage, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const unreadOnly = filter === 'unread' ? 'true' : 'false';
      const response = await fetch(
        createApiUrl(`/api/users/notifications?page=${currentPage}&limit=5&unreadOnly=${unreadOnly}`),
        {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      const data = await response.json();
      if (data.success) {
        let filteredNotifications = data.data.notifications;
        if (filter === 'read') {
          filteredNotifications = data.data.notifications.filter(notif => notif.read);
        }
        setNotifications(filteredNotifications);
        setPagination({
          page: data.data.pagination?.currentPage || 1,
          limit: data.data.pagination?.limit || 10,
          total: data.data.pagination?.totalDocuments || filteredNotifications.length,
          totalPages: data.data.pagination?.totalPages || 1
        });
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
        setNotifications(prev => 
          prev.map(notif => 
            notif._id === notificationId 
              ? { ...notif, read: true, readAt: new Date() }
              : notif
          )
        );
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
        setNotifications(prev => 
          prev.map(notif => ({ 
            ...notif, 
            read: true, 
            readAt: new Date() 
          }))
        );
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const clearNotification = async (notificationId, event) => {
    // Prevent triggering the notification click handler
    if (event) {
      event.stopPropagation();
    }
    
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
        
        // Refresh data to update pagination
        setTimeout(() => {
          fetchNotifications();
        }, 100);
      }
    } catch (error) {
      console.error('Error clearing notification:', error);
    }
  };

  // Modal state for clear all confirmation
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  const clearAllNotifications = () => {
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
        // Clear local state
        setNotifications([]);
        setPagination({});
        setCurrentPage(1);
      }
    } catch (error) {
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

    // Navigate to appropriate page based on notification type and actionUrl
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    } else {
      // Default navigation based on notification type
      switch (notification.type) {
        case 'experience_flagged':
        case 'experience_unflagged':
        case 'experience_approved':
        case 'experience_unpublished':
          if (notification.relatedExperience) {
            navigate(`/experiences/${notification.relatedExperience._id || notification.relatedExperience}`);
          } else {
            navigate('/profile');
          }
          break;
        default:
          // Stay on notifications page for unknown types
          break;
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
        return (
          <div className="space-y-2">
            <div className="font-semibold text-purple-700 dark:text-purple-300 text-base">
              {notification.title}
            </div>
            <div className="text-muted-foreground whitespace-pre-line">
              {notification.message}
            </div>
          </div>
        );
      }
      default:
        return notification.message;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'experience_flagged':
        return { 
          icon: AlertTriangle, 
          color: 'text-yellow-600 dark:text-yellow-400', 
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/30' 
        };
      case 'experience_unflagged':
        return { 
          icon: CheckCircle, 
          color: 'text-green-600 dark:text-green-400', 
          bgColor: 'bg-green-100 dark:bg-green-900/30' 
        };
      case 'experience_approved':
        return { 
          icon: CheckCircle, 
          color: 'text-green-600 dark:text-green-400', 
          bgColor: 'bg-green-100 dark:bg-green-900/30' 
        };
      case 'experience_unpublished':
        return { 
          icon: XCircle, 
          color: 'text-red-600 dark:text-red-400', 
          bgColor: 'bg-red-100 dark:bg-red-900/30' 
        };
      case 'admin_message':
        return { 
          icon: Star, 
          color: 'text-purple-600 dark:text-purple-400', 
          bgColor: 'bg-purple-100 dark:bg-purple-900/30' 
        };
      default:
        return { 
          icon: Bell, 
          color: 'text-blue-600 dark:text-blue-400', 
          bgColor: 'bg-blue-100 dark:bg-blue-900/30' 
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

  if (!user) {
    return (
      <div className="notifications-page">
        <div className="notifications-container">
          <h1>Please log in to view notifications</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="relative">
            <div className="relative backdrop-blur-lg rounded-3xl border border-white/20 dark:border-gray-700/30 shadow-xl p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Bell className="h-8 w-8 text-white" />
                    </div>
                    {unreadCount > 0 && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-4 ring-white dark:ring-gray-800">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </div>
                    )}
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      Notifications
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      Stay updated with your latest activities
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0 || loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Mark All Read
                  </button>
                  
                  <button
                    onClick={clearAllNotifications}
                    disabled={notifications.length === 0 || loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear All
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="mt-8 flex flex-wrap gap-2">
                <button
                  onClick={() => { setFilter('all'); setCurrentPage(1); }}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    filter === 'all'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:shadow-md'
                  }`}
                >
                  All Notifications
                </button>
                <button
                  onClick={() => { setFilter('unread'); setCurrentPage(1); }}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    filter === 'unread'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:shadow-md'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
                <button
                  onClick={() => { setFilter('read'); setCurrentPage(1); }}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                    filter === 'read'
                      ? 'bg-blue-500 text-white shadow-lg'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 hover:shadow-md'
                  }`}
                >
                  Read
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="notifications-content">
          {/* Clear All Confirmation Modal */}
          {showClearAllModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
              <div className="relative bg-white dark:bg-gray-800 backdrop-blur-lg rounded-3xl shadow-2xl max-w-md w-full border border-white/20 dark:border-gray-700/30 overflow-hidden">
                
                <div className="relative p-8 text-center">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>

                  {/* Content */}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                    Clear All Notifications?
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    Are you sure you want to clear all notifications? This action cannot be undone and will permanently remove all your notification history.
                  </p>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleCancelClearAll}
                      className="flex-1 px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-all duration-200 hover:shadow-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmClearAll}
                      className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
                    >
                      Yes, Clear All
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-200 dark:border-blue-800 rounded-full animate-spin border-t-blue-600 dark:border-t-blue-400"></div>
                {/* <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400 dark:border-t-blue-300"></div> */}
              </div>
              <div className="mt-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Loading notifications...
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Please wait while we fetch your latest updates
                </p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 rounded-full flex items-center justify-center">
                  <BellOff className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="text-center max-w-md">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {filter === 'unread' 
                    ? "All caught up!" 
                    : filter === 'read'
                    ? "No read notifications"
                    : "No notifications yet"
                  }
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {filter === 'unread' 
                    ? "You're all caught up! No unread notifications to review."
                    : filter === 'read'
                    ? "No read notifications found. Check back later for updates."
                    : "We'll notify you here when there's something important to share."
                  }
                </p>
                {filter !== 'all' && (
                  <button
                    onClick={() => { setFilter('all'); setCurrentPage(1); }}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg font-medium transition-all duration-200"
                  >
                    <Eye className="h-4 w-4" />
                    View all notifications
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {notifications.map((notification) => {
                  const iconData = getNotificationIcon(notification.type);
                  return (
                    <div
                      key={notification._id}
                      className={`group relative backdrop-blur-lg rounded-2xl border transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-[1.02] ${
                        !notification.read 
                          ? 'border-blue-200 dark:border-blue-700/50 shadow-lg shadow-blue-500/10' 
                          : 'border-gray-200/50 dark:border-gray-700/30 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full ring-4 ring-white dark:ring-gray-800"></div>
                      )}

                      <div className="p-6">
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${iconData.bgColor} ${iconData.color} shadow-lg`}>
                            <iconData.icon className="h-6 w-6" />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="text-gray-900 dark:text-gray-100 leading-relaxed">
                              {formatNotificationText(notification)}
                            </div>
                            
                            {notification.flagReason && (
                              <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg border-l-4 border-yellow-400">
                                <div className="flex items-start gap-2">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <div className="font-medium text-yellow-800 dark:text-yellow-200">
                                      Reason:
                                    </div>
                                    <div className="text-yellow-700 dark:text-yellow-300 text-sm mt-1">
                                      {notification.flagReason}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {notification.flagReasonDetails && (
                              <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                                <div className="text-gray-600 dark:text-gray-400 text-sm whitespace-pre-line">
                                  {notification.flagReasonDetails}
                                </div>
                              </div>
                            )}

                            {/* Meta info */}
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm">
                                  <Clock className="h-4 w-4" />
                                  {getTimeAgo(notification.createdAt)}
                                </div>
                                {!notification.read && (
                                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                                    New
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Clear button */}
                          <button
                            onClick={(e) => clearNotification(notification._id, e)}
                            className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-100 hover:bg-red-100 dark:bg-gray-700 dark:hover:bg-red-900/30 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                            title="Clear notification"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      currentPage === 1
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                          page === currentPage
                            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={currentPage === pagination.totalPages}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                      currentPage === pagination.totalPages
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md hover:shadow-lg border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
