import axios from 'axios';
import { createApiUrl } from './api';

// Configure axios defaults
axios.defaults.withCredentials = true;

// API service class
class ApiService {
  // Auth endpoints
  static auth = {
    checkUser: () => axios.get(createApiUrl('/auth/user')),
    logout: () => axios.post(createApiUrl('/auth/logout')),
  };

  // User endpoints
  static users = {
    getProfile: () => axios.get(createApiUrl('/api/users/profile')),
    updateProfile: (data) => axios.put(createApiUrl('/api/users/profile'), data),
    getMyExperiences: (params = {}) => axios.get(createApiUrl('/api/users/my-experiences'), { params }),
    getBookmarks: () => axios.get(createApiUrl('/api/users/bookmarks')),
    getLeaderboard: (params = {}) => axios.get(createApiUrl('/api/users/leaderboard'), { params }),
    getPublicProfile: (userId) => axios.get(createApiUrl(`/api/users/${userId}/public-profile`)),
    deleteAccount: () => axios.delete(createApiUrl('/api/users/account')),
  };

  // Experience endpoints
  static experiences = {
    getAll: (params = {}) => axios.get(createApiUrl('/api/experiences'), { params }),
    getById: (id) => axios.get(createApiUrl(`/api/experiences/${id}`)),
    create: (data) => axios.post(createApiUrl('/api/experiences'), data),
    update: (id, data) => axios.put(createApiUrl(`/api/experiences/${id}`), data),
    delete: (id) => axios.delete(createApiUrl(`/api/experiences/${id}`)),
    upvote: (id) => axios.post(createApiUrl(`/api/experiences/${id}/upvote`)),
    bookmark: (id) => axios.post(createApiUrl(`/api/experiences/${id}/bookmark`)),
    getComments: (id) => axios.get(createApiUrl(`/api/experiences/${id}/comments`)),
    addComment: (id, content) => axios.post(createApiUrl(`/api/experiences/${id}/comments`), { content }),
    updateComment: (experienceId, commentId, content) => 
      axios.put(createApiUrl(`/api/experiences/${experienceId}/comments/${commentId}`), { content }),
    deleteComment: (experienceId, commentId) => 
      axios.delete(createApiUrl(`/api/experiences/${experienceId}/comments/${commentId}`)),
    search: (query, params = {}) => axios.get(createApiUrl('/api/experiences/search'), { 
      params: { q: query, ...params } 
    }),
  };

  // Analytics endpoints
  static analytics = {
    getPlatformStats: () => axios.get(createApiUrl('/api/analytics/platform-stats')),
    getUserStats: () => axios.get(createApiUrl('/api/analytics/user-stats')),
    getTopCompanies: (params = {}) => axios.get(createApiUrl('/api/analytics/top-companies'), { params }),
    getPopularRoles: (params = {}) => axios.get(createApiUrl('/api/analytics/popular-roles'), { params }),
    getTrending: () => axios.get(createApiUrl('/api/analytics/trending')),
    getCompanyStats: (company) => axios.get(createApiUrl(`/api/analytics/companies/${company}`)),
    getRoleStats: (role) => axios.get(createApiUrl(`/api/analytics/roles/${role}`)),
    getSkillsAnalysis: () => axios.get(createApiUrl('/api/analytics/skills-analysis')),
  };

  // Upload endpoints
  static upload = {
    uploadFile: (file, type = 'image') => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);
      return axios.post(createApiUrl('/api/upload'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
    uploadAvatar: (file) => {
      const formData = new FormData();
      formData.append('avatar', file);
      return axios.post(createApiUrl('/api/upload/avatar'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
    },
  };

  // Admin endpoints (if user has admin privileges)
  static admin = {
    getAllUsers: (params = {}) => axios.get(createApiUrl('/api/users/admin/all'), { params }),
    updateUserRole: (userId, role) => axios.put(createApiUrl(`/api/users/admin/${userId}/role`), { role }),
    getAllExperiences: (params = {}) => axios.get(createApiUrl('/api/experiences/admin/all'), { params }),
    moderateExperience: (id, action) => axios.post(createApiUrl(`/api/experiences/admin/${id}/moderate`), { action }),
    getAnalytics: (params = {}) => axios.get(createApiUrl('/api/analytics/admin'), { params }),
  };
}

// Helper functions for common API patterns
export const withErrorHandling = async (apiCall) => {
  try {
    const response = await apiCall();
    return { data: response.data, error: null };
  } catch (error) {
    // // console.error('API Error:', error);
    return { 
      data: null, 
      error: error.response?.data?.message || error.message || 'Something went wrong' 
    };
  }
};

export const withLoading = (setLoading) => async (apiCall) => {
  setLoading(true);
  try {
    const result = await apiCall();
    return result;
  } finally {
    setLoading(false);
  }
};

// Pagination helper
export const createPaginationParams = (page, limit = 10, additionalParams = {}) => ({
  page,
  limit,
  ...additionalParams
});

// Search helper
export const createSearchParams = (searchTerm, filters = {}) => {
  const params = new URLSearchParams();
  
  if (searchTerm) {
    params.append('search', searchTerm);
  }
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== '') {
      params.append(key, value);
    }
  });
  
  return params.toString();
};

export default ApiService;
