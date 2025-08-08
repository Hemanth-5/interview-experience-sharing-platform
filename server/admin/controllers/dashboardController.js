const Experience = require('../../models/Experience');
const User = require('../../models/User');
const Company = require('../../models/Company');
const AdminAuth = require('../models/AdminAuth');
const logger = require('../../utils/logger');

/**
 * Get admin dashboard statistics
 */
const getDashboardStats = async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get various statistics
    const [
      totalUsers,
      totalExperiences,
      totalCompanies,
      todayUsers,
      todayExperiences,
      weeklyUsers,
      weeklyExperiences,
      monthlyUsers,
      monthlyExperiences,
      topCompanies,
      recentExperiences,
      flaggedExperiences
    ] = await Promise.all([
      User.countDocuments(),
      Experience.countDocuments(),
      Company.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today } }),
      Experience.countDocuments({ createdAt: { $gte: today } }),
      User.countDocuments({ createdAt: { $gte: thisWeek } }),
      Experience.countDocuments({ createdAt: { $gte: thisWeek } }),
      User.countDocuments({ createdAt: { $gte: thisMonth } }),
      Experience.countDocuments({ createdAt: { $gte: thisMonth } }),
      
      // Top companies by experience count
      Experience.aggregate([
        { $group: { _id: '$company', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        { $lookup: { from: 'companies', localField: '_id', foreignField: '_id', as: 'companyInfo' } }
      ]),
      
      // Recent experiences
      Experience.find()
        .populate('userId', 'name email')
        .populate('company', 'name logo')
        .sort({ createdAt: -1 })
        .limit(10),
      
      // Flagged/reported experiences (if you have a reporting system)
      Experience.find({ reportCount: { $gte: 1 } })
        .populate('userId', 'name email')
        .populate('company', 'name')
        .sort({ reportCount: -1 })
        .limit(10)
    ]);

    // User role distribution
    const userRoleStats = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Experience status distribution
    const experienceStatusStats = await Experience.aggregate([
      { $group: { _id: '$isPublished', count: { $sum: 1 } } }
    ]);

    const stats = {
      overview: {
        totalUsers,
        totalExperiences,
        totalCompanies,
        totalAdmins: await AdminAuth.countDocuments({ isActive: true })
      },
      today: {
        newUsers: todayUsers,
        newExperiences: todayExperiences
      },
      thisWeek: {
        newUsers: weeklyUsers,
        newExperiences: weeklyExperiences
      },
      thisMonth: {
        newUsers: monthlyUsers,
        newExperiences: monthlyExperiences
      },
      userRoles: userRoleStats,
      experienceStatus: experienceStatusStats,
      topCompanies: topCompanies.map(item => ({
        company: item.companyInfo[0] || { name: 'Unknown', _id: item._id },
        experienceCount: item.count
      })),
      recentExperiences: recentExperiences.map(exp => ({
        _id: exp._id,
        title: exp.title,
        company: exp.company?.name || 'Unknown',
        author: exp.userId?.name || 'Unknown',
        createdAt: exp.createdAt,
        isPublished: exp.isPublished
      })),
      flaggedContent: flaggedExperiences.map(exp => ({
        _id: exp._id,
        title: exp.title,
        company: exp.company?.name || 'Unknown',
        author: exp.userId?.name || 'Unknown',
        reportCount: exp.reportCount || 0,
        createdAt: exp.createdAt
      }))
    };

    res.json({
      success: true,
      data: stats
    });

    // // console.log(stats)

  } catch (error) {
    logger.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics'
    });
  }
};

/**
 * Get system health information
 */
const getSystemHealth = async (req, res) => {
  try {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: {
        status: 'connected',
        collections: {
          users: await User.estimatedDocumentCount(),
          experiences: await Experience.estimatedDocumentCount(),
          companies: await Company.estimatedDocumentCount(),
          adminAuth: await AdminAuth.estimatedDocumentCount()
        }
      },
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    };

    res.json({
      success: true,
      data: health
    });

  } catch (error) {
    logger.error('System health check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking system health',
      data: {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      }
    });
  }
};

/**
 * Get platform analytics for charts
 */
const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let dateRange;
    const now = new Date();
    
    switch (period) {
      case '7d':
        dateRange = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        dateRange = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        dateRange = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    // Daily user registrations
    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: dateRange } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Daily experience submissions
    const experienceGrowth = await Experience.aggregate([
      { $match: { createdAt: { $gte: dateRange } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Popular positions
    const popularPositions = await Experience.aggregate([
      { $match: { createdAt: { $gte: dateRange } } },
      { $group: { _id: '$position', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    res.json({
      success: true,
      data: {
        period,
        userGrowth: userGrowth.map(item => ({
          date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
          count: item.count
        })),
        experienceGrowth: experienceGrowth.map(item => ({
          date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
          count: item.count
        })),
        popularPositions: popularPositions.map(item => ({
          position: item._id,
          count: item.count
        }))
      }
    });

  } catch (error) {
    logger.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics data'
    });
  }
};

module.exports = {
  getDashboardStats,
  getSystemHealth,
  getAnalytics
};
