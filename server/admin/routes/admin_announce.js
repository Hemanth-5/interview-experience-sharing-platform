const express = require('express');
const { isAdmin, isAuthenticated } = require('../../middleware/auth');
const Notification = require('../../models/Notification');
const User = require('../../models/User');
const router = express.Router();

// @route   POST /api/admin/announce
// @desc    Send announcement/news to all users as notification
// @access  Admin
router.post('/announce', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const { title, message } = req.body;
    if (!title || !message) {
      return res.status(400).json({ success: false, message: 'Title and message are required.' });
    }
    // Find all users
    const users = await User.find({}, '_id');
    const notifications = users.map(user => ({
      recipient: user._id,
      type: 'admin_message',
      title,
      message,
      metadata: { announcement: true, version: process.env.PLATFORM_VERSION || '1.0.0' }
    }));
    // Insert notifications in bulk
    await Notification.insertMany(notifications);
    res.json({ success: true, message: 'Announcement sent to all users.' });
  } catch (error) {
    console.error('Error sending announcement:', error);
    res.status(500).json({ success: false, message: 'Failed to send announcement.' });
  }
});

module.exports = router;
