const axios = require('axios');

class CompanyService {
  constructor() {
    // Initialize with your own company database
    this.companiesDatabase = this.initializeCompanyDatabase();
    
    // Cache for performance
    this.cache = new Map();
    this.cacheExpiration = 1000 * 60 * 30; // 30 minutes
    
    // console.log(`🏢 Company Service initialized with ${this.companiesDatabase.length} companies in database`);
  }

  /**
   * Initialize with companies from external data file matching Company model
   */
  initializeCompanyDatabase() {
    try {
      const companiesData = require('../data/companies');
      // console.log(`📊 Loaded ${companiesData.length} companies from application database`);
      return companiesData;
    } catch (error) {
      console.error('❌ Error loading companies database:', error.message);
      return this.getFallbackCompanies();
    }
  }

  /**
   * Fallback companies if external file fails
   */
  getFallbackCompanies() {
    return [
      {
        name: 'google',
        displayName: 'Google',
        logo: 'https://logo.clearbit.com/google.com',
        linkedinUrl: 'https://linkedin.com/company/google',
        website: 'https://www.google.com',
        industry: 'Technology',
        size: '180,000+ employees',
        aliases: ['google llc', 'alphabet inc', 'googl'],
        isVerified: true,
        linkedinData: {
          description: 'Multinational technology company specializing in Internet-related services and products.',
          headquarters: 'Mountain View, CA, USA',
          employeeCount: '180,000+',
          founded: '1998'
        }
      }
    ];
  }

  /**
   * Search companies in our application database
   * @param {string} query - Company name to search
   * @param {number} limit - Maximum number of results
   * @returns {Promise<Array>} Array of company objects
   */
  async searchCompanies(query, limit = 10) {
    try {
      // console.log(`🔍 Searching application database for: "${query}"`);

      if (!query || query.trim().length < 2) {
        return [];
      }

      const searchTerm = query.trim().toLowerCase();
      
      // Check cache first
      const cacheKey = `search_${searchTerm}_${limit}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (Date.now() - cached.timestamp < this.cacheExpiration) {
          // console.log(`📦 Returning cached results for "${query}"`);
          return cached.data;
        } else {
          this.cache.delete(cacheKey);
        }
      }

      // Search through our company database
      const results = [];
      for (const company of this.companiesDatabase) {
        const score = this.calculateMatchScore(searchTerm, company);
        
        if (score > 0) {
          results.push({
            ...this.formatCompanyData(company),
            matchScore: score
          });
        }
      }

      // Sort by match score (higher is better) and limit results
      const sortedResults = results
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, limit)
        .map(({ matchScore, ...company }) => company); // Remove match score from final result

      // Cache results
      if (sortedResults.length > 0) {
        this.cache.set(cacheKey, {
          data: sortedResults,
          timestamp: Date.now()
        });
      }

      // console.log(`✅ Found ${sortedResults.length} companies matching "${query}" from application database`);
      return sortedResults;

    } catch (error) {
      console.error('❌ Company search error:', error.message);
      return [];
    }
  }

  /**
   * Format company data for frontend consumption matching Company model
   */
  formatCompanyData(company) {
    return {
      name: company.name,
      displayName: company.displayName || company.name,
      logo: company.logo,
      linkedinUrl: company.linkedinUrl,
      website: company.website,
      industry: company.industry,
      size: company.size,
      aliases: company.aliases || [],
      isVerified: company.isVerified || false,
      linkedinData: company.linkedinData || {},
      source: 'application-database'
    };
  }

  /**
   * Calculate match score between search term and company
   * Returns a score from 0-100, where 100 is perfect match
   */
  calculateMatchScore(searchTerm, company) {
    const name = company.name.toLowerCase();
    const displayName = (company.displayName || company.name).toLowerCase();
    const aliases = company.aliases || [];

    // Exact match gets highest score
    if (name === searchTerm || displayName === searchTerm) {
      return 100;
    }

    // Check aliases for exact match
    for (const alias of aliases) {
      if (alias.toLowerCase() === searchTerm) {
        return 95;
      }
    }

    // Starts with match gets high score
    if (name.startsWith(searchTerm) || displayName.startsWith(searchTerm)) {
      return 80;
    }

    // Check if aliases start with search term
    for (const alias of aliases) {
      if (alias.toLowerCase().startsWith(searchTerm)) {
        return 75;
      }
    }

    // Contains match gets medium score
    if (name.includes(searchTerm) || displayName.includes(searchTerm)) {
      return 60;
    }

    // Check if aliases contain search term
    for (const alias of aliases) {
      if (alias.toLowerCase().includes(searchTerm)) {
        return 55;
      }
    }

    return 0; // No match
  }

  /**
   * Validate if a company exists in our application database
   * @param {string} companyName - Company name to validate
   * @returns {Promise<boolean>} True if company exists
   */
  async validateCompany(companyName) {
    try {
      const results = await this.searchCompanies(companyName, 1);
      
      // Check for exact or very close match (score > 80)
      if (results.length > 0) {
        const topResult = results[0];
        const score = this.calculateMatchScore(companyName.toLowerCase(), topResult);
        return score >= 80; // High confidence match
      }
      
      return false;
    } catch (error) {
      console.error('Company validation error:', error);
      return false;
    }
  }

  /**
   * Get company details by name or ID
   * @param {string} identifier - Company name or ID
   * @returns {Promise<Object|null>} Company details or null
   */
  async getCompanyDetails(identifier) {
    try {
      const results = await this.searchCompanies(identifier, 1);
      return results.length > 0 ? results[0] : null;
    } catch (error) {
      console.error('Error getting company details:', error);
      return null;
    }
  }

  /**
   * Add a new company to the database
   * @param {Object} companyData - Company information matching Company model
   * @returns {Object} Added company
   */
  addCompany(companyData) {
    const newCompany = {
      name: companyData.name.toLowerCase(),
      displayName: companyData.displayName || companyData.name,
      logo: companyData.logo || null,
      linkedinUrl: companyData.linkedinUrl || null,
      website: companyData.website || null,
      industry: companyData.industry || null,
      size: companyData.size || null,
      aliases: companyData.aliases || [],
      isVerified: companyData.isVerified || false,
      linkedinData: companyData.linkedinData || {}
    };

    this.companiesDatabase.push(newCompany);
    // console.log(`✅ Added new company: ${newCompany.displayName}`);
    
    // Clear cache since database changed
    this.cache.clear();
    
    return this.formatCompanyData(newCompany);
  }

  /**
   * Get all companies (for admin use)
   * @returns {Array} All companies in database
   */
  getAllCompanies() {
    return this.companiesDatabase.map(company => this.formatCompanyData(company));
  }

  /**
   * Get companies by industry
   * @param {string} industry - Industry name
   * @returns {Array} Companies in the industry
   */
  getCompaniesByIndustry(industry) {
    return this.companiesDatabase
      .filter(company => company.industry && company.industry.toLowerCase().includes(industry.toLowerCase()))
      .map(company => this.formatCompanyData(company));
  }

  /**
   * Get database statistics
   */
  getStats() {
    const industries = [...new Set(this.companiesDatabase.map(c => c.industry).filter(Boolean))];
    const locations = [...new Set(this.companiesDatabase.map(c => c.linkedinData?.headquarters).filter(Boolean))];
    
    return {
      totalCompanies: this.companiesDatabase.length,
      industries: industries.length,
      locations: locations.length,
      cacheSize: this.cache.size,
      topIndustries: this.getTopIndustries(),
      topLocations: this.getTopLocations()
    };
  }

  /**
   * Get top industries by company count
   */
  getTopIndustries() {
    const counts = {};
    this.companiesDatabase.forEach(company => {
      if (company.industry) {
        counts[company.industry] = (counts[company.industry] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([industry, count]) => ({ industry, count }));
  }

  /**
   * Get top locations by company count
   */
  getTopLocations() {
    const counts = {};
    this.companiesDatabase.forEach(company => {
      if (company.linkedinData?.headquarters) {
        const location = company.linkedinData.headquarters;
        counts[location] = (counts[location] || 0) + 1;
      }
    });
    
    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([location, count]) => ({ location, count }));
  }
}

module.exports = new CompanyService();
