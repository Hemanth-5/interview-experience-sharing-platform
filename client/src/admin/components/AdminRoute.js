import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import AdminLogin from './AdminLogin';
import { checkAdminAuth } from '../utils/adminAuth';
import '../styles/admin.css';
import '../styles/AdminRoute.css';

const AdminRoute = ({ children }) => {
  const { user, loading, requireAuth } = useAuth();
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    // If not loading and no user, require authentication
    if (!loading && !user) {
      requireAuth();
      return;
    }

    // If user exists but not admin, redirect to home
    if (!loading && user && user.role !== 'Admin') {
      window.location.href = '/';
      return;
    }

    // If user is admin, check for dual authentication
    if (!loading && user && user.role === 'Admin') {
      const adminSession = sessionStorage.getItem('adminAuthenticated');
      if (adminSession === 'true') {
        // Verify session is still valid on server
        checkAdminAuth().then(isValid => {
          if (isValid) {
            setIsAdminAuthenticated(true);
          } else {
            // Server session expired, clear client session
            sessionStorage.removeItem('adminAuthenticated');
            setIsAdminAuthenticated(false);
            setShowAdminLogin(true);
          }
        });
      } else {
        setShowAdminLogin(true);
      }
    }
  }, [loading, user, requireAuth]);

  if (loading) {
    return (
      <div className="admin-route-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Show loading while redirecting to Google OAuth
    return (
      <div className="admin-route-container">
        <div className="redirecting-container">
          <div className="google-signin-icon">🔐</div>
          <h3>Redirecting to Google Sign-In</h3>
          <p>Please wait while we redirect you to authentication...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'Admin') {
    return (
      <div className="admin-route-container">
        <div className="access-denied">
          <div className="access-denied-content">
            <h2>Access Denied</h2>
            <p>You don't have permission to access the admin panel.</p>
            <button onClick={() => window.location.href = '/'} className="btn btn-primary">
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show admin login for dual authentication
  if (showAdminLogin && !isAdminAuthenticated) {
    return (
      <AdminLogin 
        onAuthenticated={() => {
          setIsAdminAuthenticated(true);
          setShowAdminLogin(false);
          sessionStorage.setItem('adminAuthenticated', 'true');
        }}
      />
    );
  }

  // Show admin content if authenticated
  if (isAdminAuthenticated) {
    return children;
  }

  return (
    <div className="admin-route-container">
      <div className="authenticating-container">
        <div className="authenticating-icon">🔐</div>
        <h3>Authenticating Admin Access</h3>
        <p>Please wait while we verify your admin credentials...</p>
      </div>
    </div>
  );
};

export default AdminRoute;
