const express = require('express');
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { isAuthenticated } = require('../middleware/auth');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const router = express.Router();

// Configure Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'interview-experiences',
    allowed_formats: ['jpg', 'jpeg', 'png', 'pdf', 'docx', 'txt'],
    resource_type: 'auto',
  },
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} is not allowed`), false);
    }
  }
});

// @route   POST /api/upload/single
// @desc    Upload single file
// @access  Private
router.post('/single', 
  isAuthenticated,
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileInfo = {
        fileName: req.file.originalname,
        fileUrl: req.file.path,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        cloudinaryId: req.file.filename
      };

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: fileInfo
      });
    } catch (error) {
      // console.error('Error uploading file:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading file',
        error: error.message
      });
    }
  }
);

// @route   POST /api/upload/multiple
// @desc    Upload multiple files
// @access  Private
router.post('/multiple',
  isAuthenticated,
  upload.array('files', 5),
  async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const filesInfo = req.files.map(file => ({
        fileName: file.originalname,
        fileUrl: file.path,
        fileType: file.mimetype,
        fileSize: file.size,
        cloudinaryId: file.filename
      }));

      res.json({
        success: true,
        message: `${req.files.length} files uploaded successfully`,
        data: filesInfo
      });
    } catch (error) {
      // console.error('Error uploading files:', error);
      res.status(500).json({
        success: false,
        message: 'Error uploading files',
        error: error.message
      });
    }
  }
);

// @route   POST /api/upload/extract-text
// @desc    Extract text from uploaded document
// @access  Private
router.post('/extract-text',
  isAuthenticated,
  async (req, res) => {
    try {
      const { fileUrl, fileType } = req.body;

      if (!fileUrl) {
        return res.status(400).json({
          success: false,
          message: 'File URL is required'
        });
      }

      let extractedText = '';

      try {
        // Fetch file from Cloudinary
        const response = await fetch(fileUrl);
        const buffer = await response.arrayBuffer();

        if (fileType === 'application/pdf') {
          // Extract text from PDF
          const data = await pdfParse(Buffer.from(buffer));
          extractedText = data.text;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Extract text from DOCX
          const result = await mammoth.extractRawText({ buffer: Buffer.from(buffer) });
          extractedText = result.value;
        } else if (fileType === 'text/plain') {
          // Handle plain text files
          extractedText = Buffer.from(buffer).toString('utf-8');
        } else {
          return res.status(400).json({
            success: false,
            message: 'Text extraction not supported for this file type'
          });
        }

        res.json({
          success: true,
          message: 'Text extracted successfully',
          data: {
            extractedText: extractedText.trim(),
            wordCount: extractedText.trim().split(/\s+/).length
          }
        });
      } catch (extractError) {
        // console.error('Error extracting text:', extractError);
        res.status(400).json({
          success: false,
          message: 'Error extracting text from file',
          error: extractError.message
        });
      }
    } catch (error) {
      // console.error('Error in text extraction:', error);
      res.status(500).json({
        success: false,
        message: 'Server error during text extraction',
        error: error.message
      });
    }
  }
);

// @route   DELETE /api/upload/:cloudinaryId
// @desc    Delete uploaded file
// @access  Private
router.delete('/:cloudinaryId',
  isAuthenticated,
  async (req, res) => {
    try {
      const { cloudinaryId } = req.params;

      // Delete file from Cloudinary
      const result = await cloudinary.uploader.destroy(cloudinaryId);

      if (result.result === 'ok') {
        res.json({
          success: true,
          message: 'File deleted successfully'
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'File not found or already deleted'
        });
      }
    } catch (error) {
      // console.error('Error deleting file:', error);
      res.status(500).json({
        success: false,
        message: 'Error deleting file',
        error: error.message
      });
    }
  }
);

// @route   GET /api/upload/signed-url
// @desc    Get signed URL for direct upload to Cloudinary
// @access  Private
router.get('/signed-url',
  isAuthenticated,
  async (req, res) => {
    try {
      const timestamp = Math.round((new Date()).getTime() / 1000);
      
      const signature = cloudinary.utils.api_sign_request(
        {
          timestamp: timestamp,
          folder: 'interview-experiences'
        },
        process.env.CLOUDINARY_API_SECRET
      );

      res.json({
        success: true,
        data: {
          signature,
          timestamp,
          cloudName: process.env.CLOUDINARY_CLOUD_NAME,
          apiKey: process.env.CLOUDINARY_API_KEY,
          folder: 'interview-experiences'
        }
      });
    } catch (error) {
      // console.error('Error generating signed URL:', error);
      res.status(500).json({
        success: false,
        message: 'Error generating signed URL',
        error: error.message
      });
    }
  }
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum 5 files allowed.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  
  res.status(400).json({
    success: false,
    message: error.message || 'File upload error'
  });
});

module.exports = router;
