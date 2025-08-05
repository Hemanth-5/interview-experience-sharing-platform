const mongoose = require('mongoose');
const Experience = require('../models/Experience');
const Company = require('../models/Company');
require('dotenv').config();

const migrateCompanies = async () => {
  try {
    // d('Starting company migration...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    // d('Connected to MongoDB');
    
    // Get all experiences
    const experiences = await Experience.find({});
    // d(`Found ${experiences.length} experiences to migrate`);
    
    // Group experiences by company name (normalized)
    const companyMap = new Map();
    
    experiences.forEach(exp => {
      if (!exp.companyInfo || !exp.companyInfo.companyName) {
        console.warn(`Experience ${exp._id} has no company name, skipping`);
        return;
      }
      
      const companyName = exp.companyInfo.companyName.toLowerCase().trim();
      if (!companyMap.has(companyName)) {
        companyMap.set(companyName, {
          displayName: exp.companyInfo.companyName, // Use first occurrence as display name
          experiences: []
        });
      }
      companyMap.get(companyName).experiences.push(exp);
    });
    
    // d(`Found ${companyMap.size} unique companies`);
    
    let processedCount = 0;
    let errorCount = 0;
    
    // Create Company documents and update experiences
    for (const [normalizedName, companyData] of companyMap) {
      try {
        // Check if company already exists
        let company = await Company.findOne({ name: normalizedName });
        
        if (!company) {
          // Create new company
          company = await Company.create({
            name: normalizedName,
            displayName: companyData.displayName,
            associatedExperiences: companyData.experiences.map(exp => exp._id),
            aliases: [normalizedName]
          });
          // d(`Created company: ${company.displayName}`);
        } else {
          // Update existing company
          await Company.findByIdAndUpdate(company._id, {
            $addToSet: { 
              associatedExperiences: { $each: companyData.experiences.map(exp => exp._id) }
            }
          });
          // d(`Updated existing company: ${company.displayName}`);
        }
        
        // Update all experiences to reference the company
        const experienceIds = companyData.experiences.map(exp => exp._id);
        await Experience.updateMany(
          { _id: { $in: experienceIds } },
          { $set: { 'companyInfo.companyId': company._id } }
        );
        
        processedCount++;
        
      } catch (error) {
        // console.error(`Error processing company ${companyData.displayName}:`, error.message);
        errorCount++;
      }
    }
    
    // d(`\nMigration completed!`);
    // d(`- Processed: ${processedCount} companies`);
    // d(`- Errors: ${errorCount} companies`);
    // d(`- Total experiences updated: ${experiences.length}`);
    
    // Verify migration
    const totalCompanies = await Company.countDocuments();
    const experiencesWithCompanyId = await Experience.countDocuments({ 'companyInfo.companyId': { $exists: true, $ne: null } });
    
    // d(`\nVerification:`);
    // d(`- Total companies in database: ${totalCompanies}`);
    // d(`- Experiences with companyId: ${experiencesWithCompanyId}/${experiences.length}`);
    
  } catch (error) {
    // console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
    // d('Disconnected from MongoDB');
  }
};

// Run migration if script is executed directly
if (require.main === module) {
  migrateCompanies()
    .then(() => {
      // d('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      // console.error('Migration script failed:', error);
      process.exit(1);
    });
}

module.exports = migrateCompanies;
