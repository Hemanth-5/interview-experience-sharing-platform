const express = require('express');
const Experience = require('../models/Experience');
const Company = require('../models/Company');
const router = express.Router();

// Cache for trending searches (refreshed every 5 minutes)
let trendingCache = {
  data: [],
  lastUpdated: null,
  ttl: 5 * 60 * 1000 // 5 minutes
};

// @route   GET /api/search/suggestions
// @desc    Get search suggestions based on query
// @access  Public
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q.length < 2) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const searchRegex = new RegExp(q.trim(), 'i');
    const suggestions = [];

    // Search companies with better matching
    const companies = await Experience.aggregate([
      { 
        $match: { 
          isPublished: true,
          'companyInfo.companyName': searchRegex
        }
      },
      {
        $group: {
          _id: '$companyInfo.companyName',
          count: { $sum: 1 },
          avgRating: { $avg: '$overallRating' },
          roles: { $addToSet: '$companyInfo.role' },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { totalViews: -1, count: -1 } }, // Sort by views first, then count
      { $limit: 5 }
    ]);

    companies.forEach(company => {
      suggestions.push({
        query: company._id,
        type: 'company',
        description: `${company.count} experiences, ${company.roles.length} roles`,
        count: company.count,
        icon: 'building',
        relevance: company.totalViews || 0
      });
    });

    // Search roles with better matching
    const roles = await Experience.aggregate([
      { 
        $match: { 
          isPublished: true,
          'companyInfo.role': searchRegex
        }
      },
      {
        $group: {
          _id: '$companyInfo.role',
          count: { $sum: 1 },
          companies: { $addToSet: '$companyInfo.companyName' },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { totalViews: -1, count: -1 } },
      { $limit: 5 }
    ]);

    roles.forEach(role => {
      suggestions.push({
        query: role._id,
        type: 'role',
        description: `${role.count} experiences at ${role.companies.length} companies`,
        count: role.count,
        icon: 'user',
        relevance: role.totalViews || 0
      });
    });

    // Search for exact company matches in our Company collection if it exists
    try {
      const exactCompanyMatch = await Company.findOne({
        name: { $regex: new RegExp(`^${q.trim()}$`, 'i') }
      });
      
      if (exactCompanyMatch) {
        suggestions.unshift({
          query: exactCompanyMatch.name,
          type: 'company',
          description: `Exact match - ${exactCompanyMatch.name}`,
          count: null,
          icon: 'building',
          relevance: 1000 // High relevance for exact matches
        });
      }
    } catch (error) {
      // Company collection might not exist, continue without it
    }

    // Search in key tips and tags (limited for performance)
    const keywords = await Experience.aggregate([
      { 
        $match: { 
          isPublished: true,
          $or: [
            { keyTips: searchRegex },
            { tags: searchRegex }
          ]
        }
      },
      {
        $group: {
          _id: null,
          matchingTags: { 
            $push: {
              $filter: {
                input: '$tags',
                cond: { $regexMatch: { input: '$$this', regex: searchRegex } }
              }
            }
          },
          count: { $sum: 1 }
        }
      },
      { $limit: 1 } // Limit to improve performance
    ]);

    if (keywords.length > 0) {
      const allTags = keywords[0].matchingTags.flat();
      const uniqueTags = [...new Set(allTags)];
      
      uniqueTags.slice(0, 2).forEach(tag => { // Reduced to 2 for better performance
        suggestions.push({
          query: tag,
          type: 'keyword',
          description: `Keyword in ${keywords[0].count} experiences`,
          count: keywords[0].count,
          icon: 'tag',
          relevance: keywords[0].count
        });
      });
    }

    // Remove duplicates and sort by relevance, then count
    const uniqueSuggestions = suggestions
      .filter((suggestion, index, self) => 
        index === self.findIndex(s => s.query.toLowerCase() === suggestion.query.toLowerCase())
      )
      .sort((a, b) => {
        // Sort by relevance first, then count
        if (b.relevance !== a.relevance) {
          return (b.relevance || 0) - (a.relevance || 0);
        }
        return (b.count || 0) - (a.count || 0);
      })
      .slice(0, 8);

    res.json({
      success: true,
      suggestions: uniqueSuggestions
    });

  } catch (error) {
    console.error('Error fetching search suggestions:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @route   GET /api/search/trending
// @desc    Get trending search terms
// @access  Public
router.get('/trending', async (req, res) => {
  try {
    // Check cache first
    const now = Date.now();
    if (trendingCache.lastUpdated && (now - trendingCache.lastUpdated) < trendingCache.ttl) {
      return res.json({
        success: true,
        trending: trendingCache.data,
        cached: true
      });
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get trending companies based on recent activity and views
    const trendingCompanies = await Experience.aggregate([
      { $match: { isPublished: true, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$companyInfo.companyName',
          count: { $sum: 1 },
          recentViews: { $sum: '$views' },
          avgRating: { $avg: '$overallRating' }
        }
      },
      { 
        $addFields: {
          trendScore: { 
            $add: [
              { $multiply: ['$count', 2] }, // Weight experience count
              { $divide: ['$recentViews', 10] }, // Weight views (scaled down)
              { $multiply: [{ $ifNull: ['$avgRating', 0] }, 5] } // Weight rating
            ]
          }
        }
      },
      { $sort: { trendScore: -1 } },
      { $limit: 3 }
    ]);

    // Get trending roles
    const trendingRoles = await Experience.aggregate([
      { $match: { isPublished: true, createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$companyInfo.role',
          count: { $sum: 1 },
          recentViews: { $sum: '$views' },
          uniqueCompanies: { $addToSet: '$companyInfo.companyName' }
        }
      },
      { 
        $addFields: {
          trendScore: { 
            $add: [
              { $multiply: ['$count', 1.5] },
              { $divide: ['$recentViews', 10] },
              { $size: '$uniqueCompanies' } // Diversity bonus
            ]
          }
        }
      },
      { $sort: { trendScore: -1 } },
      { $limit: 2 }
    ]);

    // Combine and format trending searches
    const trending = [
      ...trendingCompanies.map(company => company._id),
      ...trendingRoles.map(role => role._id),
    ].filter(Boolean); // Remove any null/undefined values

    // Update cache
    trendingCache = {
      data: trending.slice(0, 5),
      lastUpdated: now,
      ttl: 5 * 60 * 1000
    };

    res.json({
      success: true,
      trending: trendingCache.data,
      cached: false
    });

  } catch (error) {
    console.error('Error fetching trending searches:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

module.exports = router;