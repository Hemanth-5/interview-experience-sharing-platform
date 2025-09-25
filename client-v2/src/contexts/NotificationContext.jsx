import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { createApiUrl } from '../config/api';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showFirstTimePopup, setShowFirstTimePopup] = useState(false);
  const [hasSeenFirstNotification, setHasSeenFirstNotification] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Load first notification preference from localStorage
  useEffect(() => {
    if (user) {
      const seenKey = `hasSeenFirstNotification_${user._id}`;
      const hasSeen = localStorage.getItem(seenKey) === 'true';
      
      // Also check session storage to prevent popup in same session
      const sessionKey = `popupShownThisSession_${user._id}`;
      const shownThisSession = sessionStorage.getItem(sessionKey) === 'true';
      
      setHasSeenFirstNotification(hasSeen || shownThisSession);
      setIsInitialLoad(true); // Reset initial load for new user
    } else {
      // Reset states when user logs out
      setNotifications([]);
      setUnreadCount(0);
      setShowFirstTimePopup(false);
      setHasSeenFirstNotification(false);
      setIsInitialLoad(true);
    }
  }, [user]);

  // Fetch notifications
  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const response = await fetch(createApiUrl('/api/users/notifications?limit=10&unreadOnly=false'), {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        const newNotifications = data.data.notifications;
        const newUnreadCount = data.data.unreadCount;
        
        // Sort notifications by priority and then by creation date
        const sortedNotifications = newNotifications.sort((a, b) => {
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
        
        // Only show popup on initial load if user hasn't seen it before AND has unread notifications
        // Also ensure we don't show it too frequently by checking if enough time has passed
        if (isInitialLoad && 
            newUnreadCount > 0 && 
            !hasSeenFirstNotification) {
          setShowFirstTimePopup(true);
          setIsInitialLoad(false); // Mark that we've done the initial load
        } else if (isInitialLoad) {
          setIsInitialLoad(false); // Mark initial load complete even if no notifications
        }
        
        setNotifications(sortedNotifications);
        setUnreadCount(newUnreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // Mark first notification popup as seen
  const dismissFirstTimePopup = () => {
    setShowFirstTimePopup(false);
    setHasSeenFirstNotification(true);
    
    if (user) {
      const seenKey = `hasSeenFirstNotification_${user._id}`;
      const sessionKey = `popupShownThisSession_${user._id}`;
      localStorage.setItem(seenKey, 'true');
      sessionStorage.setItem(sessionKey, 'true');
    }
  };

  // Mark notification as read
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
        
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  // Mark all notifications as read
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
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Poll for notifications with reasonable interval
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Poll every 30 seconds instead of 5 seconds for better performance
      const interval = setInterval(() => {
        fetchNotifications();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user, hasSeenFirstNotification]);

  // Additional effect to check for new notifications when window gains focus
  useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchNotifications();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchNotifications();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user]);

  const value = {
    notifications,
    unreadCount,
    showFirstTimePopup,
    latestUnreadNotifications: notifications.filter(notif => !notif.read).slice(0, 3), // Get latest 3 unread notifications
    urgentNotifications: notifications.filter(notif => !notif.read && (notif.priority === 'urgent' || notif.priority === 'high')),
    priorityStats: {
      urgent: notifications.filter(notif => !notif.read && notif.priority === 'urgent').length,
      high: notifications.filter(notif => !notif.read && notif.priority === 'high').length,
      medium: notifications.filter(notif => !notif.read && notif.priority === 'medium').length,
      low: notifications.filter(notif => !notif.read && notif.priority === 'low').length,
    },
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissFirstTimePopup,
    getPriorityColor: (priority) => {
      switch (priority) {
        case 'urgent': return 'red';
        case 'high': return 'orange';
        case 'medium': return 'blue';
        case 'low': return 'gray';
        default: return 'blue';
      }
    },
    getPriorityIcon: (priority) => {
      switch (priority) {
        case 'urgent': return '🔴';
        case 'high': return '🟠';
        case 'medium': return '🔵';
        case 'low': return '⚪';
        default: return '🔵';
      }
    }
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};