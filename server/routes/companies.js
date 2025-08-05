const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const { isAuthenticated } = require('../middleware/auth');

// @route   GET /api/companies/search
// @desc    Search for companies
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    const searchTerm = query.trim();
    
    // Search for existing companies
    const companies = await Company.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { displayName: { $regex: searchTerm, $options: 'i' } },
        { aliases: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .select('name displayName logo industry isVerified')
    .limit(10)
    .sort({ isVerified: -1, displayName: 1 });
    
    res.json({ success: true, data: companies });
  } catch (error) {
    console.error('Error searching companies:', error);
    res.status(500).json({ success: false, message: 'Error searching companies' });
  }
});

// @route   POST /api/companies/find-or-create
// @desc    Find existing company or create new one
// @access  Private
router.post('/find-or-create', isAuthenticated, async (req, res) => {
  try {
    const { companyName } = req.body;
    
    if (!companyName || companyName.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company name is required and must be at least 2 characters' 
      });
    }
    
    const company = await Company.findOrCreate(companyName.trim());
    
    res.json({ 
      success: true, 
      data: company,
      isNewCompany: company.createdAt && (Date.now() - company.createdAt.getTime()) < 5000
    });
  } catch (error) {
    console.error('Error finding/creating company:', error);
    res.status(500).json({ success: false, message: 'Error processing company' });
  }
});

// @route   GET /api/companies/:id
// @desc    Get company by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('associatedExperiences', 'companyInfo.role finalResult overallRating createdAt');
    
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    res.json({ success: true, data: company });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({ success: false, message: 'Error fetching company' });
  }
});

// @route   POST /api/companies/:id/linkedin-data
// @desc    Fetch and update company LinkedIn data
// @access  Private
router.post('/:id/linkedin-data', isAuthenticated, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id);
    
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    
    // TODO: Implement LinkedIn API integration
    // For now, return placeholder response
    const linkedinData = {
      description: `${company.displayName} is a leading technology company.`,
      headquarters: 'Unknown',
      employeeCount: 'Unknown',
      founded: 'Unknown',
      lastUpdated: new Date()
    };
    
    company.linkedinData = linkedinData;
    await company.save();
    
    res.json({ 
      success: true, 
      data: company,
      message: 'LinkedIn data updated successfully'
    });
  } catch (error) {
    console.error('Error updating LinkedIn data:', error);
    res.status(500).json({ success: false, message: 'Error updating LinkedIn data' });
  }
});

module.exports = router;
