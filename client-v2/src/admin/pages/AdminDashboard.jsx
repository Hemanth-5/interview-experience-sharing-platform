import React, { useState, useEffect } from 'react';
import { createApiUrl } from '../../config/api';
import { fetchWithAdminAuth } from '../utils/adminAuth';
import { 
  Users, 
  FileText, 
  Building2, 
  TrendingUp, 
  Activity,
  Calendar,
  Eye,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Star
} from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch admin dashboard stats
      const response = await fetchWithAdminAuth('/api/admin/dashboard');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
          // console.log('Dashboard stats:', data.data);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to load dashboard data');
        return;
      }

      // Fetch recent experiences
      const expResponse = await fetchWithAdminAuth('/api/admin/experiences?limit=5&sortBy=createdAt&sortOrder=desc');
      
      if (expResponse.ok) {
        const expData = await expResponse.json();
        if (expData.success) {
          setRecentActivity(expData.data.experiences || []);
        }
      }

    } catch (err) {
      if (err.message !== 'Admin authentication required') {
        setError('Failed to load dashboard data');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center max-w-md">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button 
            onClick={fetchDashboardData} 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Monitor your platform's performance and activity</p>
        </div>
        <button 
          onClick={fetchDashboardData} 
          className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Experiences</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalExperiences || 0}</p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <FileText className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Companies</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalCompanies || 0}</p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <Building2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Experiences</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.todayExperiences || 0}</p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
              <Calendar className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Recent Experiences</h3>
          </div>
        </div>
        <div className="p-6">
          {recentActivity.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Author</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentActivity.map((experience) => (
                    <tr key={experience._id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          {experience.companyInfo?.companyLogo && (
                            <img
                              src={experience.companyInfo.companyLogo}
                              alt={experience.companyInfo.companyName || 'Company Logo'}
                              className="w-8 h-8 object-contain rounded"
                            />
                          )}
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {experience.companyInfo?.companyName}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {experience.userId?.name || 'Unknown'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {new Date(experience.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          experience.isPublished 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' 
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                        }`}>
                          {experience.isPublished ? (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Published
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </>
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">No recent activity found.</p>
            </div>
          )}
        </div>
      </div> 

      {/* Platform Health */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Platform Health</h3>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 dark:bg-green-900/10 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-green-600 dark:text-green-400">{stats.publishedExperiences || 0}</div>
              <div className="text-sm text-green-600 dark:text-green-400">Published Experiences</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-lg">
              <Clock className="w-8 h-8 text-yellow-600 dark:text-yellow-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingExperiences || 0}</div>
              <div className="text-sm text-yellow-600 dark:text-yellow-400">Pending Review</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 dark:bg-red-900/10 rounded-lg">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-red-600 dark:text-red-400">{stats.flaggedExperiences || 0}</div>
              <div className="text-sm text-red-600 dark:text-red-400">Flagged Content</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
              <Users className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{stats.todayUsers || 0}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">New Users Today</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
