import { createApiUrl } from '../../config/api';

/**
 * Check if admin session is still valid on the server
 * @returns {Promise<boolean>} - True if admin is authenticated, false otherwise
 */
export const checkAdminAuth = async () => {
  try {
    const response = await fetch(createApiUrl('/api/admin/auth-check'), {
      credentials: 'include'
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

/**
 * Handle admin authentication errors by clearing session and redirecting
 */
export const handleAdminAuthError = () => {
  sessionStorage.removeItem('adminAuthenticated');
  // Force reload to trigger AdminRoute to show AdminLogin
  window.location.reload();
};

/**
 * Make authenticated admin API request with automatic error handling
 * @param {string} url - API endpoint URL
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} - Fetch response
 */
export const fetchWithAdminAuth = async (url, options = {}) => {
  const response = await fetch(createApiUrl(url), {
    credentials: 'include',
    ...options
  });
  
  if (response.status === 403) {
    handleAdminAuthError();
    throw new Error('Admin authentication required');
  }
  
  return response;
};
