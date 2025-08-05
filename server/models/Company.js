const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true,
    lowercase: true // Store normalized version for matching
  },
  displayName: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    default: null
  },
  linkedinUrl: {
    type: String,
    default: null
  },
  website: {
    type: String,
    default: null
  },
  industry: {
    type: String,
    default: null
  },
  size: {
    type: String,
    default: null
  },
  associatedExperiences: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experience'
  }],
  aliases: [{
    type: String,
    index: true,
    trim: true,
    lowercase: true
  }], // For handling different spellings/variations
  isVerified: {
    type: Boolean,
    default: false
  },
  linkedinData: {
    description: String,
    headquarters: String,
    employeeCount: String,
    founded: String,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  }
}, {
  timestamps: true
});

// Text search index for fuzzy matching
companySchema.index({ 
  name: 'text', 
  displayName: 'text', 
  aliases: 'text' 
});

// Pre-save middleware to normalize name and handle aliases
companySchema.pre('save', function(next) {
  if (this.isModified('displayName') && !this.name) {
    this.name = this.displayName.toLowerCase().trim();
  }
  
  // Add displayName to aliases if not already present
  if (this.displayName && !this.aliases.includes(this.displayName.toLowerCase())) {
    this.aliases.push(this.displayName.toLowerCase());
  }
  
  next();
});

// Post-save middleware to update related experiences when company data changes
companySchema.post('save', async function(doc) {
  const Experience = require('./Experience');
  
  try {
    // Check if any fields that affect experience display were modified
    const fieldsToSync = ['displayName', 'logo'];
    const modifiedFields = fieldsToSync.filter(field => doc.isModified && doc.isModified(field));
    
    if (modifiedFields.length > 0) {
      // console.log(`🔄 Company "${doc.displayName}" updated. Syncing ${modifiedFields.join(', ')} to related experiences...`);
      
      // Update all experiences that reference this company
      const updateResult = await Experience.updateMany(
        { 'companyInfo.companyId': doc._id },
        {
          $set: {
            'companyInfo.companyName': doc.displayName,
            'companyInfo.companyLogo': doc.logo
          }
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        // console.log(`✅ Updated ${updateResult.modifiedCount} experiences with new company data for "${doc.displayName}"`);
      }
    }
  } catch (error) {
    // console.error(`❌ Error syncing company data to experiences for "${doc.displayName}":`, error.message);
  }
});

// Post-update middleware for findOneAndUpdate operations
companySchema.post(['findOneAndUpdate', 'updateOne', 'updateMany'], async function(result) {
  const Experience = require('./Experience');
  
  try {
    // Get the updated document to check what was modified
    const updatedDoc = await this.model.findOne(this.getQuery());
    
    if (updatedDoc) {
      // console.log(`🔄 Company "${updatedDoc.displayName}" updated via findOneAndUpdate. Syncing to related experiences...`);
      
      // Update all experiences that reference this company
      const updateResult = await Experience.updateMany(
        { 'companyInfo.companyId': updatedDoc._id },
        {
          $set: {
            'companyInfo.companyName': updatedDoc.displayName,
            'companyInfo.companyLogo': updatedDoc.logo
          }
        }
      );
      
      if (updateResult.modifiedCount > 0) {
        // console.log(`✅ Updated ${updateResult.modifiedCount} experiences with new company data for "${updatedDoc.displayName}"`);
      }
    }
  } catch (error) {
    // console.error('❌ Error syncing company data to experiences:', error.message);
  }
});

// Method to find or create company
companySchema.statics.findOrCreate = async function(companyName) {
  const normalizedName = companyName.toLowerCase().trim();
  
  // First try to find exact match (case-insensitive)
  let company = await this.findOne({ 
    $or: [
      { name: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } },
      { displayName: { $regex: `^${companyName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }
    ]
  });
  
  if (!company) {
    // Try to find by alias (case-insensitive)
    company = await this.findOne({ 
      aliases: { $elemMatch: { $regex: `^${normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' } }
    });
  }
  
  if (!company) {
    // Try to find from imported companies data
    const companiesData = require('../data/companies');
    const matchingCompanyData = companiesData.find(c => 
      c.name.toLowerCase() === normalizedName || 
      c.displayName.toLowerCase() === normalizedName ||
      (c.aliases && c.aliases.some(alias => alias.toLowerCase() === normalizedName))
    );
    
    if (matchingCompanyData) {
      // Create company with imported data
      company = await this.create({
        name: matchingCompanyData.name,
        displayName: matchingCompanyData.displayName,
        logo: matchingCompanyData.logo,
        linkedinUrl: matchingCompanyData.linkedinUrl,
        website: matchingCompanyData.website,
        industry: matchingCompanyData.industry,
        size: matchingCompanyData.size,
        aliases: matchingCompanyData.aliases || [normalizedName],
        isVerified: matchingCompanyData.isVerified || false,
        linkedinData: matchingCompanyData.linkedinData || {}
      });
      // console.log(`✅ Created company from imported data: ${matchingCompanyData.displayName}`);
    } else {
      // Create basic company entry
      company = await this.create({
        name: normalizedName,
        displayName: companyName.trim(),
        aliases: [normalizedName],
        logo: `https://logo.clearbit.com/${companyName.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`
      });
      // console.log(`ℹ️ Created basic company entry: ${companyName.trim()}`);
    }
  }
  
  return company;
};

module.exports = mongoose.model('Company', companySchema);
