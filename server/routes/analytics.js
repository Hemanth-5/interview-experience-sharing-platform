const express = require('express');
const Experience = require('../models/Experience');
const User = require('../models/User');
const { isAuthenticated, isAdmin } = require('../middleware/auth');
const router = express.Router();

// @route   GET /api/analytics/trending
// @desc    Get trending data
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Top companies by experience count
    const topCompanies = await Experience.aggregate([
      { $match: { isPublished: true, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { 
        _id: '$companyInfo.companyName', 
        count: { $sum: 1 },
        avgRating: { $avg: '$overallRating' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Popular roles
    const popularRoles = await Experience.aggregate([
      { $match: { isPublished: true, createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { 
        _id: '$companyInfo.role', 
        count: { $sum: 1 },
        avgRating: { $avg: '$overallRating' }
      }},
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Common skills
    const commonSkills = await Experience.aggregate([
      { $match: { isPublished: true } },
      { $unwind: '$backgroundInfo.skills' },
      { $group: { 
        _id: '$backgroundInfo.skills', 
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 15 }
    ]);

    // Internship type distribution
    const internshipTypes = await Experience.aggregate([
      { $match: { isPublished: true } },
      { $group: { 
        _id: '$companyInfo.internshipType', 
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    // Success rate by location
    const locationStats = await Experience.aggregate([
      { $match: { isPublished: true } },
      { $group: {
        _id: '$companyInfo.location',
        total: { $sum: 1 },
        selected: { 
          $sum: { $cond: [{ $eq: ['$finalResult', 'Selected'] }, 1, 0] }
        }
      }},
      { $addFields: {
        successRate: { 
          $multiply: [{ $divide: ['$selected', '$total'] }, 100]
        }
      }}
    ]);

    res.json({
      success: true,
      data: {
        topCompanies,
        popularRoles,
        commonSkills,
        internshipTypes,
        locationStats
      }
    });
  } catch (error) {
    console.error('Error fetching trending data:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending data',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/company/:companyName
// @desc    Get company analytics
// @access  Public
router.get('/company/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    
    const companyExperiences = await Experience.find({
      'companyInfo.companyName': new RegExp(companyName, 'i'),
      isPublished: true
    });

    if (companyExperiences.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No experiences found for this company'
      });
    }

    // Basic stats
    const totalExperiences = companyExperiences.length;
    const averageRating = companyExperiences.reduce((sum, exp) => sum + exp.overallRating, 0) / totalExperiences;
    const selectedCount = companyExperiences.filter(exp => exp.finalResult === 'Selected').length;
    const successRate = (selectedCount / totalExperiences) * 100;

    // Common questions across all rounds
    const allQuestions = [];
    companyExperiences.forEach(exp => {
      exp.rounds.forEach(round => {
        round.technicalQuestions.forEach(q => allQuestions.push(q.question));
        round.behavioralQuestions.forEach(q => allQuestions.push(q.question));
      });
    });

    // Find most common questions
    const questionFrequency = {};
    allQuestions.forEach(question => {
      questionFrequency[question] = (questionFrequency[question] || 0) + 1;
    });

    const commonQuestions = Object.entries(questionFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([question, frequency]) => ({ question, frequency }));

    // Average number of rounds
    const averageRounds = companyExperiences.reduce((sum, exp) => sum + exp.rounds.length, 0) / totalExperiences;

    // Role distribution
    const roleDistribution = {};
    companyExperiences.forEach(exp => {
      const role = exp.companyInfo.role;
      roleDistribution[role] = (roleDistribution[role] || 0) + 1;
    });

    // Preparation time analysis
    const avgPreparationTime = companyExperiences.reduce((sum, exp) => sum + exp.preparationTime, 0) / totalExperiences;

    // Round type frequency
    const roundTypeFrequency = {};
    companyExperiences.forEach(exp => {
      exp.rounds.forEach(round => {
        roundTypeFrequency[round.roundType] = (roundTypeFrequency[round.roundType] || 0) + 1;
      });
    });

    res.json({
      success: true,
      data: {
        companyName,
        totalExperiences,
        averageRating: parseFloat(averageRating.toFixed(2)),
        successRate: parseFloat(successRate.toFixed(2)),
        selectedCount,
        averageRounds: parseFloat(averageRounds.toFixed(1)),
        averagePreparationTime: parseFloat(avgPreparationTime.toFixed(1)),
        commonQuestions,
        roleDistribution,
        roundTypeFrequency
      }
    });
  } catch (error) {
    console.error('Error fetching company analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/user-stats
// @desc    Get user statistics
// @access  Private
router.get('/user-stats', isAuthenticated, async (req, res) => {
  try {
    const userExperiences = await Experience.find({ 
      userId: req.user._id,
      isPublished: true 
    });

    const totalViews = userExperiences.reduce((sum, exp) => sum + exp.views, 0);
    const totalUpvotes = userExperiences.reduce((sum, exp) => sum + exp.upvotes.length, 0);
    const totalDownvotes = userExperiences.reduce((sum, exp) => sum + exp.downvotes.length, 0);

    // Calculate helpfulness score
    const helpfulnessScore = totalUpvotes > 0 ? 
      parseFloat(((totalUpvotes / (totalUpvotes + totalDownvotes)) * 100).toFixed(2)) : 0;

    // Experiences by result
    const resultDistribution = {};
    userExperiences.forEach(exp => {
      resultDistribution[exp.finalResult] = (resultDistribution[exp.finalResult] || 0) + 1;
    });

    // Most viewed experience
    const mostViewedExperience = userExperiences.length > 0 ? 
      userExperiences.reduce((max, exp) => exp.views > max.views ? exp : max) : null;

    res.json({
      success: true,
      data: {
        experiencesShared: userExperiences.length,
        totalViews,
        totalUpvotes,
        totalDownvotes,
        helpfulnessScore,
        resultDistribution,
        mostViewedExperience: mostViewedExperience ? {
          id: mostViewedExperience._id,
          companyName: mostViewedExperience.companyInfo.companyName,
          role: mostViewedExperience.companyInfo.role,
          views: mostViewedExperience.views,
          upvotes: mostViewedExperience.upvotes.length
        } : null,
        userLevel: req.user.level,
        userPoints: req.user.points,
        userBadges: req.user.badges
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user statistics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/dashboard
// @desc    Get admin dashboard analytics
// @access  Admin
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Total counts
    const totalExperiences = await Experience.countDocuments({ isPublished: true });
    const totalUsers = await User.countDocuments();
    const totalViews = await Experience.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);

    // Recent activity
    const experiencesThisMonth = await Experience.countDocuments({
      isPublished: true,
      createdAt: { $gte: lastMonth }
    });

    const experiencesThisWeek = await Experience.countDocuments({
      isPublished: true,
      createdAt: { $gte: lastWeek }
    });

    const newUsersThisMonth = await User.countDocuments({
      joinedAt: { $gte: lastMonth }
    });

    // Top contributors
    const topContributors = await Experience.aggregate([
      { $match: { isPublished: true } },
      { $group: { 
        _id: '$userId', 
        experienceCount: { $sum: 1 },
        totalViews: { $sum: '$views' },
        totalUpvotes: { $sum: { $size: '$upvotes' } }
      }},
      { $sort: { experienceCount: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          name: '$user.name',
          email: '$user.email',
          experienceCount: 1,
          totalViews: 1,
          totalUpvotes: 1
        }
      }
    ]);

    // Monthly growth
    const monthlyGrowth = await Experience.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);

    res.json({
      success: true,
      data: {
        totals: {
          experiences: totalExperiences,
          users: totalUsers,
          views: totalViews[0]?.totalViews || 0
        },
        recentActivity: {
          experiencesThisMonth,
          experiencesThisWeek,
          newUsersThisMonth
        },
        topContributors,
        monthlyGrowth
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard analytics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/platform-stats
// @desc    Get platform statistics
// @access  Public
router.get('/platform-stats', async (req, res) => {
  try {
    // Get total experiences
    const totalExperiences = await Experience.countDocuments({ isPublished: true });
    
    // Get total unique companies
    const totalCompaniesResult = await Experience.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$companyInfo.companyName' } },
      { $count: 'totalCompanies' }
    ]);
    const totalCompanies = totalCompaniesResult[0]?.totalCompanies || 0;
    
    // Get total users
    const totalUsers = await User.countDocuments();

    res.json({
      success: true,
      totalExperiences,
      totalCompanies,
      totalUsers
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching platform statistics',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/top-companies
// @desc    Get top companies by experience count
// @access  Public
router.get('/top-companies', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    
    const topCompanies = await Experience.aggregate([
      { $match: { isPublished: true } },
      { 
        $group: { 
          _id: '$companyInfo.companyName', 
          count: { $sum: 1 },
          avgRating: { $avg: '$overallRating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      data: topCompanies
    });
  } catch (error) {
    console.error('Error fetching top companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top companies',
      error: error.message
    });
  }
});

module.exports = router;
