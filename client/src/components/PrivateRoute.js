import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
  const { user, loading, requireAuth } = useAuth();

  useEffect(() => {
    // If not loading and no user, require authentication
    if (!loading && !user) {
      requireAuth();
    }
  }, [loading, user, requireAuth]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    // Show loading while redirecting to Google OAuth
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Redirecting to Google Sign-In...</p>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
