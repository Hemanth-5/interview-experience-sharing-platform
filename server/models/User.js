const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  name: {
    type: String,
    required: true
  },
  avatar: {
    type: String,
    default: null
  },
  role: {
    type: String,
    enum: ['Student', 'Admin', 'Moderator'],
    default: 'Student'
  },
  university: {
    type: String,
    default: null
  },
  graduationYear: {
    type: Number,
    min: 2020,
    max: 2030
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experience'
  }],
  // Gamification
  points: {
    type: Number,
    default: 0
  },
  badges: [{
    type: String,
    enum: ['Contributor', 'Helper', 'Expert', 'Mentor', 'Top Reviewer']
  }],
  level: {
    type: Number,
    default: 1
  },
  streak: {
    type: Number,
    default: 0
  },
  // Preferences
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      browser: { type: Boolean, default: true }
    },
    privacy: {
      showEmail: { type: Boolean, default: false },
      showUniversity: { type: Boolean, default: true }
    }
  },
  // Stats
  stats: {
    experiencesShared: { type: Number, default: 0 },
    totalViews: { type: Number, default: 0 },
    totalUpvotes: { type: Number, default: 0 },
    helpfulnessScore: { type: Number, default: 0 }
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ googleId: 1 });
userSchema.index({ university: 1 });

// Methods
userSchema.methods.updateStats = function(field, increment = 1) {
  this.stats[field] = (this.stats[field] || 0) + increment;
  return this.save();
};

userSchema.methods.addBadge = function(badge) {
  if (!this.badges.includes(badge)) {
    this.badges.push(badge);
    return this.save();
  }
  return Promise.resolve(this);
};

module.exports = mongoose.model('User', userSchema);
