import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth headers
api.interceptors.request.use(
  (config) => {
    // You can add additional headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  getCurrentUser: () => api.get('/auth/user'),
  logout: () => api.post('/auth/logout'),
  checkStatus: () => api.get('/auth/status'),
};

// Experience API
export const experienceAPI = {
  getAll: (params) => api.get('/api/experiences', { params }),
  getById: (id) => api.get(`/api/experiences/${id}`),
  create: (data) => api.post('/api/experiences', data),
  update: (id, data) => api.put(`/api/experiences/${id}`, data),
  delete: (id) => api.delete(`/api/experiences/${id}`),
  vote: (id, voteType) => api.post(`/api/experiences/${id}/vote`, { voteType }),
  bookmark: (id) => api.post(`/api/experiences/${id}/bookmark`),
  checkBookmark: (id) => api.get(`/api/experiences/${id}/bookmark`),
};

// Upload API
export const uploadAPI = {
  uploadSingle: (formData) => api.post('/api/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadMultiple: (formData) => api.post('/api/upload/multiple', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  extractText: (data) => api.post('/api/upload/extract-text', data),
  deleteFile: (cloudinaryId) => api.delete(`/api/upload/${cloudinaryId}`),
};

// Analytics API
export const analyticsAPI = {
  getTrending: () => api.get('/api/analytics/trending'),
  getCompanyAnalytics: (companyName) => api.get(`/api/analytics/company/${companyName}`),
  getUserStats: () => api.get('/api/analytics/user-stats'),
  getDashboard: () => api.get('/api/analytics/dashboard'),
};

// User API
export const userAPI = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data) => api.put('/api/users/profile', data),
  getBookmarks: () => api.get('/api/users/bookmarks'),
  getMyExperiences: (params) => api.get('/api/users/my-experiences', { params }),
  getLeaderboard: (params) => api.get('/api/users/leaderboard', { params }),
  getPublicProfile: (id) => api.get(`/api/users/${id}/public-profile`),
  deleteAccount: () => api.delete('/api/users/account'),
  
  // Admin APIs
  getAllUsers: (params) => api.get('/api/users/admin/all', { params }),
  updateUserRole: (id, role) => api.put(`/api/users/admin/${id}/role`, { role }),
};

export default api;
