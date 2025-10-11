const mongoose = require('mongoose');

const interviewRoundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: false, // Made optional
    min: 1,
    default: function() {
      // Auto-generate round number based on position in array
      const rounds = this.parent().rounds;
      return rounds ? rounds.length : 1;
    }
  },
  roundType: {
    type: String,
    required: true,
    enum: ['Online Assessment', 'Technical', 'HR', 'Group Discussion', 'Presentation', 'Case Study', 'Coding Round', 'System Design']
  },
  duration: {
    type: Number, // in minutes
    required: true,
    min: 1
  },
  platform: {
    type: String,
    default: null
  },
  // Technical Questions
  technicalQuestions: [{
    question: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true
    },
    topics: [{
      type: String
    }],
    leetcodeLink: {
      type: String,
      default: null
    },
    solution: {
      type: String,
      default: null
    },
    timeGiven: {
      type: Number, // in minutes
      default: null
    }
  }],
  // HR/Behavioral Questions
  behavioralQuestions: [{
    question: {
      type: String,
      required: true
    },
    category: {
      type: String,
      enum: ['Personal', 'Behavioral', 'Situational', 'Company-specific'],
      required: true
    },
    yourAnswer: {
      type: String,
      default: null
    }
  }],
  // MCQ/Aptitude Section
  mcqSection: {
    totalQuestions: {
      type: Number,
      default: null
    },
    timeLimit: {
      type: Number, // in minutes
      default: null
    },
    topics: [{
      type: String
    }],
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: null
    },
    cutoff: {
      type: Number,
      default: null
    }
  },
  // Interviewer Details
  roundResult: {
    type: String,
    enum: ['Selected', 'Rejected', 'Pending', 'Waitlisted'],
    required: true
  },
  feedback: {
    type: String,
    default: null
  },
  tips: {
    type: String,
    required: false,
    default: ''
  },
  overallExperience: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  }
});

const companyInfoSchema = new mongoose.Schema({
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    default: null,
    index: true
  },
  companyName: {
    type: String,
    required: true,
    index: true
  },
  companyLogo: {
    type: String,
    default: null
  },
  role: {
    type: String,
    required: true,
    index: true
  },
  department: {
    type: String,
    required: false,
    default: ''
  },
  internshipType: {
    type: String,
    enum: ['Summer', 'Winter', 'Full-time', 'Part-time', 'PPO', 'Contract'],
    required: true,
    index: true
  },
  duration: {
    type: String,
    required: true
  },
  location: {
    type: String,
    enum: ['Remote', 'On-site', 'Hybrid'],
    required: true,
    index: true
  },
  city: {
    type: String,
    default: null
  },
  stipend: {
    type: Number,
    default: null
  },
  currency: {
    type: String,
    default: 'INR'
  },
  applicationDate: {
    type: Date,
    required: true
  }
});

const experienceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  companyInfo: {
    type: companyInfoSchema,
    required: true
  },
  rounds: {
    type: [interviewRoundSchema],
    required: true,
    validate: [arrayLimit, '{PATH} must have at least one round']
  },
  // Overall Experience
  overallRating: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  overallExperience: {
    type: String,
    required: false,
    default: ''
  },
  finalResult: {
    type: String,
    enum: ['Selected', 'Rejected', 'Withdrawn', 'Pending'],
    required: true,
    index: true
  },
  wouldRecommend: {
    type: Boolean,
    required: true
  },
  // Preparation & Tips
  preparationTime: {
    type: Number, // in weeks
    required: true,
    min: 0
  },
  resourcesUsed: [{
    type: String
  }],
  keyTips: {
    type: String,
    required: true
  },
  mistakesToAvoid: {
    type: String,
    required: true
  },
  // Metadata
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  // Engagement
  upvotes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  downvotes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  views: {
    type: Number,
    default: 0
  },
  uniqueViews: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    viewedAt: {
      type: Date,
      default: Date.now
    }
  }],
  // Comments
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  // Moderation and Flagging
  isPublished: {
    type: Boolean,
    default: true,
    index: true
  },
  flagged: {
    type: Boolean,
    default: false,
    index: true
  },
  flaggedAt: {
    type: Date,
    default: null
  },
  flaggedBy: {
    type: mongoose.Schema.Types.Mixed, // Can be ObjectId or string
    ref: 'User',
    default: null,
    validate: {
      validator: function(v) {
        // Allow ObjectId or the string 'system'
        return (
          v === null ||
          (typeof v === 'string' && v === 'system') ||
          (typeof v === 'object' && v instanceof mongoose.Types.ObjectId)
        );
      },
      message: 'flaggedBy must be a User ObjectId or the string "system".'
    }
  },
  flagReason: {
    type: String,
    enum: [
      'inappropriate_content',
      'fake_information', 
      'spam',
      'offensive_language',
      'copyright_violation',
      'personal_attacks',
      'off_topic',
      'duplicate_content',
      'multiple_reports',
      'other'
    ],
    default: null
  },
  flagReasonDetails: {
    type: String,
    default: null
  },
  reports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      enum: [
        'inappropriate_content',
        'fake_information',
        'spam', 
        'offensive_language',
        'copyright_violation',
        'personal_attacks',
        'off_topic',
        'duplicate_content',
        'other'
      ],
      required: true
    },
    reasonDetails: {
      type: String,
      maxlength: 500
    },
    reportedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'resolved'],
      default: 'pending'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: {
      type: Date
    }
  }],
  autoFlagThreshold: {
    type: Number,
    default: 3 // Auto-flag after 3 reports
  },
  // Tags for better searchability
  tags: [{
    type: String,
    index: true
  }]
}, {
  timestamps: true
});

// Validation function
function arrayLimit(val) {
  return val.length >= 1;
}

// Indexes for better query performance
experienceSchema.index({ 'companyInfo.companyName': 1 });
experienceSchema.index({ 'companyInfo.role': 1 });
experienceSchema.index({ 'companyInfo.internshipType': 1 });
experienceSchema.index({ 'companyInfo.location': 1 });
experienceSchema.index({ finalResult: 1 });
experienceSchema.index({ overallRating: 1 });
experienceSchema.index({ createdAt: -1 });
experienceSchema.index({ tags: 1 });
experienceSchema.index({ isPublished: 1 });

// Compound indexes
experienceSchema.index({ 'companyInfo.companyName': 1, 'companyInfo.role': 1 });
experienceSchema.index({ isPublished: 1, createdAt: -1 });

// Virtual for upvote count
experienceSchema.virtual('upvoteCount').get(function() {
  return this.upvotes ? this.upvotes.length : 0;
});

// Virtual for downvote count
experienceSchema.virtual('downvoteCount').get(function() {
  return this.downvotes ? this.downvotes.length : 0;
});

// Virtual for comment count
experienceSchema.virtual('commentCount').get(function() {
  return this.comments ? this.comments.length : 0;
});

// Virtual for net score
experienceSchema.virtual('netScore').get(function() {
  const upvoteCount = this.upvotes ? this.upvotes.length : 0;
  const downvoteCount = this.downvotes ? this.downvotes.length : 0;
  return upvoteCount - downvoteCount;
});

// Ensure virtuals are included in JSON
experienceSchema.set('toJSON', { virtuals: true });
experienceSchema.set('toObject', { virtuals: true });

// Pre-save middleware to auto-assign round numbers
experienceSchema.pre('save', function(next) {
  if (this.rounds && this.rounds.length > 0) {
    this.rounds.forEach((round, index) => {
      if (!round.roundNumber) {
        round.roundNumber = index + 1;
      }
      if (!round.tips) {
        round.tips = '';
      }
    });
  }
  next();
});

// Pre-update middleware for findByIdAndUpdate
experienceSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  if (update.rounds && update.rounds.length > 0) {
    update.rounds.forEach((round, index) => {
      if (!round.roundNumber) {
        round.roundNumber = index + 1;
      }
      if (!round.tips) {
        round.tips = '';
      }
    });
  }
  next();
});

// Methods
// Use atomic updates for view tracking to avoid triggering full-document
// validation (some older documents may be missing newly-required fields).
experienceSchema.methods.incrementViews = function() {
  // Increment views directly in the DB without calling save()
  return this.constructor.findByIdAndUpdate(
    this._id,
    { $inc: { views: 1 } },
    { new: true }
  ).exec();
};

experienceSchema.methods.addUniqueView = function(userId) {
  // Add a unique view only if the user hasn't viewed before, and increment
  // views atomically. This avoids loading/saving the document and any
  // validation that would be triggered by save().
  return this.constructor.findOneAndUpdate(
    { _id: this._id, 'uniqueViews.userId': { $ne: userId } },
    { $inc: { views: 1 }, $push: { uniqueViews: { userId } } },
    { new: true }
  ).exec().then(result => {
    // If result is null, the user already had a unique view; resolve with
    // the current document context to preserve previous behavior.
    if (!result) return Promise.resolve(this);
    return result;
  });
};

experienceSchema.methods.toggleVote = function(userId, voteType) {
  const upvoteIndex = this.upvotes.findIndex(vote => 
    vote.userId.toString() === userId.toString()
  );
  const downvoteIndex = this.downvotes.findIndex(vote => 
    vote.userId.toString() === userId.toString()
  );

  // Remove existing votes
  if (upvoteIndex > -1) this.upvotes.splice(upvoteIndex, 1);
  if (downvoteIndex > -1) this.downvotes.splice(downvoteIndex, 1);

  // Add new vote if different from existing
  if (voteType === 'upvote' && upvoteIndex === -1) {
    this.upvotes.push({ userId });
  } else if (voteType === 'downvote' && downvoteIndex === -1) {
    this.downvotes.push({ userId });
  }

  return this.save();
};

module.exports = mongoose.model('Experience', experienceSchema);
