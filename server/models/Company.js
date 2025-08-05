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

// Method to find or create company
companySchema.statics.findOrCreate = async function(companyName) {
  const normalizedName = companyName.toLowerCase().trim();
  
  // First try to find exact match
  let company = await this.findOne({ name: normalizedName });
  
  if (!company) {
    // Try to find by alias
    company = await this.findOne({ aliases: normalizedName });
  }
  
  if (!company) {
    // Create new company
    company = await this.create({
      name: normalizedName,
      displayName: companyName.trim(),
      aliases: [normalizedName]
    });
  }
  
  return company;
};

module.exports = mongoose.model('Company', companySchema);
