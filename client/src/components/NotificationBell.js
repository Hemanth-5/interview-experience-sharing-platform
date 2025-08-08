import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { createApiUrl } from '../config/api';
import './NotificationBell.css';

const NotificationBell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

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
        setNotifications(data.data.notifications);
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

  if (!user) return null;

  return (
    <div className="notification-bell">
      <button
        className="notification-bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
        aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
      >
        <span className="bell-icon">
          <i className="fas fa-bell"></i>
        </span>
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>Notifications</h3>
            <div className="notification-actions">
              {unreadCount > 0 && (
                <button 
                  className="mark-all-read-btn"
                  onClick={markAllAsRead}
                  title="Mark all as read"
                >
                  <i className="fas fa-check"></i>
                </button>
              )}
              {/* {notifications.length > 0 && (
                <button 
                  className="clear-all-btn"
                  onClick={clearAllNotifications}
                  title="Clear all notifications"
                >
                  <i className="fas fa-trash"></i>
                </button>
              )} */}
            </div>
          </div>

          <div className="notification-list">
            {loading ? (
              <div className="notification-loading">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="no-notifications">No notifications yet</div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-text">
                      {formatNotificationText(notification)}
                    </div>
                    {notification.reason && (
                      <div className="notification-reason">
                        <strong>Reason:</strong> {notification.reason}
                      </div>
                    )}
                    {notification.details && (
                      <div className="notification-details">
                        {notification.details}
                      </div>
                    )}
                    <div className="notification-time">
                      {getTimeAgo(notification.createdAt)}
                    </div>
                  </div>
                  <div className="notification-controls">
                    {!notification.read && (
                      <div className="unread-indicator"></div>
                    )}
                    <button
                      className="clear-notification-btn"
                      onClick={(e) => clearNotification(notification._id, e)}
                      title="Clear notification"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button 
                className="view-all-btn"
                onClick={() => {
                  setShowDropdown(false);
                  window.open('/notifications', '_blank');
                }}
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      )}
      {/* Clear All Confirmation Modal */}
      {showClearAllModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.45)',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div className="modal-card" style={{
            background: 'white',
            borderRadius: 12,
            boxShadow: '0 10px 32px rgba(0,0,0,0.18)',
            maxWidth: 380,
            width: '90%',
            padding: '2rem 1.5rem',
            textAlign: 'center',
            position: 'relative',
          }}>
            <h3 style={{ color: '#dc2626', marginBottom: 12 }}>Clear All Notifications?</h3>
            <p style={{ color: '#374151', marginBottom: 24 }}>
              Are you sure you want to clear all notifications? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <button
                onClick={handleCancelClearAll}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: 6,
                  border: '1px solid #d1d5db',
                  background: '#f3f4f6',
                  color: '#374151',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClearAll}
                style={{
                  padding: '0.6rem 1.5rem',
                  borderRadius: 6,
                  border: 'none',
                  background: '#dc2626',
                  color: 'white',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
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
