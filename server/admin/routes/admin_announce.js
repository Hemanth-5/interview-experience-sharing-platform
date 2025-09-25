const express = require('express');
const { isAdmin, isAuthenticated } = require('../../middleware/auth');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get users for targeted notifications
// @access  Admin
router.get('/users', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { role = 'Student', limit = 100, page = 1, search = '' } = req.query;
    const skip = (page - 1) * parseInt(limit);
    
    // Build search query
    const searchQuery = {
      role: role
    };
    
    if (search) {
      searchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(searchQuery, 'name email createdAt')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);
    
    const totalUsers = await User.countDocuments(searchQuery);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          hasNext: skip + users.length < totalUsers,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users.',
      error: error.message 
    });
  }
});

// @route   GET /api/admin/notifications/stats
// @desc    Get notification statistics
// @access  Admin
router.get('/notifications/stats', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const totalNotifications = await Notification.countDocuments();
    const readNotifications = await Notification.countDocuments({ read: true });
    const unreadNotifications = await Notification.countDocuments({ read: false });
    
    const notificationsByType = await Notification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const recentNotifications = await Notification.find()
      .populate('recipient', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('type title message read createdAt recipient');
    
    res.json({
      success: true,
      data: {
        stats: {
          total: totalNotifications,
          read: readNotifications,
          unread: unreadNotifications,
          readRate: totalNotifications > 0 ? ((readNotifications / totalNotifications) * 100).toFixed(1) : 0
        },
        typeBreakdown: notificationsByType,
        recentNotifications
      }
    });
  } catch (error) {
    console.error('Error fetching notification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics.',
      error: error.message
    });
  }
});

// @route   POST /api/admin/announce
// @desc    Send announcement/news to all users as notification
// @access  Admin
router.post('/announce', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, message, priority = 'medium' } = req.body;
    
    // Validation
    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and message are required.' 
      });
    }
    
    if (title.length > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title must be 100 characters or less.' 
      });
    }
    
    if (message.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message must be 1000 characters or less.' 
      });
    }
    
    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid priority level.' 
      });
    }
    
    // Find all users
    const users = await User.find({}, '_id');
    
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No users found to send announcement to.' 
      });
    }
    
    const notifications = users.map(user => ({
      recipient: user._id,
      type: 'admin_message',
      title: title.trim(),
      message: message.trim(),
      priority: priority, // Add priority as direct field
      metadata: { 
        announcement: true, 
        version: process.env.PLATFORM_VERSION || '1.0.0',
        sentBy: req.user._id,
        sentAt: new Date()
      }
    }));
    
    // Insert notifications in bulk
    await Notification.insertMany(notifications);
    
    res.json({ 
      success: true, 
      message: `Announcement sent to ${users.length} user${users.length !== 1 ? 's' : ''}.`,
      data: {
        recipientCount: users.length,
        priority,
        timestamp: new Date()
      }
    });
  } catch (error) {
    console.error('Error sending announcement:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send announcement.',
      error: error.message 
    });
  }
});

// @route   POST /api/admin/notifications/send
// @desc    Send notification to selected users
// @access  Admin
router.post('/notifications/send', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { userIds, title, message, priority = 'medium', type = 'admin_announcement' } = req.body;
    
    // Validation
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'User IDs array is required and must not be empty.' 
      });
    }
    
    if (!title || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title and message are required.' 
      });
    }
    
    if (title.length > 100) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title must be 100 characters or less.' 
      });
    }
    
    if (message.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Message must be 1000 characters or less.' 
      });
    }
    
    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'urgent'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid priority level.' 
      });
    }
    
    // Validate notification type
    const validTypes = ['admin_announcement', 'admin_message', 'system_update', 'maintenance'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid notification type.' 
      });
    }
    
    // Check for duplicate user IDs
    const uniqueUserIds = [...new Set(userIds)];
    if (uniqueUserIds.length !== userIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Duplicate user IDs found in the array.' 
      });
    }
    
    // Verify all user IDs exist and are students
    const users = await User.find({ 
      _id: { $in: uniqueUserIds },
      role: 'Student' // Only allow sending to students
    }, '_id name email');
    
    if (users.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No valid student users found with provided IDs.' 
      });
    }
    
    if (users.length !== uniqueUserIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: `Only ${users.length} out of ${uniqueUserIds.length} users are valid students.` 
      });
    }
    
    // Create notifications for selected users
    const notifications = users.map(user => ({
      recipient: user._id,
      type,
      title: title.trim(),
      message: message.trim(),
      priority: priority, // Add priority as direct field
      metadata: { 
        sentBy: req.user._id,
        sentAt: new Date(),
        targetedNotification: true,
        adminName: req.user.name || 'Admin',
        batchId: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    }));
    
    // Insert notifications in bulk
    await Notification.insertMany(notifications);
    
    res.json({ 
      success: true, 
      message: `Notification sent to ${users.length} student${users.length !== 1 ? 's' : ''} successfully.`,
      data: {
        recipientCount: users.length,
        recipients: users.map(u => ({ id: u._id, name: u.name, email: u.email })),
        priority,
        type,
        timestamp: new Date(),
        batchId: notifications[0]?.metadata?.batchId
      }
    });
  } catch (error) {
    console.error('Error sending targeted notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send notification.',
      error: error.message 
    });
  }
});

// @route   DELETE /api/admin/notifications/:batchId
// @desc    Delete notifications by batch ID (for admin cleanup)
// @access  Admin
router.delete('/notifications/:batchId', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { batchId } = req.params;
    
    if (!batchId) {
      return res.status(400).json({
        success: false,
        message: 'Batch ID is required.'
      });
    }
    
    const result = await Notification.deleteMany({
      'metadata.batchId': batchId,
      'metadata.sentBy': req.user._id // Only allow deleting own notifications
    });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No notifications found with the provided batch ID.'
      });
    }
    
    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} notification${result.deletedCount !== 1 ? 's' : ''}.`,
      data: {
        deletedCount: result.deletedCount,
        batchId
      }
    });
  } catch (error) {
    console.error('Error deleting notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notifications.',
      error: error.message
    });
  }
});

module.exports = router;
