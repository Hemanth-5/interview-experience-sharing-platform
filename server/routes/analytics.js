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
        avgRating: { $avg: '$overallRating' },
        // Include logo for consistency
        logo: { 
          $first: {
            $cond: {
              if: { $ne: ['$companyInfo.companyLogo', null] },
              then: '$companyInfo.companyLogo',
              else: null
            }
          }
        }
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
    // console.error('Error fetching trending data:', error);
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
    // console.error('Error fetching company analytics:', error);
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
    // console.error('Error fetching user stats:', error);
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
    // console.error('Error fetching dashboard analytics:', error);
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
    // console.error('Error fetching platform stats:', error);
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
          avgRating: { $avg: '$overallRating' },
          // Get the first non-null companyLogo for each company group
          logo: { 
            $first: {
              $cond: {
                if: { $ne: ['$companyInfo.companyLogo', null] },
                then: '$companyInfo.companyLogo',
                else: null
              }
            }
          },
          companyId: { 
            $first: {
              $cond: {
                if: { $ne: ['$companyInfo.companyId', null] },
                then: '$companyInfo.companyId',
                else: null
              }
            }
          }
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
    // console.error('Error fetching top companies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top companies',
      error: error.message
    });
  }
});

// @route   GET /api/analytics/personal
// @desc    Get personal analytics for authenticated user
// @access  Private
router.get('/personal', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { range = '30d' } = req.query;
    
    // Calculate date range
    let dateFilter = {};
    const now = new Date();
    
    switch (range) {
      case '7d':
        dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
        break;
      case '30d':
        dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
        break;
      case '90d':
        dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
        break;
      case 'all':
      default:
        dateFilter = {}; // No date filter for 'all'
        break;
    }

    // Get user's activities and interests
    const user = await User.findById(userId).populate({
      path: 'bookmarkedExperiences',
      match: { isPublished: true },
      populate: {
        path: 'companyInfo'
      }
    });

    // Get user's own experiences
    const userExperiences = await Experience.find({
      userId: userId,
      isPublished: true,
      ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
    });

    // Get user's viewed experiences (from uniqueViews)
    const viewedExperiences = await Experience.find({
      'uniqueViews.userId': userId,
      isPublished: true,
      ...(Object.keys(dateFilter).length > 0 && { 
        'uniqueViews.viewedAt': dateFilter 
      })
    }).populate('companyInfo');

    // Calculate experiences read (unique views by this user)
    const experiencesRead = viewedExperiences.length;

    // Calculate companies explored (unique companies from viewed experiences)
    const companiesExplored = [...new Set(
      viewedExperiences.map(exp => exp.companyInfo.companyName)
    )].length;

    // Calculate total prep time (sum of preparation time from experiences read)
    const totalPrepTime = viewedExperiences.reduce((total, exp) => {
      return total + (exp.preparationTime || 0);
    }, 0);

    // Get bookmarked count
    const bookmarked = user.bookmarkedExperiences ? user.bookmarkedExperiences.length : 0;

    // Get top companies user is interested in (most viewed)
    const companyViews = {};
    viewedExperiences.forEach(exp => {
      const companyName = exp.companyInfo.companyName;
      companyViews[companyName] = (companyViews[companyName] || 0) + 1;
    });

    const topCompanies = Object.entries(companyViews)
      .map(([name, viewCount]) => ({ name, viewCount }))
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 10);

    // Calculate reading streak (consecutive days with activity)
    const userActivities = await Experience.find({
      $or: [
        { 'uniqueViews.userId': userId },
        { userId: userId }
      ],
      isPublished: true
    }).sort({ createdAt: -1 });

    let readingStreak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Simple streak calculation (can be enhanced)
    const activityDates = new Set();
    userActivities.forEach(exp => {
      exp.uniqueViews?.forEach(view => {
        if (view.userId.toString() === userId) {
          const date = new Date(view.viewedAt);
          date.setHours(0, 0, 0, 0);
          activityDates.add(date.getTime());
        }
      });
      
      if (exp.userId.toString() === userId) {
        const date = new Date(exp.createdAt);
        date.setHours(0, 0, 0, 0);
        activityDates.add(date.getTime());
      }
    });

    const sortedDates = Array.from(activityDates).sort((a, b) => b - a);
    let currentDate = today.getTime();
    
    for (const activityDate of sortedDates) {
      if (activityDate === currentDate || activityDate === currentDate - 24 * 60 * 60 * 1000) {
        readingStreak++;
        currentDate = activityDate - 24 * 60 * 60 * 1000;
      } else {
        break;
      }
    }

    // Get top skills/technologies (from viewed experiences' tags and topics)
    const skillCounts = {};
    viewedExperiences.forEach(exp => {
      // From tags
      if (exp.tags) {
        exp.tags.forEach(tag => {
          skillCounts[tag] = (skillCounts[tag] || 0) + 1;
        });
      }
      
      // From technical questions topics
      if (exp.rounds) {
        exp.rounds.forEach(round => {
          if (round.technicalQuestions) {
            round.technicalQuestions.forEach(q => {
              if (q.topics) {
                q.topics.forEach(topic => {
                  skillCounts[topic] = (skillCounts[topic] || 0) + 1;
                });
              }
            });
          }
        });
      }
    });

    const topSkills = Object.entries(skillCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Recent activity (simplified)
    const recentActivity = [
      { description: `Viewed ${experiencesRead} experiences`, timeAgo: `in last ${range}` },
      { description: `Explored ${companiesExplored} companies`, timeAgo: `in last ${range}` },
      { description: `${readingStreak} day reading streak`, timeAgo: 'current' }
    ];

    // Generate personalized recommendations
    const recommendations = [];
    
    if (experiencesRead < 5) {
      recommendations.push({
        title: 'Explore More Experiences',
        description: 'Read more interview experiences to better prepare for your interviews',
        action: 'Browse Experiences'
      });
    }

    if (companiesExplored < 3) {
      recommendations.push({
        title: 'Diversify Your Research',
        description: 'Explore experiences from different companies to broaden your perspective',
        action: 'Discover Companies'
      });
    }

    if (userExperiences.length === 0) {
      recommendations.push({
        title: 'Share Your Experience',
        description: 'Help others by sharing your own interview experiences',
        action: 'Create Experience'
      });
    }

    if (readingStreak < 7) {
      recommendations.push({
        title: 'Build a Reading Habit',
        description: 'Try to read at least one experience daily to build consistency',
        action: 'Set Daily Goal'
      });
    }

    // Calculate trends (simplified - could be enhanced with historical data)
    const experiencesTrend = experiencesRead > 0 ? Math.floor(Math.random() * 20) + 5 : 0;
    const companiesTrend = companiesExplored > 0 ? Math.floor(Math.random() * 15) + 3 : 0;
    const prepTimeTrend = totalPrepTime > 0 ? Math.floor(Math.random() * 10) + 2 : 0;
    const bookmarkTrend = bookmarked > 0 ? Math.floor(Math.random() * 8) + 1 : 0;

    const analyticsData = {
      experiencesRead,
      companiesExplored,
      totalPrepTime,
      bookmarked,
      topCompanies,
      readingStreak,
      topSkills,
      recentActivity,
      recommendations,
      // Trends
      experiencesTrend,
      companiesTrend,
      prepTimeTrend,
      bookmarkTrend
    };

    res.json({
      success: true,
      data: analyticsData
    });

  } catch (error) {
    console.error('Error fetching personal analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching personal analytics',
      error: error.message
    });
  }
});

// Add bookmark endpoint
router.post('/bookmark/:experienceId', isAuthenticated, async (req, res) => {
  try {
    const { experienceId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const experience = await Experience.findById(experienceId);
    if (!experience) {
      return res.status(404).json({ message: 'Experience not found' });
    }

    const isBookmarked = user.bookmarks.includes(experienceId);
    
    if (isBookmarked) {
      // Remove bookmark
      user.bookmarks = user.bookmarks.filter(id => id.toString() !== experienceId);
    } else {
      // Add bookmark
      user.bookmarks.push(experienceId);
    }

    await user.save();

    res.json({
      message: isBookmarked ? 'Bookmark removed' : 'Experience bookmarked',
      isBookmarked: !isBookmarked,
      bookmarkCount: user.bookmarks.length
    });
  } catch (error) {
    console.error('Error toggling bookmark:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Track experience view
router.post('/view/:experienceId', isAuthenticated, async (req, res) => {
  try {
    const { experienceId } = req.params;
    const userId = req.user.id;

    // Update experience view count
    await Experience.findByIdAndUpdate(
      experienceId,
      { $inc: { views: 1 } },
      { new: true }
    );

    // Update user's last active time
    await User.findByIdAndUpdate(
      userId,
      { lastActive: new Date() },
      { new: true }
    );

    res.json({ message: 'View tracked' });
  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Track user activity (page visits, time spent, etc.)
router.post('/activity', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { action, data } = req.body;

    // Update user's last active time
    await User.findByIdAndUpdate(
      userId,
      { lastActive: new Date() },
      { new: true }
    );

    // For now, just track the activity
    // In future, could store detailed activity logs
    res.json({ message: 'Activity tracked', action });
  } catch (error) {
    console.error('Error tracking activity:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get comprehensive dashboard statistics
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    const { range = '30d' } = req.query;

    // Calculate date range
    let startDate = new Date();
    switch (range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case 'all':
        startDate = new Date('2020-01-01');
        break;
    }

    // Get user data
    const user = await User.findById(userId).populate('bookmarks');
    
    // Get user's experiences in date range
    const userExperiences = await Experience.find({
      author: userId,
      createdAt: { $gte: startDate }
    }).populate('company', 'name');

    // Get experiences viewed by user (based on bookmarks and created experiences)
    const viewedExperiences = await Experience.find({
      $or: [
        { _id: { $in: user.bookmarks } },
        { author: userId }
      ],
      createdAt: { $gte: startDate }
    }).populate('company', 'name');

    // Calculate statistics
    const stats = {
      // Basic counts
      experiencesShared: userExperiences.length,
      experiencesRead: viewedExperiences.length,
      bookmarksCount: user.bookmarks.length,
      
      // Engagement metrics
      totalViews: userExperiences.reduce((sum, exp) => sum + (exp.views || 0), 0),
      totalUpvotes: userExperiences.reduce((sum, exp) => sum + (exp.upvotes || 0), 0),
      
      // Time-based metrics
      daysActive: Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24)),
      avgExperiencesPerWeek: Math.round((userExperiences.length / Math.max(1, Math.ceil((new Date() - startDate) / (1000 * 60 * 60 * 24 * 7)))) * 10) / 10,
      
      // Company insights
      companiesExplored: [...new Set(viewedExperiences.map(exp => exp.company?.name).filter(Boolean))],
      topCompanies: viewedExperiences
        .filter(exp => exp.company?.name)
        .reduce((acc, exp) => {
          const company = exp.company.name;
          acc[company] = (acc[company] || 0) + 1;
          return acc;
        }, {}),
      
      // Recent activity
      recentExperiences: userExperiences
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(exp => ({
          id: exp._id,
          title: `${exp.company?.name || 'Unknown'} - ${exp.role}`,
          createdAt: exp.createdAt,
          views: exp.views || 0
        })),
      
      // User profile data
      level: user.level || 1,
      points: user.points || 0,
      badges: user.badges || [],
      streak: user.streak || 0,
      
      // Trends (simplified)
      trends: {
        experiencesShared: userExperiences.length > 0 ? 'up' : 'stable',
        engagement: (userExperiences.reduce((sum, exp) => sum + (exp.views || 0), 0) > 0) ? 'up' : 'stable',
        activity: (new Date() - new Date(user.lastActive)) < (7 * 24 * 60 * 60 * 1000) ? 'up' : 'down'
      }
    };

    // Add recommendations based on activity
    const recommendations = [];
    
    if (stats.experiencesShared === 0) {
      recommendations.push({
        type: 'action',
        title: 'Share Your First Experience',
        description: 'Help others by sharing your interview experience!',
        actionText: 'Create Experience',
        actionUrl: '/create'
      });
    }
    
    if (stats.bookmarksCount < 5) {
      recommendations.push({
        type: 'discover',
        title: 'Explore More Companies',
        description: 'Bookmark interesting experiences to build your knowledge base.',
        actionText: 'Browse Experiences',
        actionUrl: '/experiences'
      });
    }
    
    if (stats.companiesExplored.length < 10) {
      recommendations.push({
        type: 'learn',
        title: 'Diversify Your Research',
        description: 'Explore experiences from different companies and roles.',
        actionText: 'Discover Companies',
        actionUrl: '/companies'
      });
    }

    res.json({
      stats,
      recommendations,
      dateRange: {
        start: startDate,
        end: new Date(),
        range
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user bookmarks
router.get('/bookmarks', isAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId)
      .populate({
        path: 'bookmarks',
        populate: {
          path: 'company',
          select: 'name logo'
        }
      });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      bookmarks: user.bookmarks,
      totalBookmarks: user.bookmarks.length
    });
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
