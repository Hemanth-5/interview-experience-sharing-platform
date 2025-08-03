const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ 
    message: 'Authentication required',
    error: 'Please log in to access this resource'
  });
};

const isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'Admin') {
    return next();
  }
  return res.status(403).json({ 
    message: 'Admin access required',
    error: 'You do not have permission to access this resource'
  });
};

const isModerator = (req, res, next) => {
  if (req.isAuthenticated() && (req.user.role === 'Admin' || req.user.role === 'Moderator')) {
    return next();
  }
  return res.status(403).json({ 
    message: 'Moderator access required',
    error: 'You do not have permission to access this resource'
  });
};

const isOwnerOrAdmin = async (req, res, next) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        message: 'Authentication required',
        error: 'Please log in to access this resource'
      });
    }

    // Admin can access everything
    if (req.user.role === 'Admin') {
      return next();
    }

    // For experience routes, check if user owns the experience
    const resourceId = req.params.id || req.params.experienceId;
    if (resourceId) {
      const Experience = require('../models/Experience');
      const experience = await Experience.findById(resourceId);
      
      if (!experience) {
        return res.status(404).json({ 
          message: 'Resource not found' 
        });
      }

      if (experience.userId.toString() === req.user._id.toString()) {
        return next();
      }
    }

    return res.status(403).json({ 
      message: 'Access denied',
      error: 'You can only access your own resources'
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
};

module.exports = {
  isAuthenticated,
  isAdmin,
  isModerator,
  isOwnerOrAdmin
};
