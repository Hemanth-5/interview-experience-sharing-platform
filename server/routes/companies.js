const express = require('express');
const router = express.Router();
const Company = require('../models/Company');
const Experience = require('../models/Experience');
const { isAuthenticated } = require('../middleware/auth');
const companyService = require('../services/companyService');

// @route   GET /api/companies/search
// @desc    Search for companies (includes application database data)
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const { query, includeAppData = 'true' } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }
    
    const searchTerm = query.trim();
    
    // Search for existing companies in our database
    const existingCompanies = await Company.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { displayName: { $regex: searchTerm, $options: 'i' } },
        { aliases: { $regex: searchTerm, $options: 'i' } }
      ]
    })
    .select('name displayName logo industry isVerified companyId companyUrl location employeeCount website description')
    .limit(10)
    .sort({ isVerified: -1, displayName: 1 });
    
    let allResults = [...existingCompanies];
    
    // If application database search is enabled, fetch data from our company service
    if (includeAppData === 'true') {
      try {
        // console.log(`🔍 Fetching application database data for: "${searchTerm}"`);
        // Get company data from our application database
        const companyResults = await companyService.searchCompanies(searchTerm, 20);
        
        // Filter out company results that already exist in our database
        const existingCompanyIds = existingCompanies
          .filter(company => company.profileId)
          .map(company => company.profileId);
        
        // Create a comprehensive list of existing names (including name, displayName, and aliases)
        const existingNames = new Set();
        existingCompanies.forEach(company => {
          existingNames.add(company.name.toLowerCase());
          if (company.displayName) {
            existingNames.add(company.displayName.toLowerCase());
          }
          if (company.aliases && Array.isArray(company.aliases)) {
            company.aliases.forEach(alias => existingNames.add(alias.toLowerCase()));
          }
        });
        
        const newCompanyResults = companyResults.filter(companyItem => {
          // Check if profileId already exists
          if (companyItem.profileId && existingCompanyIds.includes(companyItem.profileId)) {
            // console.log(`🔍 Filtered out ${companyItem.name} - profileId already exists`);
            return false;
          }
          
          // Check if name or displayName already exists
          const itemName = companyItem.name.toLowerCase();
          const itemDisplayName = (companyItem.displayName || '').toLowerCase();
          
          if (existingNames.has(itemName) || (itemDisplayName && existingNames.has(itemDisplayName))) {
            // console.log(`🔍 Filtered out ${companyItem.name} - name already exists in database`);
            return false;
          }
          
          return true;
        });
        
        // Mark company results as from our application database with enhanced data
        const markedCompanyResults = newCompanyResults.map(company => ({
          ...company,
          _id: `app_db_${company.profileId || Date.now()}`,
          isFromAppDatabase: true,
          isVerified: true,
          // Ensure all fields are properly mapped for frontend
          displayName: company.displayName || company.name,
          logo: company.logo,
          industry: company.industry,
          location: company.appData?.headquarters,
          employeeCount: company.size,
          website: company.website,
          description: company.appData?.description,
          profileUrl: company.companyUrl,
          source: company.source || 'application-database'
        }));
        
        allResults = [...allResults, ...markedCompanyResults];
        
        // console.log(`✅ Found ${existingCompanies.length} existing + ${markedCompanyResults.length} application database companies`);
        
      } catch (companyServiceError) {
        console.error('❌ Company service search error:', companyServiceError.message);
        // Continue with just database results if application database fails
      }
    }
    
    res.json({ 
      success: true, 
      data: allResults,
      meta: {
        totalResults: allResults.length,
        existingCompanies: existingCompanies.length,
        appDatabaseResults: allResults.length - existingCompanies.length,
        searchTerm: searchTerm
      }
    });
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

// @route   POST /api/companies
// @desc    Create a new company (with application database validation)
// @access  Private
router.post('/', isAuthenticated, async (req, res) => {
  try {
    const { name, companyId, companyUrl, requireAppValidation = true } = req.body;
    
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company name is required and must be at least 2 characters' 
      });
    }

    const companyName = name.trim();

    // Check if company already exists (case-insensitive search)
    const existingCompany = await Company.findOne({
      $or: [
        { name: { $regex: `^${companyName}$`, $options: 'i' } },
        { displayName: { $regex: `^${companyName}$`, $options: 'i' } },
        { aliases: { $in: [new RegExp(`^${companyName}$`, 'i')] } }
      ]
    });

    if (existingCompany) {
      // console.log(`🔍 Found existing company: ${existingCompany.displayName} for search: ${companyName}`);
      return res.json({ 
        success: true, 
        data: existingCompany,
        isNewCompany: false,
        message: 'Company already exists'
      });
    }

    // console.log(`🆕 No existing company found for: ${companyName}, proceeding with creation...`);

    // Live company validation if required
    if (requireAppValidation && !companyId) {
      try {
        // console.log(`🔍 Validating "${companyName}" with live company data`);
        const companyResults = await companyService.searchCompanies(companyName, 5);
        
        // Look for exact or close match
        const exactMatch = companyResults.find(company => 
          company.name.toLowerCase() === companyName.toLowerCase() ||
          company.displayName.toLowerCase() === companyName.toLowerCase()
        );

        if (!exactMatch && companyResults.length === 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Company not found in our database. Please select from suggestions or disable validation.',
            suggestions: [],
            code: 'COMPANY_VALIDATION_FAILED'
          });
        }

        if (!exactMatch && companyResults.length > 0) {
          return res.status(400).json({ 
            success: false, 
            message: 'Exact company match not found in our database. Please select from suggestions or disable validation.',
            suggestions: companyResults.slice(0, 3),
            code: 'COMPANY_VALIDATION_FAILED'
          });
        }

        // Create company with live company data
        const newCompany = new Company({
          name: exactMatch.name,
          displayName: exactMatch.displayName || exactMatch.name,
          profileId: exactMatch.profileId,
          profileUrl: exactMatch.profileUrl,
          industry: exactMatch.industry || 'Unknown',
          logo: exactMatch.logo,
          website: exactMatch.website,
          isVerified: true,
          appData: {
            description: exactMatch.description || '',
            headquarters: exactMatch.location || 'Unknown',
            employeeCount: exactMatch.employeeCount || 'Unknown',
            source: exactMatch.source || 'application-database',
            lastUpdated: new Date()
          }
        });

        await newCompany.save();

        return res.status(201).json({ 
          success: true, 
          data: newCompany,
          isNewCompany: true,
          message: 'Company created successfully with application database data'
        });

      } catch (appDataError) {
        console.error('❌ Application database validation error:', appDataError.message);
        // Allow creation without application database data if validation service fails
      }
    }

    // Create company from provided application database data
    if (companyId || companyUrl) {
      try {
        // console.log(`🔍 Getting company details from LinkedIn for: ${linkedinId || linkedinUrl}`);
        const linkedinDetails = await linkedinService.getCompanyDetails(linkedinId || companyName);
        
        if (linkedinDetails) {
          const newCompany = new Company({
            name: linkedinDetails.name,
            displayName: linkedinDetails.displayName || linkedinDetails.name,
            linkedinId: linkedinDetails.linkedinId,
            linkedinUrl: linkedinDetails.linkedinUrl,
            industry: linkedinDetails.industry || 'Unknown',
            logo: linkedinDetails.logo,
            website: linkedinDetails.website,
            isVerified: true,
            linkedinData: {
              description: linkedinDetails.description || '',
              headquarters: linkedinDetails.location || 'Unknown',
              employeeCount: linkedinDetails.employeeCount || 'Unknown',
              source: linkedinDetails.source || 'live-linkedin',
              lastUpdated: new Date()
            }
          });

          await newCompany.save();

          return res.status(201).json({ 
            success: true, 
            data: newCompany,
            isNewCompany: true,
            message: 'Company created successfully from live LinkedIn data'
          });
        }
      } catch (linkedinError) {
        console.error('❌ LinkedIn company creation error:', linkedinError.message);
        return res.status(400).json({ 
          success: false, 
          message: 'Failed to fetch company data from LinkedIn'
        });
      }
    }

    // Create basic company without LinkedIn validation (fallback)
    const newCompany = new Company({
      name: companyName,
      displayName: companyName,
      isVerified: false
    });

    await newCompany.save();

    res.status(201).json({ 
      success: true, 
      data: newCompany,
      isNewCompany: true,
      message: 'Company created successfully (not LinkedIn verified)'
    });

  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({ success: false, message: 'Error creating company' });
  }
});

// @route   POST /api/companies/validate-linkedin
// @desc    Validate if a company exists on LinkedIn using live data
// @access  Public
router.post('/validate-linkedin', async (req, res) => {
  try {
    const { companyName } = req.body;
    
    if (!companyName || companyName.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        message: 'Company name is required' 
      });
    }

    // console.log(`🔍 Live LinkedIn validation for: "${companyName}"`);
    
    const searchResults = await linkedinService.searchCompanies(companyName.trim(), 5);
    const isValid = searchResults.length > 0;
    
    // Check for exact match
    const exactMatch = searchResults.find(company => 
      company.name.toLowerCase() === companyName.trim().toLowerCase() ||
      company.displayName.toLowerCase() === companyName.trim().toLowerCase()
    );

    res.json({ 
      success: true, 
      isValid: !!exactMatch,
      hasResults: isValid,
      exactMatch: exactMatch || null,
      suggestions: searchResults.slice(0, 3), // Top 3 suggestions
      meta: {
        totalResults: searchResults.length,
        searchTerm: companyName.trim(),
        sources: [...new Set(searchResults.map(r => r.source))],
        validationMethod: 'live-linkedin'
      },
      message: exactMatch 
        ? 'Exact company match found on LinkedIn' 
        : isValid 
          ? 'Similar companies found on LinkedIn' 
          : 'No companies found on LinkedIn'
    });
  } catch (error) {
    console.error('❌ Error validating company:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error validating company with LinkedIn',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Validation service unavailable'
    });
  }
});

// @route   GET /api/companies/linkedin/search
// @desc    Search LinkedIn companies directly using live data
// @access  Public
router.get('/linkedin/search', async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.json({ success: true, data: [], meta: { searchTerm: query, totalResults: 0 } });
    }

    // console.log(`🔍 Direct LinkedIn search for: "${query}"`);
    
    const linkedinResults = await linkedinService.searchCompanies(query.trim(), parseInt(limit));

    res.json({ 
      success: true, 
      data: linkedinResults,
      meta: {
        totalResults: linkedinResults.length,
        searchTerm: query.trim(),
        sources: [...new Set(linkedinResults.map(r => r.source))],
        searchMethod: 'live-linkedin-direct'
      },
      source: 'live-linkedin'
    });
  } catch (error) {
    console.error('❌ Error searching LinkedIn companies:', error.message);
    res.status(500).json({ 
      success: false, 
      message: 'Error searching LinkedIn companies',
      error: process.env.NODE_ENV === 'development' ? error.message : 'LinkedIn search unavailable'
    });
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

// @route   POST /api/companies/migrate/bulk-create
// @desc    Bulk create companies from existing experience data
// @access  Private (Admin only - add admin check if needed)
router.post('/migrate/bulk-create', isAuthenticated, async (req, res) => {
  try {
    const { companies } = req.body;
    
    if (!companies || !Array.isArray(companies)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Companies array is required' 
      });
    }
    
    const results = {
      created: [],
      updated: [],
      errors: []
    };
    
    for (const companyData of companies) {
      try {
        const { companyName, experienceIds = [] } = companyData;
        
        if (!companyName) {
          results.errors.push({ error: 'Company name is required', data: companyData });
          continue;
        }
        
        const company = await Company.findOrCreate(companyName);
        
        // Add experience IDs to company if provided
        if (experienceIds.length > 0) {
          await Company.findByIdAndUpdate(company._id, {
            $addToSet: { 
              associatedExperiences: { $each: experienceIds }
            }
          });
        }
        
        // Update experiences to reference this company
        if (experienceIds.length > 0) {
          await Experience.updateMany(
            { _id: { $in: experienceIds } },
            { $set: { 'companyInfo.companyId': company._id } }
          );
        }
        
        const isNew = company.createdAt && (Date.now() - company.createdAt.getTime()) < 5000;
        
        if (isNew) {
          results.created.push({
            companyId: company._id,
            companyName: company.displayName,
            experiencesLinked: experienceIds.length
          });
        } else {
          results.updated.push({
            companyId: company._id,
            companyName: company.displayName,
            experiencesLinked: experienceIds.length
          });
        }
        
      } catch (error) {
        results.errors.push({ 
          error: error.message, 
          data: companyData 
        });
      }
    }
    
    res.json({ 
      success: true, 
      data: results,
      message: `Migration completed: ${results.created.length} created, ${results.updated.length} updated, ${results.errors.length} errors`
    });
    
  } catch (error) {
    console.error('Error in bulk company creation:', error);
    res.status(500).json({ success: false, message: 'Error in bulk migration' });
  }
});

// @route   POST /api/companies/migrate/link-experiences
// @desc    Link existing experiences to companies by company name
// @access  Private (Admin only - add admin check if needed)
router.post('/migrate/link-experiences', isAuthenticated, async (req, res) => {
  try {
    const { experienceUpdates } = req.body;
    
    if (!experienceUpdates || !Array.isArray(experienceUpdates)) {
      return res.status(400).json({ 
        success: false, 
        message: 'experienceUpdates array is required' 
      });
    }
    
    const results = {
      updated: [],
      errors: []
    };
    
    for (const update of experienceUpdates) {
      try {
        const { experienceId, companyName } = update;
        
        if (!experienceId || !companyName) {
          results.errors.push({ error: 'experienceId and companyName are required', data: update });
          continue;
        }
        
        // Find or create company
        const company = await Company.findOrCreate(companyName);
        
        // Update experience
        const experience = await Experience.findByIdAndUpdate(
          experienceId,
          { 
            $set: { 
              'companyInfo.companyId': company._id,
              'companyInfo.companyName': company.displayName // Standardize the name
            }
          },
          { new: true }
        );
        
        if (!experience) {
          results.errors.push({ error: 'Experience not found', data: update });
          continue;
        }
        
        // Add experience to company's associated experiences
        await Company.findByIdAndUpdate(company._id, {
          $addToSet: { associatedExperiences: experienceId }
        });
        
        results.updated.push({
          experienceId,
          companyId: company._id,
          companyName: company.displayName
        });
        
      } catch (error) {
        results.errors.push({ 
          error: error.message, 
          data: update 
        });
      }
    }
    
    res.json({ 
      success: true, 
      data: results,
      message: `Linking completed: ${results.updated.length} updated, ${results.errors.length} errors`
    });
    
  } catch (error) {
    console.error('Error linking experiences:', error);
    res.status(500).json({ success: false, message: 'Error linking experiences' });
  }
});

// @route   GET /api/companies/migrate/status
// @desc    Get migration status and statistics
// @access  Private
router.get('/migrate/status', isAuthenticated, async (req, res) => {
  try {
    const totalExperiences = await Experience.countDocuments();
    const experiencesWithCompanyId = await Experience.countDocuments({ 
      'companyInfo.companyId': { $exists: true, $ne: null } 
    });
    const experiencesWithoutCompanyId = totalExperiences - experiencesWithCompanyId;
    
    const totalCompanies = await Company.countDocuments();
    const verifiedCompanies = await Company.countDocuments({ isVerified: true });
    
    // Get companies with most experiences
    const topCompanies = await Company.find()
      .select('displayName associatedExperiences isVerified')
      .sort({ 'associatedExperiences': -1 })
      .limit(10);
    
    // Get experiences without company association
    const unlinkedExperiences = await Experience.find({ 
      'companyInfo.companyId': { $exists: false } 
    })
    .select('_id companyInfo.companyName')
    .limit(20);
    
    res.json({
      success: true,
      data: {
        experiences: {
          total: totalExperiences,
          withCompanyId: experiencesWithCompanyId,
          withoutCompanyId: experiencesWithoutCompanyId,
          migrationProgress: `${Math.round((experiencesWithCompanyId / totalExperiences) * 100)}%`
        },
        companies: {
          total: totalCompanies,
          verified: verifiedCompanies,
          unverified: totalCompanies - verifiedCompanies
        },
        topCompanies: topCompanies.map(company => ({
          id: company._id,
          name: company.displayName,
          experienceCount: company.associatedExperiences.length,
          isVerified: company.isVerified
        })),
        unlinkedExperiences: unlinkedExperiences.map(exp => ({
          id: exp._id,
          companyName: exp.companyInfo?.companyName
        }))
      }
    });
    
  } catch (error) {
    console.error('Error getting migration status:', error);
    res.status(500).json({ success: false, message: 'Error getting migration status' });
  }
});

// @route   POST /api/companies/update-from-database
// @desc    Update specific companies with data from companies.js database
// @access  Private
router.post('/update-from-database', isAuthenticated, async (req, res) => {
  try {
    const { companyIds } = req.body;
    
    if (!companyIds || !Array.isArray(companyIds)) {
      return res.status(400).json({ 
        success: false, 
        message: 'companyIds array is required' 
      });
    }

    // Load company data from our database
    const companiesDatabase = require('../data/companies');
    
    const results = {
      updated: [],
      notFound: [],
      errors: []
    };

    for (const companyId of companyIds) {
      try {
        // Find the company in our database
        const dbCompany = await Company.findById(companyId);
        
        if (!dbCompany) {
          results.notFound.push({ companyId, reason: 'Company not found in database' });
          continue;
        }

        // Find matching data in companies.js
        const companyData = findCompanyDataFromDatabase(dbCompany.name, companiesDatabase);
        
        if (!companyData) {
          results.notFound.push({ 
            companyId, 
            companyName: dbCompany.name,
            reason: 'No matching data in companies database' 
          });
          continue;
        }

        // Update the company with rich data
        const updateData = {
          displayName: companyData.displayName,
          logo: companyData.logo,
          linkedinUrl: companyData.linkedinUrl,
          website: companyData.website,
          industry: companyData.industry,
          size: companyData.size,
          isVerified: companyData.isVerified,
          linkedinData: {
            description: companyData.linkedinData?.description || '',
            headquarters: companyData.linkedinData?.headquarters || '',
            employeeCount: companyData.linkedinData?.employeeCount || '',
            founded: companyData.linkedinData?.founded || '',
            lastUpdated: new Date()
          }
        };

        // Perform the update
        const updatedCompany = await Company.findByIdAndUpdate(
          companyId,
          { 
            $set: updateData,
            $addToSet: {
              aliases: { $each: companyData.aliases || [] }
            }
          },
          { new: true, runValidators: true }
        );

        results.updated.push({
          companyId: companyId,
          oldName: dbCompany.name,
          newDisplayName: updatedCompany.displayName,
          industry: updatedCompany.industry,
          size: updatedCompany.size,
          isVerified: updatedCompany.isVerified
        });

        // console.log(`✅ Updated company: ${dbCompany.name} -> ${updatedCompany.displayName}`);

      } catch (error) {
        results.errors.push({
          companyId,
          error: error.message
        });
        console.error(`❌ Error updating company ${companyId}:`, error.message);
      }
    }

    res.json({
      success: true,
      message: `Updated ${results.updated.length} companies`,
      data: results
    });

  } catch (error) {
    console.error('Error in update-from-database:', error);
    res.status(500).json({ success: false, message: 'Error updating companies' });
  }
});

// @route   PUT /api/companies/:id
// @desc    Update a company and automatically sync to related experiences
// @access  Private (authenticated)
router.put('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // Validate company ID
    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }
    
    // Check if company exists
    const existingCompany = await Company.findById(id);
    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    // Extract allowed fields for update
    const allowedFields = [
      'displayName', 'logo', 'website', 'industry', 'size', 
      'linkedinUrl', 'isVerified', 'linkedinData'
    ];
    
    const filteredUpdateData = {};
    allowedFields.forEach(field => {
      if (updateData.hasOwnProperty(field)) {
        filteredUpdateData[field] = updateData[field];
      }
    });
    
    // Ensure we have some data to update
    if (Object.keys(filteredUpdateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }
    
    // console.log(`🔄 Updating company "${existingCompany.displayName}" with:`, filteredUpdateData);
    
    // Update the company (this will trigger the post-save middleware for cascading updates)
    const updatedCompany = await Company.findByIdAndUpdate(
      id,
      { $set: filteredUpdateData },
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Company updated successfully (related experiences will be synced automatically)',
      data: updatedCompany
    });
    
  } catch (error) {
    console.error('❌ Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to find company data from companies.js
function findCompanyDataFromDatabase(searchName, companiesDatabase) {
  const normalizedSearch = searchName.toLowerCase();
  
  return companiesDatabase.find(c => {
    const nameMatch = c.name.toLowerCase() === normalizedSearch;
    const displayNameMatch = c.displayName.toLowerCase() === normalizedSearch;
    const aliasMatch = c.aliases.some(alias => alias.toLowerCase() === normalizedSearch);
    
    // Special handling for "citi india" -> "citigroup"
    if (normalizedSearch === 'citi india') {
      return c.name.toLowerCase() === 'citigroup' || 
             c.aliases.some(alias => alias.toLowerCase() === 'citi');
    }
    
    return nameMatch || displayNameMatch || aliasMatch;
  });
}

module.exports = router;
