const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  experienceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experience',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  parentCommentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  replies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
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
  isEdited: {
    type: Boolean,
    default: false
  },
  editedAt: {
    type: Date,
    default: null
  },
  isDeleted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
commentSchema.index({ experienceId: 1, createdAt: -1 });
commentSchema.index({ userId: 1 });
commentSchema.index({ parentCommentId: 1 });

// Virtual for upvote count
commentSchema.virtual('upvoteCount').get(function() {
  return this.upvotes.length;
});

// Virtual for downvote count
commentSchema.virtual('downvoteCount').get(function() {
  return this.downvotes.length;
});

// Ensure virtuals are included in JSON
commentSchema.set('toJSON', { virtuals: true });
commentSchema.set('toObject', { virtuals: true });

// Methods
commentSchema.methods.toggleVote = function(userId, voteType) {
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

module.exports = mongoose.model('Comment', commentSchema);
