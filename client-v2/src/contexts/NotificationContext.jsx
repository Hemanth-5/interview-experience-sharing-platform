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

  // Load first notification preference from localStorage
  useEffect(() => {
    if (user) {
      const seenKey = `hasSeenFirstNotification_${user._id}`;
      const hasSeen = localStorage.getItem(seenKey) === 'true';
      setHasSeenFirstNotification(hasSeen);
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
        const previousUnreadCount = unreadCount;
        
        // Check if there are NEW unread notifications (count increased)
        // and user hasn't seen the first notification popup yet
        if (newUnreadCount > 0 && 
            newUnreadCount > previousUnreadCount && 
            !hasSeenFirstNotification && 
            newNotifications.length > 0) {
          setShowFirstTimePopup(true);
        }
        
        // Also show popup if user has unread notifications but popup hasn't been shown yet
        if (newUnreadCount > 0 && !hasSeenFirstNotification && notifications.length === 0) {
          setShowFirstTimePopup(true);
        }
        
        setNotifications(newNotifications);
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
      localStorage.setItem(seenKey, 'true');
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

  // Poll for notifications more frequently
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // More frequent polling - every 5 seconds for better responsiveness
      const interval = setInterval(() => {
        fetchNotifications();
      }, 5000);
      
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
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    dismissFirstTimePopup
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};