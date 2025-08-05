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
    },
    tips: {
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
  interviewerDetails: [{
    role: {
      type: String,
      default: null
    },
    team: {
      type: String,
      default: null
    },
    experienceLevel: {
      type: String,
      enum: ['Junior', 'Senior', 'Lead', 'Manager', 'Director'],
      default: null
    }
  }],
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
    required: true
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
  country: {
    type: String,
    default: null
  },
  stipend: {
    type: Number,
    default: null
  },
  currency: {
    type: String,
    default: 'USD'
  },
  applicationDate: {
    type: Date,
    required: true
  },
  resultDate: {
    type: Date,
    default: null
  }
});

const backgroundInfoSchema = new mongoose.Schema({
  cgpa: {
    type: Number,
    min: 0,
    max: 10,
    default: null
  },
  previousInternships: {
    type: Number,
    min: 0,
    default: 0
  },
  relevantProjects: [{
    type: String
  }],
  skills: [{
    type: String
  }],
  yearOfStudy: {
    type: String,
    enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Postgraduate'],
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
  // Background Info
  backgroundInfo: {
    type: backgroundInfoSchema,
    required: true
  },
  // Metadata
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isVerified: {
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
  // Files
  attachments: [{
    fileName: {
      type: String,
      required: true
    },
    fileUrl: {
      type: String,
      required: true
    },
    fileType: {
      type: String,
      required: true
    },
    fileSize: {
      type: Number,
      required: true
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  // Comments
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
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
  return this.upvotes.length;
});

// Virtual for downvote count
experienceSchema.virtual('downvoteCount').get(function() {
  return this.downvotes.length;
});

// Virtual for comment count
experienceSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for net score
experienceSchema.virtual('netScore').get(function() {
  return this.upvotes.length - this.downvotes.length;
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
experienceSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

experienceSchema.methods.addUniqueView = function(userId) {
  const existingView = this.uniqueViews.find(view => 
    view.userId.toString() === userId.toString()
  );
  
  if (!existingView) {
    this.uniqueViews.push({ userId });
    this.views += 1;
    return this.save();
  }
  return Promise.resolve(this);
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
