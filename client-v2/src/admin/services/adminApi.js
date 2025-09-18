import { createApiUrl } from '../../config/api';

const adminApiService = {
  // Admin Authentication
  auth: {
    login: async (credentials) => {
      try {
        const response = await fetch(createApiUrl('/admin/auth/login'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(credentials)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Admin login failed');
        }

        const data = await response.json();
        
        // Store admin token separately
        if (data.adminToken) {
          localStorage.setItem('adminToken', data.adminToken);
          localStorage.setItem('adminUser', JSON.stringify(data.adminUser));
        }

        return data;
      } catch (error) {
        console.error('Admin login error:', error);
        throw error;
      }
    },

    logout: async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        
        if (adminToken) {
          await fetch(createApiUrl('/admin/auth/logout'), {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-admin-token': adminToken
            }
          });
        }

        // Clear admin tokens
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        
        return { success: true };
      } catch (error) {
        console.error('Admin logout error:', error);
        // Still clear tokens even if request fails
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        return { success: true };
      }
    },

    verify: async () => {
      try {
        const adminToken = localStorage.getItem('adminToken');
        
        if (!adminToken) {
          throw new Error('No admin token found');
        }

        const response = await fetch(createApiUrl('/admin/auth/verify'), {
          headers: {
            'Authorization': `Bearer ${adminToken}`
          }
        });

        if (!response.ok) {
          throw new Error('Admin token verification failed');
        }

        return await response.json();
      } catch (error) {
        console.error('Admin verify error:', error);
        // Clear invalid tokens
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        throw error;
      }
    },

    createAdmin: async (adminData) => {
      try {
        const response = await fetch(createApiUrl('/admin/auth/create'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          },
          body: JSON.stringify(adminData)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Failed to create admin');
        }

        return await response.json();
      } catch (error) {
        console.error('Create admin error:', error);
        throw error;
      }
    }
  },

  // Dashboard APIs
  dashboard: {
    getStats: async () => {
      try {
        const response = await fetch(createApiUrl('/admin/dashboard/stats'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }

        return await response.json();
      } catch (error) {
        console.error('Dashboard stats error:', error);
        throw error;
      }
    },

    getHealth: async () => {
      try {
        const response = await fetch(createApiUrl('/admin/dashboard/health'), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch system health');
        }

        return await response.json();
      } catch (error) {
        console.error('System health error:', error);
        throw error;
      }
    },

    getAnalytics: async (period = '30d') => {
      try {
        const response = await fetch(createApiUrl(`/admin/dashboard/analytics?period=${period}`), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }

        return await response.json();
      } catch (error) {
        console.error('Analytics error:', error);
        throw error;
      }
    }
  },

  // User Management
  users: {
    getAll: async (params = {}) => {
      try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(createApiUrl(`/users?${queryString}`), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }

        return await response.json();
      } catch (error) {
        console.error('Fetch users error:', error);
        throw error;
      }
    },

    updateRole: async (userId, role) => {
      try {
        const response = await fetch(createApiUrl(`/users/${userId}/role`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          },
          body: JSON.stringify({ role })
        });

        if (!response.ok) {
          throw new Error('Failed to update user role');
        }

        return await response.json();
      } catch (error) {
        console.error('Update user role error:', error);
        throw error;
      }
    },

    deactivate: async (userId) => {
      try {
        const response = await fetch(createApiUrl(`/users/${userId}/deactivate`), {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to deactivate user');
        }

        return await response.json();
      } catch (error) {
        console.error('Deactivate user error:', error);
        throw error;
      }
    }
  },

  // Experience Management
  experiences: {
    getAll: async (params = {}) => {
      try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(createApiUrl(`/experiences/admin/all?${queryString}`), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch experiences');
        }

        return await response.json();
      } catch (error) {
        console.error('Fetch experiences error:', error);
        throw error;
      }
    },

    moderate: async (experienceId, action) => {
      try {
        const response = await fetch(createApiUrl(`/experiences/admin/${experienceId}/moderate`), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          },
          body: JSON.stringify({ action })
        });

        if (!response.ok) {
          throw new Error('Failed to moderate experience');
        }

        return await response.json();
      } catch (error) {
        console.error('Moderate experience error:', error);
        throw error;
      }
    },

    delete: async (experienceId) => {
      try {
        const response = await fetch(createApiUrl(`/experiences/${experienceId}`), {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete experience');
        }

        return await response.json();
      } catch (error) {
        console.error('Delete experience error:', error);
        throw error;
      }
    }
  },

  // Company Management
  companies: {
    getAll: async (params = {}) => {
      try {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(createApiUrl(`/companies?${queryString}`), {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch companies');
        }

        return await response.json();
      } catch (error) {
        console.error('Fetch companies error:', error);
        throw error;
      }
    },

    update: async (companyId, companyData) => {
      try {
        const response = await fetch(createApiUrl(`/companies/${companyId}`), {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'x-admin-token': localStorage.getItem('adminToken')
          },
          body: JSON.stringify(companyData)
        });

        if (!response.ok) {
          throw new Error('Failed to update company');
        }

        return await response.json();
      } catch (error) {
        console.error('Update company error:', error);
        throw error;
      }
    }
  }
};

// Helper function to check if user is admin authenticated
export const isAdminAuthenticated = () => {
  const adminToken = localStorage.getItem('adminToken');
  const adminUser = localStorage.getItem('adminUser');
  return !!(adminToken && adminUser);
};


// Helper function to get admin user info
export const getAdminUser = () => {
  const adminUser = localStorage.getItem('adminUser');
  return adminUser ? JSON.parse(adminUser) : null;
};

// Admin Companies APIs
export const getAllCompanies = async () => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await fetch(createApiUrl('/admin/companies'), {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch companies');
  }
  return await response.json();
};

export const deleteCompany = async (id) => {
  const adminToken = localStorage.getItem('adminToken');
  const response = await fetch(createApiUrl(`/admin/companies/${id}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  if (!response.ok) {
    throw new Error('Failed to delete company');
  }
};

export default adminApiService;
