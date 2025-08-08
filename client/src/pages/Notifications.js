import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createApiUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';
import './Notifications.css';

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'

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
        createApiUrl(`/api/users/notifications?page=${currentPage}&limit=20&unreadOnly=${unreadOnly}`),
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
        
        // Apply read filter on frontend if needed
        if (filter === 'read') {
          filteredNotifications = data.data.notifications.filter(notif => notif.read);
        }
        
        setNotifications(filteredNotifications);
        setPagination(data.data.pagination);
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

  const clearAllNotifications = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications? This action cannot be undone.')) {
      return;
    }
    
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
      default:
        return notification.message;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'experience_flagged':
        return <i className="fas fa-exclamation-triangle" style={{ color: '#f59e0b' }}></i>;
      case 'experience_unflagged':
        return <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>;
      case 'experience_approved':
        return <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>;
      case 'experience_unpublished':
        return <i className="fas fa-times-circle" style={{ color: '#ef4444' }}></i>;
      default:
        return <i className="fas fa-bell" style={{ color: '#6b7280' }}></i>;
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
    <div className="notifications-page">
      <div className="notifications-container">
        <div className="notifications-header">
          <h1>Notifications</h1>
          <div className="notifications-actions">
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => {
                  setFilter('all');
                  setCurrentPage(1);
                }}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === 'unread' ? 'active' : ''}`}
                onClick={() => {
                  setFilter('unread');
                  setCurrentPage(1);
                }}
              >
                Unread
              </button>
              <button
                className={`filter-btn ${filter === 'read' ? 'active' : ''}`}
                onClick={() => {
                  setFilter('read');
                  setCurrentPage(1);
                }}
              >
                Read
              </button>
            </div>
            <button 
              className="mark-all-read-btn"
              onClick={markAllAsRead}
            >
              <i className="fas fa-check"></i> Mark All Read
            </button>
            <button 
              className="clear-all-btn"
              onClick={clearAllNotifications}
            >
              <i className="fas fa-trash"></i> Clear All
            </button>
          </div>
        </div>

        <div className="notifications-content">
          {loading ? (
            <div className="notifications-loading">
              <div className="loading-spinner"></div>
              <p>Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="no-notifications">
              <div className="no-notifications-icon">
                <i className="fas fa-bell-slash" style={{ fontSize: '4rem', color: '#d1d5db' }}></i>
              </div>
              <h3>No notifications {filter !== 'all' ? filter : ''}</h3>
              <p>
                {filter === 'unread' 
                  ? "You're all caught up! No unread notifications."
                  : filter === 'read'
                  ? "No read notifications found."
                  : "You don't have any notifications yet."
                }
              </p>
            </div>
          ) : (
            <>
              <div className="notifications-list">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <div className="notification-text">
                        {formatNotificationText(notification)}
                      </div>
                      {notification.flagReason && (
                        <div className="notification-reason">
                          <strong>Reason:</strong> {notification.flagReason}
                        </div>
                      )}
                      {notification.flagReasonDetails && (
                        <div className="notification-details">
                          {notification.flagReasonDetails}
                        </div>
                      )}
                      <div className="notification-meta">
                        <span className="notification-time">
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <span className="unread-badge">New</span>
                        )}
                      </div>
                    </div>
                    <div className="notification-controls">
                      <button
                        className="clear-notification-btn"
                        onClick={(e) => clearNotification(notification._id, e)}
                        title="Clear notification"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="notifications-pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {pagination.totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Next
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
