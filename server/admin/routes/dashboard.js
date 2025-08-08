const express = require('express');
const { requireAdminAuth, logAdminAction } = require('../middleware/adminAuth');
const { 
  getDashboardStats, 
  getSystemHealth, 
  getAnalytics 
} = require('../controllers/dashboardController');

const router = express.Router();

// All routes require admin authentication
router.use(requireAdminAuth);

// @route   GET /api/admin/dashboard/stats
// @desc    Get admin dashboard statistics
// @access  Private (Admin)
router.get('/stats', logAdminAction('view_dashboard_stats'), getDashboardStats);

// @route   GET /api/admin/dashboard/health
// @desc    Get system health information
// @access  Private (Admin)
router.get('/health', logAdminAction('view_system_health'), getSystemHealth);

// @route   GET /api/admin/dashboard/analytics
// @desc    Get platform analytics for charts
// @access  Private (Admin)
router.get('/analytics', logAdminAction('view_analytics'), getAnalytics);

module.exports = router;
