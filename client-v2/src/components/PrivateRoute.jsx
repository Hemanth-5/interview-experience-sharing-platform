import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Loader, Shield } from 'lucide-react';

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
      <div className="min-h-screen dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
              <Loader className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Loading</h3>
            <p className="text-gray-600 dark:text-gray-400">Please wait while we load your session...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    // Show loading while redirecting to Google OAuth
    return (
      <div className="min-h-screen dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
        <div className="rounded-2xl shadow-xl p-8 max-w-md w-full border border-gray-100 dark:border-gray-700">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Authenticating</h3>
            <p className="text-gray-600 dark:text-gray-400">Redirecting to Google Sign-In...</p>
            <div className="mt-4">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;
