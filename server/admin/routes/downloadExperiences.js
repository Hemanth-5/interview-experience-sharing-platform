const express = require('express');
const router = express.Router();
const { isAdminWithDualAuth } = require('../../middleware/auth');
const Experience = require('../../models/Experience');
const User = require('../../models/User');
const Company = require('../../models/Company');
const pdfService = require('../../services/pdfService');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');
const { body, query, validationResult } = require('express-validator');

// Ensure downloads directory exists
const DOWNLOADS_DIR = path.join(__dirname, '../../downloads');
if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
}

// Helper function to create a readable stream from buffer
function bufferToStream(buffer) {
  return Readable.from(buffer);
}

// @route   GET /api/admin/download/experiences
// @desc    Get experiences list for download with filters
// @access  Admin
router.get('/experiences', isAdminWithDualAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      company,
      role,
      finalResult,
      internshipType,
      location,
      startDate,
      endDate,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { isPublished: true };

    if (company) {
      filter['companyInfo.companyName'] = { $regex: company, $options: 'i' };
    }

    if (role) {
      filter['companyInfo.role'] = { $regex: role, $options: 'i' };
    }

    if (finalResult) {
      filter.finalResult = finalResult;
    }

    if (internshipType) {
      filter['companyInfo.internshipType'] = internshipType;
    }

    if (location) {
      filter['companyInfo.location'] = location;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    if (search) {
      filter.$or = [
        { 'companyInfo.companyName': { $regex: search, $options: 'i' } },
        { 'companyInfo.role': { $regex: search, $options: 'i' } },
        { keyTips: { $regex: search, $options: 'i' } },
        { overallExperience: { $regex: search, $options: 'i' } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Get experiences
    const experiences = await Experience.find(filter)
      .populate('userId', 'name email university graduationYear level avatar role')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .select('companyInfo rounds overallRating finalResult backgroundInfo createdAt overallExperience preparationTime wouldRecommend keyTips mistakesToAvoid resourcesUsed');

    const total = await Experience.countDocuments(filter);

    // Get unique filter options for dropdowns
    const filterOptions = await Experience.aggregate([
      { $match: { isPublished: true } },
      {
        $group: {
          _id: null,
          companies: { $addToSet: '$companyInfo.companyName' },
          roles: { $addToSet: '$companyInfo.role' },
          internshipTypes: { $addToSet: '$companyInfo.internshipType' },
          locations: { $addToSet: '$companyInfo.location' },
          finalResults: { $addToSet: '$finalResult' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        experiences,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalExperiences: total,
          hasNext: skip + experiences.length < total,
          hasPrev: parseInt(page) > 1
        },
        filterOptions: filterOptions[0] || {
          companies: [],
          roles: [],
          internshipTypes: [],
          locations: [],
          finalResults: []
        }
      }
    });

  } catch (error) {
    console.error('Error fetching experiences for download:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch experiences'
    });
  }
});

// @route   POST /api/admin/download/experiences/single
// @desc    Download single experience as PDF
// @access  Admin
router.post('/experiences/single', 
  isAdminWithDualAuth,
  [
    body('experienceId').isMongoId().withMessage('Valid experience ID required')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { experienceId } = req.body;

      // Get the experience
      const experience = await Experience.findById(experienceId)
        .populate('userId', 'name email university graduationYear level avatar role')
        .lean();

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: 'Experience not found'
        });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileName = `DLExp_${experience.companyInfo.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${experienceId}_${timestamp}.pdf`;

      // Generate PDF buffer instead of writing to disk
      const pdfBuffer = await pdfService.generateExperiencePdfBuffer(experience);

      // Set headers for download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

      // Stream the buffer directly
      const stream = bufferToStream(pdfBuffer);
      stream.pipe(res);

    } catch (error) {
      console.error('Error downloading single experience:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate PDF'
      });
    }
  }
);

// @route   POST /api/admin/download/experiences/bulk
// @desc    Download multiple experiences as ZIP
// @access  Admin
router.post('/experiences/bulk',
  isAdminWithDualAuth,
  [
    body('experienceIds').isArray({ min: 1 }).withMessage('At least one experience ID required'),
    body('experienceIds.*').isMongoId().withMessage('All experience IDs must be valid')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const { experienceIds } = req.body;

      if (experienceIds.length > 50) {
        return res.status(400).json({
          success: false,
          message: 'Maximum 50 experiences can be downloaded at once'
        });
      }

      // Get all experiences
      const experiences = await Experience.find({
        _id: { $in: experienceIds },
        isPublished: true
      })
      .populate('userId', 'name email university graduationYear level avatar role')
      .lean();

      if (experiences.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No valid experiences found'
        });
      }

      // Generate PDFs as buffers
      const generatedFiles = await pdfService.generateMultipleExperiencesPdfBuffers(experiences);

      if (generatedFiles.length === 0) {
        return res.status(500).json({
          success: false,
          message: 'Failed to generate any PDFs'
        });
      }

      // Create ZIP buffer
      const timestamp = Date.now();
      const zipFileName = `DLExp_Bulk_${timestamp}.zip`;
      const zipBuffer = await pdfService.createZipFromBuffers(generatedFiles);

      // Set headers for download
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

      // Stream the ZIP buffer
      const stream = bufferToStream(zipBuffer);
      stream.pipe(res);

    } catch (error) {
      console.error('Error downloading bulk experiences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate bulk download'
      });
    }
  }
);

// @route   POST /api/admin/download/experiences/filtered
// @desc    Download experiences based on filters
// @access  Admin
router.post('/experiences/filtered',
  isAdminWithDualAuth,
  [
    body('maxResults').optional().isInt({ min: 1, max: 100 }).withMessage('Max results must be between 1 and 100')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array()
        });
      }

      const {
        company,
        role,
        finalResult,
        internshipType,
        location,
        startDate,
        endDate,
        search,
        maxResults = 50
      } = req.body;

      // Build filter object
      const filter = { isPublished: true };

      if (company) {
        filter['companyInfo.companyName'] = { $regex: company, $options: 'i' };
      }

      if (role) {
        filter['companyInfo.role'] = { $regex: role, $options: 'i' };
      }

      if (finalResult) {
        filter.finalResult = finalResult;
      }

      if (internshipType) {
        filter['companyInfo.internshipType'] = internshipType;
      }

      if (location) {
        filter['companyInfo.location'] = location;
      }

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
      }

      if (search) {
        filter.$or = [
          { 'companyInfo.companyName': { $regex: search, $options: 'i' } },
          { 'companyInfo.role': { $regex: search, $options: 'i' } },
          { keyTips: { $regex: search, $options: 'i' } },
          { overallExperience: { $regex: search, $options: 'i' } }
        ];
      }

      // Get experiences
      const experiences = await Experience.find(filter)
        .populate('userId', 'name email university graduationYear level avatar role')
        .sort({ createdAt: -1 })
        .limit(parseInt(maxResults))
        .lean();

      if (experiences.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No experiences found matching the criteria'
        });
      }

      const timestamp = Date.now();

      // If only one experience, send PDF directly
      if (experiences.length === 1) {
        const experience = experiences[0];
        const fileName = `DLExp_${experience.companyInfo.companyName.replace(/[^a-zA-Z0-9]/g, '_')}_${experience._id}_${timestamp}.pdf`;
        
        const pdfBuffer = await pdfService.generateExperiencePdfBuffer(experience);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        const stream = bufferToStream(pdfBuffer);
        stream.pipe(res);
      } else {
        // Generate multiple PDFs as buffers and create ZIP
        const generatedFiles = await pdfService.generateMultipleExperiencesPdfBuffers(experiences);

        if (generatedFiles.length === 0) {
          return res.status(500).json({
            success: false,
            message: 'Failed to generate any PDFs'
          });
        }

        // Create ZIP buffer
        const zipFileName = `DLExp_Filtered_${timestamp}.zip`;
        const zipBuffer = await pdfService.createZipFromBuffers(generatedFiles);

        res.setHeader('Content-Type', 'application/zip');
        res.setHeader('Content-Disposition', `attachment; filename="${zipFileName}"`);

        const stream = bufferToStream(zipBuffer);
        stream.pipe(res);
      }

    } catch (error) {
      console.error('Error downloading filtered experiences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to generate filtered download'
      });
    }
  }
);

// @route   GET /api/admin/download/stats
// @desc    Get download statistics
// @access  Admin
router.get('/stats', isAdminWithDualAuth, async (req, res) => {
  try {
    const totalExperiences = await Experience.countDocuments({ isPublished: true });
    
    const experiencesByCompany = await Experience.aggregate([
      { $match: { isPublished: true } },
      { 
        $group: { 
          _id: '$companyInfo.companyName', 
          count: { $sum: 1 },
          averageRating: { $avg: '$overallRating' }
        } 
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    const experiencesByResult = await Experience.aggregate([
      { $match: { isPublished: true } },
      { 
        $group: { 
          _id: '$finalResult', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    const experiencesByType = await Experience.aggregate([
      { $match: { isPublished: true } },
      { 
        $group: { 
          _id: '$companyInfo.internshipType', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    const recentExperiences = await Experience.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('userId', 'name')
      .select('companyInfo.companyName companyInfo.role finalResult createdAt');

    res.json({
      success: true,
      data: {
        totalExperiences,
        experiencesByCompany,
        experiencesByResult,
        experiencesByType,
        recentExperiences
      }
    });

  } catch (error) {
    console.error('Error fetching download stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

module.exports = router;
