const express = require('express');
const router = express.Router();
const { isAdmin, isAdminWithDualAuth } = require('../../middleware/auth');
const User = require('../../models/User');
const Experience = require('../../models/Experience');
const Comment = require('../../models/Comment');
const Company = require('../../models/Company');
const Notification = require('../../models/Notification');
const AdminAuth = require('../models/AdminAuth');

// Include auth routes
const adminAuthRoutes = require('./adminAuth');
router.use('/auth', adminAuthRoutes);

// @route   POST /api/admin/login
// @desc    Admin dual authentication
// @access  Admin (requires existing user session)
router.post('/login', async (req, res) => {
  try {
    // Check if user is already authenticated via Google OAuth
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'Google authentication required first'
      });
    }

    // Check if user has admin role
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin role required'
      });
    }

    const { username, password } = req.body;

    // Find admin auth record by username
    const adminAuth = await AdminAuth.findOne({ adminUsername: username });
    
    if (!adminAuth) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if account is locked
    if (adminAuth.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Account temporarily locked due to too many failed attempts'
      });
    }

    // Check if this admin auth belongs to the current user
    if (adminAuth.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Admin credentials do not match current user'
      });
    }

    // Verify password
    const isPasswordValid = await adminAuth.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      await adminAuth.incLoginAttempts();
      
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Reset login attempts on successful login
    await adminAuth.resetLoginAttempts();
    
    // Store admin session
    req.session.adminAuthenticated = true;
    
    res.json({
      success: true,
      message: 'Admin authentication successful',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
});

// @route   POST /api/admin/logout
// @desc    Admin logout (clear admin session)
// @access  Admin
router.post('/logout', (req, res) => {
  req.session.adminAuthenticated = false;
  res.json({
    success: true,
    message: 'Admin session cleared'
  });
});

// @route   GET /api/admin/auth-check
// @desc    Check if admin is authenticated (lightweight endpoint)
// @access  Admin with dual auth
router.get('/auth-check', isAdminWithDualAuth, (req, res) => {
  res.json({
    success: true,
    authenticated: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
});

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard stats
// @access  Admin with dual auth
router.get('/dashboard', isAdminWithDualAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalExperiences,
      totalComments,
      todayUsers,
      todayExperiences,
      publishedExperiences,
      pendingExperiences,
      flaggedExperiences,
      totalCompanies
    ] = await Promise.all([
      User.countDocuments(),
      Experience.countDocuments(),
      Comment.countDocuments(),
      User.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),
      Experience.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),
      Experience.countDocuments({ isPublished: true }),
      Experience.countDocuments({ isPublished: false }),
      Experience.countDocuments({ flagged: true }),
      Company.countDocuments()
    ]);

    // // Get unique companies count
    // const companies = await Experience.distinct('company');
    // const totalCompanies = companies.length;

    // Calculate total views
    const viewsResult = await Experience.aggregate([
      { $group: { _id: null, totalViews: { $sum: '$views' } } }
    ]);
    const totalViews = viewsResult[0]?.totalViews || 0;

    // Calculate weekly growth
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const [thisWeekUsers, lastWeekUsers] = await Promise.all([
      User.countDocuments({ createdAt: { $gte: weekAgo } }),
      User.countDocuments({ 
        createdAt: { 
          $gte: new Date(weekAgo.getTime() - 7 * 24 * 60 * 60 * 1000),
          $lt: weekAgo 
        } 
      })
    ]);

    const weeklyGrowth = lastWeekUsers > 0 
      ? Math.round(((thisWeekUsers - lastWeekUsers) / lastWeekUsers) * 100)
      : 0;

    res.json({
      success: true,
      data: {
        totalUsers,
        totalExperiences,
        totalComments,
        totalCompanies,
        totalViews,
        todayUsers,
        todayExperiences,
        publishedExperiences,
        pendingExperiences,
        flaggedExperiences,
        weeklyGrowth: `${weeklyGrowth > 0 ? '+' : ''}${weeklyGrowth}%`
      }
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard data',
      error: error.message
    });
  }
});

// @route   GET /api/admin/users
// @desc    Get all users with pagination and filtering
// @access  Admin
router.get('/users', isAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      role, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = {};
    if (role && role !== '') {
      filter.role = role;
    }
    if (search && search !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const [users, totalUsers] = await Promise.all([
      User.find(filter)
        .select('-googleId') // Don't send sensitive data
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message
    });
  }
});

// @route   PUT /api/admin/users/:userId/role
// @desc    Update user role
// @access  Admin
router.put('/users/:userId/role', isAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['Student', 'Moderator', 'Admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role provided'
      });
    }

    // Prevent admin from removing their own admin role
    if (req.user._id.toString() === userId && role !== 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'You cannot remove your own admin privileges'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true, select: '-googleId' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: `User role updated to ${role}`
    });

  } catch (error) {
    console.error('Admin update role error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: error.message
    });
  }
});

// @route   GET /api/admin/experiences
// @desc    Get all experiences with pagination and filtering
// @access  Admin
router.get('/experiences', isAdmin, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status,
      userSearch,
      companySearch,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    console.log('Admin experiences query params:', req.query); // Debug log

    // Build filter object
    const filter = {};
    if (status === 'published') {
      filter.isPublished = true;
      filter.flagged = { $ne: true };
    } else if (status === 'draft') {
      filter.isPublished = false;
      filter.flagged = { $ne: true };
    } else if (status === 'flagged') {
      filter.flagged = true;
    }

    // Build aggregation pipeline for user and company search
    const pipeline = [
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      }
    ];

    // Add user search filter
    if (userSearch && userSearch !== '') {
      pipeline.push({
        $match: {
          $or: [
            { 'user.name': { $regex: userSearch, $options: 'i' } },
            { 'user.email': { $regex: userSearch, $options: 'i' } }
          ]
        }
      });
    }

    // Add company search filter
    if (companySearch && companySearch !== '') {
      pipeline.push({
        $match: {
          'companyInfo.companyName': { $regex: companySearch, $options: 'i' }
        }
      });
    }

    // Add status filter
    if (Object.keys(filter).length > 0) {
      pipeline.push({ $match: filter });
    }

    // Add sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sort });

    // Execute aggregation to get total count
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Experience.aggregate(totalPipeline);
    const totalExperiences = totalResult[0]?.total || 0;

    // Add pagination
    const skip = (page - 1) * limit;
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: parseInt(limit) });

    // Execute main aggregation
    const experiences = await Experience.aggregate(pipeline);

    const totalPages = Math.ceil(totalExperiences / limit);

    res.json({
      success: true,
      data: {
        experiences: experiences.map(exp => ({
          ...exp,
          userId: exp.user // Map user data to userId for frontend compatibility
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          total: totalExperiences,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Admin experiences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experiences',
      error: error.message
    });
  }
});

// @route   POST /api/admin/experiences/:id/moderate
// @desc    Moderate experience (approve, reject, flag)
// @access  Admin
router.post('/experiences/:id/moderate', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason, reasonDetails } = req.body;

    const validActions = ['approve', 'reject', 'flag', 'unflag', 'unpublish'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action provided'
      });
    }

    // Find the experience first to get owner info
    const experience = await Experience.findById(id).populate('userId', 'name email');
    if (!experience) {
      return res.status(404).json({
        success: false,
        message: 'Experience not found'
      });
    }

    let updateData = {};
    let notificationData = null;

    switch (action) {
      case 'approve':
        updateData = { 
          isPublished: true, 
          flagged: false,
          flaggedAt: null,
          flaggedBy: null,
          flagReason: null,
          flagReasonDetails: null
        };
        notificationData = {
          recipient: experience.userId._id,
          type: 'experience_approved',
          title: 'Experience Approved',
          message: `Your experience at ${experience.companyInfo?.companyName} has been approved and is now published.`,
          relatedExperience: experience._id,
          actionUrl: `/experiences/${experience._id}`,
          priority: 'medium'
        };
        break;
      case 'reject':
      case 'unpublish':
        updateData = { isPublished: false };
        notificationData = {
          recipient: experience.userId._id,
          type: 'experience_rejected',
          title: 'Experience Unpublished',
          message: `Your experience at ${experience.companyInfo?.companyName} has been unpublished and is no longer visible to other users.`,
          relatedExperience: experience._id,
          actionUrl: `/profile`,
          priority: 'high'
        };
        break;
      case 'flag':
        updateData = { 
          flagged: true,
          flaggedAt: new Date(),
          flaggedBy: req.user._id,
          flagReason: reason,
          flagReasonDetails: reasonDetails
        };
        
        // Create detailed notification for flagging
        const reasonDisplayMap = {
          'inappropriate_content': 'Inappropriate Content',
          'fake_information': 'Fake Information',
          'spam': 'Spam',
          'offensive_language': 'Offensive Language',
          'copyright_violation': 'Copyright Violation',
          'personal_attacks': 'Personal Attacks',
          'off_topic': 'Off Topic',
          'duplicate_content': 'Duplicate Content',
          'other': 'Other'
        };

        notificationData = {
          recipient: experience.userId._id,
          type: 'experience_flagged',
          title: 'Content Flagged',
          message: `Your experience at ${experience.companyInfo?.companyName} has been flagged for: ${reasonDisplayMap[reason] || reason}. ${reasonDetails ? `Details: ${reasonDetails}` : ''}`,
          relatedExperience: experience._id,
          flagReason: reason,
          flagReasonDetails: reasonDetails,
          actionUrl: `/experiences/${experience._id}`,
          priority: 'urgent',
          metadata: {
            flaggedBy: req.user.name,
            flaggedAt: new Date()
          }
        };
        break;
      case 'unflag':
        updateData = { 
          flagged: false,
          flaggedAt: null,
          flaggedBy: null,
          flagReason: null,
          flagReasonDetails: null
        };
        notificationData = {
          recipient: experience.userId._id,
          type: 'experience_unflagged',
          title: 'Content Unflagged',
          message: `Your experience at ${experience.companyInfo?.companyName} has been reviewed and is no longer flagged.`,
          relatedExperience: experience._id,
          actionUrl: `/experiences/${experience._id}`,
          priority: 'medium'
        };
        break;
    }

    // Update the experience
    const updatedExperience = await Experience.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'name email');

    // Create notification for the experience owner
    if (notificationData) {
      try {
        await Notification.create(notificationData);
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't fail the main action if notification fails
      }
    }

    res.json({
      success: true,
      data: updatedExperience,
      message: `Experience ${action}ed successfully`
    });

  } catch (error) {
    console.error('Admin moderate experience error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to moderate experience',
      error: error.message
    });
    }
});

// @route   GET /api/admin/notifications/:userId
// @desc    Get all notifications for a user
// @access  Private (Admin)
router.get('/notifications/:userId', isAdminWithDualAuth, async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, unreadOnly = false } = req.query;

        const filter = { user: userId };
        if (unreadOnly === 'true') {
            filter.isRead = false;
        }

        const notifications = await Notification.find(filter)
            .populate('relatedExperience', 'title companyInfo')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Notification.countDocuments(filter);

        res.json({
            notifications,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalItems: total,
                itemsPerPage: parseInt(limit)
            }
        });
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Error fetching notifications' });
    }
});

// @route   PUT /api/admin/notifications/:notificationId/read
// @desc    Mark notification as read
// @access  Private (Admin)
router.put('/notifications/:notificationId/read', isAdminWithDualAuth, async (req, res) => {
    try {
        const { notificationId } = req.params;

        const notification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true, readAt: new Date() },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
});

module.exports = router;