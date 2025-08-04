import { createContext, useContext, useState, useEffect } from 'react';
import ApiService, { withErrorHandling } from '../config/apiService';
import { createApiUrl } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    const { data, error } = await withErrorHandling(() => ApiService.auth.checkUser());
    
    if (data && data.success) {
      setUser(data.user);
    } else if (error) {
      // console.log('User not authenticated');
    }
    
    setLoading(false);
  };

  // Function to require authentication - redirects to Google OAuth if not logged in
  const requireAuth = () => {
    if (!user && !loading) {
      // console.log('Authentication required, redirecting to Google OAuth...');
      window.location.href = createApiUrl('/auth/google');
      return false;
    }
    return true;
  };

  const login = () => {
    // Redirect to Google OAuth
    window.location.href = createApiUrl('/auth/google');
  };

  const logout = async () => {
    setLoading(true);
    const { data, error } = await withErrorHandling(() => ApiService.auth.logout());
    
    if (data && data.success) {
      setUser(null);
      setError(null);
      window.location.href = '/';
    } else if (error) {
      setError('Failed to logout. Please try again.');
      // // console.error('Logout error:', error);
    }
    
    setLoading(false);
  };

  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
    clearError,
    checkAuthStatus,
    requireAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
