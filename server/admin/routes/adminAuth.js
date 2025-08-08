const express = require('express');
const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const AdminAuth = require('../models/AdminAuth');
const User = require('../../models/User');
const { isAdmin } = require('../../middleware/auth');
const logger = require('../../utils/logger');

const router = express.Router();

// Rate limiting for admin login attempts
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    error: 'Too many admin login attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Input validation rules
const adminLoginValidation = [
  body('adminUsername')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters'),
  body('adminPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
];

const adminCreateValidation = [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID required'),
  body('adminUsername')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('adminPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
];

// @route   POST /api/admin/auth/login
// @desc    Admin dual authentication login
// @access  Public (but requires user to be already logged in and have Admin role)
router.post('/login', adminLoginLimiter, adminLoginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { adminUsername, adminPassword } = req.body;

    // Check if user is authenticated and has admin role
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'User authentication required first'
      });
    }

    const token = authHeader.split(' ')[1];
    let userId;
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      userId = decoded.userId;
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Invalid user token'
      });
    }

    // Verify user exists and has admin role
    const user = await User.findById(userId);
    if (!user || user.role !== 'Admin') {
      logger.warn(`Admin login attempt by non-admin user: ${userId}`, {
        userId,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Find admin auth record
    const adminAuth = await AdminAuth.findOne({ 
      userId,
      adminUsername,
      isActive: true 
    });

    if (!adminAuth) {
      logger.warn(`Admin login attempt with invalid credentials`, {
        adminUsername,
        userId,
        ip: req.ip
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Check if account is locked
    if (adminAuth.isLocked) {
      return res.status(423).json({
        success: false,
        message: 'Admin account temporarily locked due to too many failed attempts'
      });
    }

    // Verify admin password
    const isValidPassword = await adminAuth.comparePassword(adminPassword);
    
    if (!isValidPassword) {
      await adminAuth.incLoginAttempts();
      
      logger.warn(`Failed admin login attempt`, {
        adminUsername,
        userId,
        attempts: adminAuth.loginAttempts + 1,
        ip: req.ip
      });
      
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Reset login attempts on successful login
    await adminAuth.resetLoginAttempts();

    // Generate admin session token
    const adminToken = jwt.sign(
      { 
        userId,
        adminId: adminAuth._id,
        adminUsername: adminAuth.adminUsername,
        type: 'admin'
      },
      process.env.JWT_SECRET,
      { expiresIn: '4h' } // Shorter expiry for admin sessions
    );

    logger.info(`Successful admin login`, {
      adminUsername,
      userId,
      ip: req.ip
    });

    res.json({
      success: true,
      message: 'Admin authentication successful',
      adminToken,
      adminUser: {
        adminId: adminAuth._id,
        adminUsername: adminAuth.adminUsername,
        userId: adminAuth.userId,
        lastLogin: adminAuth.lastLogin
      }
    });

  } catch (error) {
    logger.error('Admin login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin login'
    });
  }
});

// @route   POST /api/admin/auth/create
// @desc    Create new admin authentication record (Super Admin only)
// @access  Private (Admin with super admin privileges)
router.post('/create', isAdmin, adminCreateValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, adminUsername, adminPassword } = req.body;

    // Verify target user exists and has admin role
    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.role !== 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'User must have Admin role'
      });
    }

    // Check if admin auth already exists for this user
    const existingAuth = await AdminAuth.findOne({ userId });
    if (existingAuth) {
      return res.status(400).json({
        success: false,
        message: 'Admin authentication already exists for this user'
      });
    }

    // Check if username is already taken
    const existingUsername = await AdminAuth.findOne({ adminUsername });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Admin username already taken'
      });
    }

    // Create new admin auth record
    const adminAuth = new AdminAuth({
      userId,
      adminUsername,
      adminPassword,
      createdBy: req.user.userId
    });

    await adminAuth.save();

    logger.info(`New admin auth created`, {
      createdFor: userId,
      adminUsername,
      createdBy: req.user.userId
    });

    res.status(201).json({
      success: true,
      message: 'Admin authentication created successfully',
      adminAuth: {
        adminId: adminAuth._id,
        userId: adminAuth.userId,
        adminUsername: adminAuth.adminUsername,
        isActive: adminAuth.isActive
      }
    });

  } catch (error) {
    logger.error('Admin creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin creation'
    });
  }
});

// @route   POST /api/admin/auth/logout
// @desc    Admin logout (invalidate admin session)
// @access  Private (Admin)
router.post('/logout', async (req, res) => {
  try {
    // In a more complex setup, you might maintain a blacklist of tokens
    // For now, we'll just return success as JWT tokens are stateless
    
    logger.info('Admin logout', {
      adminId: req.admin?.adminId,
      userId: req.admin?.userId
    });

    res.json({
      success: true,
      message: 'Admin logout successful'
    });

  } catch (error) {
    logger.error('Admin logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin logout'
    });
  }
});

// @route   GET /api/admin/auth/verify
// @desc    Verify admin token and return admin info
// @access  Private (Admin)
router.get('/verify', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Admin token required'
      });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      if (decoded.type !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Invalid admin token'
        });
      }

      // Verify admin auth still exists and is active
      const adminAuth = await AdminAuth.findById(decoded.adminId);
      if (!adminAuth || !adminAuth.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Admin access revoked'
        });
      }

      res.json({
        success: true,
        adminUser: {
          adminId: adminAuth._id,
          adminUsername: adminAuth.adminUsername,
          userId: adminAuth.userId,
          lastLogin: adminAuth.lastLogin
        }
      });

    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired admin token'
      });
    }

  } catch (error) {
    logger.error('Admin verify error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during admin verification'
    });
  }
});

// @route   POST /api/admin/auth/bootstrap
// @desc    Create first admin account (no authentication required)
// @access  Public (only works if no admin exists)
router.post('/bootstrap', [
  body('userId')
    .isMongoId()
    .withMessage('Valid user ID required'),
  body('adminUsername')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('adminPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character')
], async (req, res) => {
  try {
    // Check if any admin auth records exist
    const existingAdminCount = await AdminAuth.countDocuments();
    if (existingAdminCount > 0) {
      return res.status(403).json({
        success: false,
        message: 'Admin accounts already exist. Use the regular create endpoint.'
      });
    }

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { userId, adminUsername, adminPassword } = req.body;

    // Verify target user exists and has admin role
    const targetUser = await User.findById(userId);
    if (!targetUser || targetUser.role !== 'Admin') {
      return res.status(400).json({
        success: false,
        message: 'User must exist and have Admin role'
      });
    }

    // Check if username is already taken (shouldn't happen since no admins exist, but good practice)
    const existingUsername = await AdminAuth.findOne({ adminUsername });
    if (existingUsername) {
      return res.status(400).json({
        success: false,
        message: 'Admin username already taken'
      });
    }

    // Create first admin auth record
    const adminAuth = new AdminAuth({
      userId,
      adminUsername,
      adminPassword,
      createdBy: userId // Self-created for bootstrap
    });

    await adminAuth.save();

    logger.info(`Bootstrap admin auth created`, {
      createdFor: userId,
      adminUsername,
      userEmail: targetUser.email,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Bootstrap admin authentication created successfully',
      data: {
        adminUsername,
        userId,
        userEmail: targetUser.email
      }
    });

  } catch (error) {
    logger.error('Bootstrap admin creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during bootstrap admin creation'
    });
  }
});

module.exports = router;
