import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, X, Info, Eye, AlertTriangle, CheckCircle, XCircle, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FirstTimeNotificationPopup = ({ open, onClose, notificationCount, notifications = [] }) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(open);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open) {
      setVisible(true);
      setIsAnimating(true);
    } else {
      setIsAnimating(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  if (!visible) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setVisible(false);
      onClose();
    }, 300);
  };

  const handleViewNotifications = () => {
    handleClose();
    navigate('/notifications');
  };

  // Helper function to get notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'experience_flagged':
        return { icon: AlertTriangle, color: 'text-yellow-600 dark:text-yellow-400' };
      case 'experience_unflagged':
      case 'experience_approved':
        return { icon: CheckCircle, color: 'text-green-600 dark:text-green-400' };
      case 'experience_unpublished':
        return { icon: XCircle, color: 'text-red-600 dark:text-red-400' };
      case 'admin_message':
        return { icon: Star, color: 'text-purple-600 dark:text-purple-400' };
      default:
        return { icon: Bell, color: 'text-blue-600 dark:text-blue-400' };
    }
  };

  // Helper function to format notification text
  const formatNotificationText = (notification) => {
    switch (notification.type) {
      case 'experience_flagged':
        return `Experience for ${notification.relatedExperience?.companyInfo?.companyName || 'a company'} was flagged`;
      case 'experience_unflagged':
        return `Experience for ${notification.relatedExperience?.companyInfo?.companyName || 'a company'} is no longer flagged`;
      case 'experience_approved':
        return `Experience for ${notification.relatedExperience?.companyInfo?.companyName || 'a company'} was approved`;
      case 'experience_unpublished':
        return `Experience for ${notification.relatedExperience?.companyInfo?.companyName || 'a company'} was unpublished`;
      case 'admin_message':
        return notification.title || notification.message;
      default:
        return notification.message || 'New notification';
    }
  };

  // Helper function to get time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));

    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  const notification = (
    <div 
      className={`
        fixed top-4 right-4 z-[9999] min-w-80 max-w-sm
        bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg
        border border-blue-200 dark:border-blue-700/50
        rounded-2xl shadow-2xl
        transform transition-all duration-300 ease-out
        ${isAnimating 
          ? 'translate-x-0 opacity-100 scale-100' 
          : 'translate-x-full opacity-0 scale-95'
        }
      `}
      role="alert"
      aria-live="polite"
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                <Bell className="h-5 w-5 text-white" />
              </div>
              {notificationCount > 0 && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-gray-800">
                  {notificationCount > 99 ? '99+' : notificationCount}
                </div>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                New notifications!
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {notificationCount === 1 ? '1 new notification' : `${notificationCount} new notifications`}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className="w-6 h-6 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 transition-all duration-200 flex items-center justify-center"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        {notifications.length > 0 ? (
          <div className="space-y-2">
            {notifications.slice(0, 2).map((notif) => {
              const iconData = getNotificationIcon(notif.type);
              const IconComponent = iconData.icon;
              
              return (
                <div key={notif._id} className="flex items-start gap-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <IconComponent className={`h-3 w-3 mt-0.5 flex-shrink-0 ${iconData.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-800 dark:text-gray-200 font-medium truncate">
                      {formatNotificationText(notif)}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-2 w-2 text-gray-500 dark:text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getTimeAgo(notif.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {notifications.length > 2 && (
              <div className="text-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{notifications.length - 2} more notification{notifications.length - 2 !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-xs text-blue-800 dark:text-blue-200">
              <p className="font-medium">Stay updated!</p>
              <p className="text-blue-700 dark:text-blue-300 mt-1">
                Get notified about experience approvals, community interactions, and important announcements.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 pt-0">
        <div className="flex gap-2">
          <button
            onClick={handleClose}
            className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-all duration-200"
          >
            Maybe Later
          </button>
          <button
            onClick={handleViewNotifications}
            className="flex-1 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs font-semibold transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-1"
          >
            <Eye className="h-3 w-3" />
            View
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(notification, document.body);
};

export default FirstTimeNotificationPopup;