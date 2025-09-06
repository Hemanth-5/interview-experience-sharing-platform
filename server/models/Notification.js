const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'experience_flagged',
      'experience_unflagged', 
      'experience_approved',
      'experience_rejected',
      'comment_on_experience',
      'upvote_milestone',
      'admin_message',
      'company_creation_request',
      'company_creation_approved',
      'company_creation_rejected'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  relatedExperience: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Experience',
    default: null
  },
  relatedComment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment', 
    default: null
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
  actionUrl: {
    type: String, // URL to take action (e.g., edit experience, view details)
    default: null
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed, // Additional data specific to notification type
    default: null
  },
  // Mark if this notification is an announcement/news
  announcement: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for better query performance
notificationSchema.index({ recipient: 1, read: 1 });
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

// Auto-delete read notifications older than 30 days
notificationSchema.index({ 
  readAt: 1 
}, { 
  expireAfterSeconds: 30 * 24 * 60 * 60, // 30 days
  partialFilterExpression: { read: true }
});

// Method to mark as read
notificationSchema.methods.markAsRead = function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    return this.save();
  }
  return Promise.resolve(this);
};

// Static method to create notification
notificationSchema.statics.createNotification = async function(notificationData) {
  try {
    // Check user's notification preferences before creating
    const User = require('./User');
    const recipient = await User.findById(notificationData.recipient);
    
    if (!recipient) {
      throw new Error('Recipient not found');
    }

    // Check if user has browser notifications enabled
    const browserNotificationsEnabled = recipient.preferences?.notifications?.browser !== false;
    
    // Only create notification if user has browser notifications enabled
    if (browserNotificationsEnabled) {
      const notification = new this(notificationData);
      await notification.save();
      
      // TODO: Add email notification logic here if email notifications are enabled
      // const emailNotificationsEnabled = recipient.preferences?.notifications?.email !== false;
      // if (emailNotificationsEnabled) {
      //   // Send email notification
      // }
      
      return notification;
    }
    
    return null; // No notification created due to user preferences
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Static method to get unread count for a user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({ recipient: userId, read: false });
};

module.exports = mongoose.model('Notification', notificationSchema);
