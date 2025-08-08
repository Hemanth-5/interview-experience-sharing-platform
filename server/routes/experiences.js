const express = require('express');
const { body, query, param } = require('express-validator');
const Experience = require('../models/Experience');
const Company = require('../models/Company');
const Comment = require('../models/Comment');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { isAuthenticated, isOwnerOrAdmin } = require('../middleware/auth');
const handleValidationErrors = require('../middleware/validation');
const router = express.Router();

// Validation rules for creating experiences
const experienceValidation = [
  body('companyInfo.companyName').trim().notEmpty().withMessage('Company name is required'),
  body('companyInfo.role').trim().notEmpty().withMessage('Role is required'),
  body('companyInfo.department').trim().notEmpty().withMessage('Department is required'),
  body('companyInfo.internshipType').isIn(['Summer', 'Winter', 'Full-time', 'Part-time', 'PPO', 'Contract']).withMessage('Invalid internship type'),
  body('companyInfo.duration').trim().notEmpty().withMessage('Duration is required'),
  body('companyInfo.location').isIn(['Remote', 'On-site', 'Hybrid']).withMessage('Invalid location type'),
  body('companyInfo.applicationDate').isISO8601().withMessage('Invalid application date'),
  body('rounds').isArray({ min: 1 }).withMessage('At least one round is required'),
  body('rounds.*.roundType').isIn(['Online Assessment', 'Technical', 'HR', 'Group Discussion', 'Presentation', 'Case Study', 'Coding Round', 'System Design']).withMessage('Invalid round type'),
  body('rounds.*.duration').isInt({ min: 1 }).withMessage('Round duration must be at least 1 minute'),
  body('rounds.*.roundResult').isIn(['Selected', 'Rejected', 'Pending', 'Waitlisted']).withMessage('Invalid round result'),
  body('rounds.*.overallExperience').isInt({ min: 1, max: 5 }).withMessage('Overall experience must be between 1 and 5'),
  body('overallRating').isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('overallExperience').optional().isString().withMessage('Overall experience summary must be a string'),
  body('finalResult').isIn(['Selected', 'Rejected', 'Withdrawn', 'Pending']).withMessage('Invalid final result'),
  body('wouldRecommend').isBoolean().withMessage('Would recommend must be a boolean'),
  body('preparationTime').isInt({ min: 0 }).withMessage('Preparation time must be non-negative'),
  body('keyTips').trim().notEmpty().withMessage('Key tips are required'),
  body('mistakesToAvoid').trim().notEmpty().withMessage('Mistakes to avoid are required'),
  body('backgroundInfo.yearOfStudy').isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Postgraduate']).withMessage('Invalid year of study')
];

// Validation rules for updating experiences (more flexible)
const experienceUpdateValidation = [
  body('companyInfo.companyName').optional().trim().notEmpty().withMessage('Company name cannot be empty'),
  body('companyInfo.role').optional().trim().notEmpty().withMessage('Role cannot be empty'),
  body('companyInfo.department').optional().trim().notEmpty().withMessage('Department cannot be empty'),
  body('companyInfo.internshipType').optional().isIn(['Summer', 'Winter', 'Full-time', 'Part-time', 'PPO', 'Contract']).withMessage('Invalid internship type'),
  body('companyInfo.duration').optional().trim().notEmpty().withMessage('Duration cannot be empty'),
  body('companyInfo.location').optional().isIn(['Remote', 'On-site', 'Hybrid']).withMessage('Invalid location type'),
  body('companyInfo.applicationDate').optional().isISO8601().withMessage('Invalid application date'),
  body('rounds').optional().isArray({ min: 1 }).withMessage('At least one round is required'),
  body('rounds.*.roundType').optional().isIn(['Online Assessment', 'Technical', 'HR', 'Group Discussion', 'Presentation', 'Case Study', 'Coding Round', 'System Design']).withMessage('Invalid round type'),
  body('rounds.*.duration').optional().isInt({ min: 1 }).withMessage('Round duration must be at least 1 minute'),
  body('rounds.*.roundResult').optional().isIn(['Selected', 'Rejected', 'Pending', 'Waitlisted']).withMessage('Invalid round result'),
  body('rounds.*.overallExperience').optional().isInt({ min: 1, max: 5 }).withMessage('Overall experience must be between 1 and 5'),
  body('overallRating').optional().isInt({ min: 1, max: 5 }).withMessage('Overall rating must be between 1 and 5'),
  body('overallExperience').optional().isString().withMessage('Overall experience summary must be a string'),
  body('finalResult').optional().isIn(['Selected', 'Rejected', 'Withdrawn', 'Pending']).withMessage('Invalid final result'),
  body('wouldRecommend').optional().isBoolean().withMessage('Would recommend must be a boolean'),
  body('preparationTime').optional().isInt({ min: 0 }).withMessage('Preparation time must be non-negative'),
  body('keyTips').optional().trim().notEmpty().withMessage('Key tips cannot be empty'),
  body('mistakesToAvoid').optional().trim().notEmpty().withMessage('Mistakes to avoid cannot be empty'),
  body('backgroundInfo.yearOfStudy').optional().isIn(['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Postgraduate']).withMessage('Invalid year of study')
];

// @route   POST /api/experiences
// @desc    Create new experience
// @access  Private
router.post('/', 
  isAuthenticated,
  experienceValidation,
  handleValidationErrors,
  async (req, res) => {
    try {
      const experienceData = {
        ...req.body,
        userId: req.user._id
      };

      // Handle company association
      if (experienceData.companyInfo.companyName) {
        try {
          const company = await Company.findOrCreate(experienceData.companyInfo.companyName);
          experienceData.companyInfo.companyId = company._id;
          // Automatically populate company logo and display name
          experienceData.companyInfo.companyLogo = company.logo;
          experienceData.companyInfo.companyName = company.displayName;
          console.log(`🏢 Associated experience with company: ${company.displayName} (${company.logo ? 'with logo' : 'no logo'})`);
        } catch (error) {
          console.warn('Error creating/finding company:', error);
          // Continue without company association if it fails
        }
      }

      // Generate tags for better searchability
      const tags = [
        experienceData.companyInfo.companyName.toLowerCase(),
        experienceData.companyInfo.role.toLowerCase(),
        experienceData.companyInfo.department.toLowerCase(),
        experienceData.companyInfo.internshipType.toLowerCase(),
        ...experienceData.backgroundInfo.skills.map(skill => skill.toLowerCase())
      ];
      experienceData.tags = [...new Set(tags)]; // Remove duplicates

      const experience = new Experience(experienceData);
      await experience.save();

      // Update company's associated experiences
      if (experienceData.companyInfo.companyId) {
        try {
          await Company.findByIdAndUpdate(
            experienceData.companyInfo.companyId,
            { $addToSet: { associatedExperiences: experience._id } }
          );
        } catch (error) {
          console.warn('Error updating company experiences:', error);
        }
      }

      // Update user stats
      await req.user.updateStats('experiencesShared');

      // Populate user info for response
      await experience.populate('userId', 'name avatar university');

      // Emit real-time event
      req.io.emit('new-experience', {
        experienceId: experience._id,
        companyName: experience.companyInfo.companyName,
        role: experience.companyInfo.role,
        author: experience.isAnonymous ? 'Anonymous' : experience.userId.name
      });

      res.status(201).json({
        success: true,
        message: 'Experience created successfully',
        data: experience
      });
    } catch (error) {
      // console.error('Error creating experience:', error);
      res.status(500).json({
        success: false,
        message: 'Error creating experience',
        error: error.message
      });
    }
  }
);

// @route   GET /api/experiences/featured
// @desc    Get featured experiences (high-rated, recent)
// @access  Public
router.get('/featured',
  [
    query('limit').optional().isInt({ min: 1, max: 10 }).withMessage('Limit must be between 1 and 10')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 3;
      
      const featuredExperiences = await Experience.find({ 
        isPublished: true,
        overallRating: { $gte: 4 } // Only high-rated experiences
      })
      .populate('userId', 'name profilePicture')
      .sort({ overallRating: -1, createdAt: -1 })
      .limit(limit);

      res.json({
        success: true,
        data: featuredExperiences
      });
    } catch (error) {
      // console.error('Error fetching featured experiences:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching featured experiences',
        error: error.message
      });
    }
  }
);

// @route   GET /api/experiences
// @desc    Get experiences with filters and pagination
// @access  Public
router.get('/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
    query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    query('sortBy').optional().isIn(['recent', 'popular', 'rating', 'views']).withMessage('Invalid sort option')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        page = 1,
        limit = 10,
        company,
        role,
        internshipType,
        location,
        rating,
        sortBy = 'recent',
        search,
        finalResult,
        yearOfStudy
      } = req.query;

      // Build filter object - show published experiences, including flagged ones
      const filter = { 
        isPublished: true
        // Note: We intentionally don't filter out flagged content
        // Flagged content should be visible but marked as such in the frontend
      };

      if (company) {
        filter['companyInfo.companyName'] = new RegExp(company, 'i');
      }

      if (role) {
        filter['companyInfo.role'] = new RegExp(role, 'i');
      }

      if (internshipType) {
        filter['companyInfo.internshipType'] = internshipType;
      }

      if (location) {
        filter['companyInfo.location'] = location;
      }

      if (rating) {
        filter.overallRating = { $gte: parseInt(rating) };
      }

      if (finalResult) {
        filter.finalResult = finalResult;
      }

      if (yearOfStudy) {
        filter['backgroundInfo.yearOfStudy'] = yearOfStudy;
      }

      if (search) {
        filter.$or = [
          { 'companyInfo.companyName': new RegExp(search, 'i') },
          { 'companyInfo.role': new RegExp(search, 'i') },
          { keyTips: new RegExp(search, 'i') },
          { tags: { $in: [new RegExp(search, 'i')] } }
        ];
      }

      // Build sort object
      let sort = {};
      switch (sortBy) {
        case 'popular':
          sort = { 'upvotes': -1, views: -1 };
          break;
        case 'rating':
          sort = { overallRating: -1, createdAt: -1 };
          break;
        case 'views':
          sort = { views: -1, createdAt: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      // Execute query
      const [experiences, total] = await Promise.all([
        Experience.find(filter)
          .populate('userId', 'name avatar university')
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit)),
        Experience.countDocuments(filter)
      ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / parseInt(limit));
      const hasNextPage = parseInt(page) < totalPages;
      const hasPrevPage = parseInt(page) > 1;

      res.json({
        success: true,
        data: experiences,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalDocuments: total,
          hasNextPage,
          hasPrevPage,
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      // console.error('Error fetching experiences:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching experiences',
        error: error.message
      });
    }
  }
);

// @route   GET /api/experiences/:id
// @desc    Get single experience by ID
// @access  Public
router.get('/:id',
  [
    param('id').isMongoId().withMessage('Invalid experience ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const experience = await Experience.findById(req.params.id)
        .populate('userId', 'name avatar university role')
        .populate({
          path: 'comments',
          populate: {
            path: 'userId',
            select: 'name avatar'
          }
        });

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience not found'
        });
      }

      // Increment view count if user is authenticated and not the owner
      if (req.isAuthenticated() && experience.userId._id.toString() !== req.user._id.toString()) {
        await experience.addUniqueView(req.user._id);
      } else if (!req.isAuthenticated()) {
        await experience.incrementViews();
      }

      res.json({
        success: true,
        data: experience
      });
    } catch (error) {
      // console.error('Error fetching experience:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching experience',
        error: error.message
      });
    }
  }
);

// @route   PUT /api/experiences/:id
// @desc    Update experience
// @access  Private (Owner or Admin)
router.put('/:id',
  isAuthenticated,
  isOwnerOrAdmin,
  [
    param('id').isMongoId().withMessage('Invalid experience ID'),
    ...experienceUpdateValidation
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      // console.log('PUT /api/experiences/:id - Update request body:', JSON.stringify(req.body, null, 2));
      
      const experience = await Experience.findById(req.params.id);

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience not found'
        });
      }

      // Handle company association for updates
      let oldCompanyId = null;
      let newCompanyId = null;
      
      if (req.body.companyInfo && req.body.companyInfo.companyName) {
        try {
          // Store the old company ID for cleanup
          oldCompanyId = experience.companyInfo?.companyId;
          
          const company = await Company.findOrCreate(req.body.companyInfo.companyName);
          newCompanyId = company._id;
          req.body.companyInfo.companyId = company._id;
          // Automatically populate company logo and display name
          req.body.companyInfo.companyLogo = company.logo;
          req.body.companyInfo.companyName = company.displayName;
          console.log(`🏢 Updated experience with company: ${company.displayName} (${company.logo ? 'with logo' : 'no logo'})`);
        } catch (error) {
          console.warn('Error creating/finding company during update:', error);
          // Continue without company association if it fails
        }
      }

      // Update tags only if relevant fields are provided
      if (req.body.companyInfo || req.body.backgroundInfo) {
        const companyInfo = req.body.companyInfo || experience.companyInfo;
        const backgroundInfo = req.body.backgroundInfo || experience.backgroundInfo;
        
        const tags = [
          companyInfo.companyName?.toLowerCase(),
          companyInfo.role?.toLowerCase(),
          companyInfo.department?.toLowerCase(),
          companyInfo.internshipType?.toLowerCase(),
          ...(backgroundInfo.skills || []).map(skill => skill.toLowerCase())
        ].filter(Boolean); // Remove undefined/null values
        
        req.body.tags = [...new Set(tags)];
      }

      const updatedExperience = await Experience.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      ).populate('userId', 'name avatar university');

      // Clean up company associations after successful update
      if (oldCompanyId && newCompanyId && oldCompanyId.toString() !== newCompanyId.toString()) {
        try {
          // Remove experience from old company's associatedExperiences
          await Company.findByIdAndUpdate(
            oldCompanyId,
            { $pull: { associatedExperiences: req.params.id } }
          );
          console.log(`🧹 Removed experience ${req.params.id} from old company ${oldCompanyId}`);
          
          // Add experience to new company's associatedExperiences
          await Company.findByIdAndUpdate(
            newCompanyId,
            { $addToSet: { associatedExperiences: req.params.id } }
          );
          console.log(`🔗 Added experience ${req.params.id} to new company ${newCompanyId}`);
        } catch (error) {
          console.warn('Error updating company associations:', error);
        }
      } else if (newCompanyId && !oldCompanyId) {
        // New company association (no old company to clean up)
        try {
          await Company.findByIdAndUpdate(
            newCompanyId,
            { $addToSet: { associatedExperiences: req.params.id } }
          );
          console.log(`🔗 Added experience ${req.params.id} to company ${newCompanyId}`);
        } catch (error) {
          console.warn('Error adding company association:', error);
        }
      }

      res.json({
        success: true,
        message: 'Experience updated successfully',
        data: updatedExperience
      });
    } catch (error) {
      // console.error('Error updating experience:', error);
      res.status(500).json({
        success: false,
        message: 'Error updating experience',
        error: error.message
      });
    }
  }
);

// @route   DELETE /api/experiences/:id
// @desc    Delete experience
// @access  Private (Owner or Admin)
router.delete('/:id',
  isAuthenticated,
  isOwnerOrAdmin,
  [
    param('id').isMongoId().withMessage('Invalid experience ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const experience = await Experience.findById(req.params.id);

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience not found'
        });
      }

      // Delete associated comments
      await Comment.deleteMany({ experienceId: req.params.id });

      // Delete the experience
      await Experience.findByIdAndDelete(req.params.id);

      // Update user stats
      await req.user.updateStats('experiencesShared', -1);

      res.json({
        success: true,
        message: 'Experience deleted successfully'
      });
    } catch (error) {
      // console.error('Error deleting experience:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting experience',
        error: error.message
      });
    }
  }
);

// @route   POST /api/experiences/:id/vote
// @desc    Vote on experience
// @access  Private
router.post('/:id/vote',
  isAuthenticated,
  [
    param('id').isMongoId().withMessage('Invalid experience ID'),
    body('voteType').isIn(['upvote', 'downvote']).withMessage('Vote type must be upvote or downvote')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { voteType } = req.body;
      const experience = await Experience.findById(req.params.id);

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience not found'
        });
      }

      // Users cannot vote on their own experiences
      if (experience.userId.toString() === req.user._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'You cannot vote on your own experience'
        });
      }

      await experience.toggleVote(req.user._id, voteType);

      // Emit real-time vote update
      req.io.to(`experience-${req.params.id}`).emit('vote-update', {
        experienceId: req.params.id,
        upvotes: experience.upvoteCount,
        downvotes: experience.downvoteCount,
        netScore: experience.netScore
      });

      res.json({
        success: true,
        message: 'Vote recorded successfully',
        data: {
          upvotes: experience.upvoteCount,
          downvotes: experience.downvoteCount,
          netScore: experience.netScore
        }
      });
    } catch (error) {
      // console.error('Error voting on experience:', error);
      res.status(500).json({
        success: false,
        message: 'Error voting on experience',
        error: error.message
      });
    }
  }
);

// @route   POST /api/experiences/:id/bookmark
// @desc    Bookmark/unbookmark experience
// @access  Private
router.post('/:id/bookmark',
  isAuthenticated,
  [
    param('id').isMongoId().withMessage('Invalid experience ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const experience = await Experience.findById(req.params.id);

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience not found'
        });
      }

      const user = await User.findById(req.user._id);
      const bookmarkIndex = user.bookmarks.indexOf(req.params.id);

      let message;
      if (bookmarkIndex > -1) {
        // Remove bookmark
        user.bookmarks.splice(bookmarkIndex, 1);
        message = 'Bookmark removed';
      } else {
        // Add bookmark
        user.bookmarks.push(req.params.id);
        message = 'Experience bookmarked';
      }

      await user.save();

      res.json({
        success: true,
        message,
        isBookmarked: bookmarkIndex === -1
      });
    } catch (error) {
      // console.error('Error bookmarking experience:', error);
      res.status(500).json({
        success: false,
        message: 'Error bookmarking experience',
        error: error.message
      });
    }
  }
);

// @route   GET /api/experiences/:id/bookmark
// @desc    Check if experience is bookmarked
// @access  Private
router.get('/:id/bookmark',
  isAuthenticated,
  [
    param('id').isMongoId().withMessage('Invalid experience ID')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const isBookmarked = user.bookmarks.includes(req.params.id);

      res.json({
        success: true,
        isBookmarked
      });
    } catch (error) {
      // console.error('Error checking bookmark status:', error);
      res.status(500).json({
        success: false,
        message: 'Error checking bookmark status',
        error: error.message
      });
    }
  }
);

// @route   POST /api/experiences/:id/report
// @desc    Report an experience for inappropriate content
// @access  Private
router.post(
  '/:id/report',
  isAuthenticated,
  [
    body('reason')
      .notEmpty()
      .withMessage('Report reason is required')
      .isIn([
        'inappropriate_content',
        'fake_information', 
        'spam',
        'offensive_language',
        'copyright_violation',
        'personal_attacks',
        'off_topic',
        'duplicate_content',
        'other'
      ])
      .withMessage('Invalid report reason'),
    body('details')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Details must be 500 characters or less')
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { reason, details } = req.body;
      const experienceId = req.params.id;
      const reporterId = req.user._id;

      // Check if experience exists
      const experience = await Experience.findById(experienceId);
      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience not found'
        });
      }

      // Check if user already reported this experience
      const existingReport = experience.reports.find(
        report => report.reportedBy.toString() === reporterId.toString()
      );

      if (existingReport) {
        return res.status(400).json({
          success: false,
          message: 'You have already reported this experience'
        });
      }

      // Add report to experience
      experience.reports.push({
        reportedBy: reporterId,
        reason,
        details,
        reportedAt: new Date()
      });

      // Check if we should auto-flag based on report threshold
      const reportThreshold = experience.autoFlagThreshold || 5;
      if (experience.reports.length >= reportThreshold && !experience.flagged) {
        experience.flagged = true;
        experience.flaggedBy = 'system';
        experience.flagReason = 'Multiple reports received';
        experience.flaggedAt = new Date();

        // Create notification for experience owner
        await Notification.create({
          user: experience.userId,
          type: 'experience_flagged',
          message: 'Your experience has been flagged due to multiple reports',
          reason: 'Multiple reports received',
          details: `Your experience has been automatically flagged after receiving ${experience.reports.length} reports.`,
          relatedExperience: experienceId
        });
      }

      await experience.save();

      res.json({
        success: true,
        message: 'Experience reported successfully',
        data: {
          reportCount: experience.reports.length,
          autoFlagged: experience.flagged
        }
      });

    } catch (error) {
      console.error('Error reporting experience:', error);
      res.status(500).json({
        success: false,
        message: 'Error reporting experience',
        error: error.message
      });
    }
  }
);

module.exports = router;
