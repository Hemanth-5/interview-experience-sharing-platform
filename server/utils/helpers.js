// Helper functions for data validation and formatting

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateUniversityEmail = (email) => {
  const eduRegex = /^[^\s@]+@[^\s@]+\.edu$/;
  return eduRegex.test(email);
};

const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/[<>]/g, '');
};

const generateSlug = (text) => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const calculateReadingTime = (text) => {
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const isValidObjectId = (id) => {
  const mongoose = require('mongoose');
  return mongoose.Types.ObjectId.isValid(id);
};

const paginate = (page, limit) => {
  const pageNum = Math.max(1, parseInt(page) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit) || 10));
  const skip = (pageNum - 1) * limitNum;
  
  return {
    page: pageNum,
    limit: limitNum,
    skip
  };
};

const buildSortObject = (sortBy, sortOrder = 'desc') => {
  const validSortFields = ['createdAt', 'updatedAt', 'views', 'rating', 'upvotes'];
  const field = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
  const order = sortOrder.toLowerCase() === 'asc' ? 1 : -1;
  
  if (field === 'upvotes') {
    return { 'upvotes': order };
  }
  
  return { [field]: order };
};

const calculateScore = (upvotes, downvotes, views, createdAt) => {
  const voteScore = (upvotes - downvotes) * 10;
  const viewScore = views * 0.1;
  const ageInHours = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  const ageMultiplier = Math.pow(0.99, ageInHours); // Decay factor
  
  return (voteScore + viewScore) * ageMultiplier;
};

const extractKeywords = (text, maxKeywords = 10) => {
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 3);
    
  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });
  
  return Object.entries(wordCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, maxKeywords)
    .map(([word]) => word);
};

const formatDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  
  const diffTime = Math.abs(end - start);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) {
    return `${diffDays} days`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    return `${months} month${months > 1 ? 's' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    return `${years} year${years > 1 ? 's' : ''}`;
  }
};

const validateFileType = (filename, allowedTypes) => {
  const extension = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

const createApiResponse = (success, message, data = null, pagination = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (pagination) response.pagination = pagination;
  return response;
};

module.exports = {
  validateEmail,
  validateUniversityEmail,
  sanitizeString,
  generateSlug,
  calculateReadingTime,
  formatFileSize,
  generateRandomString,
  isValidObjectId,
  paginate,
  buildSortObject,
  calculateScore,
  extractKeywords,
  formatDateRange,
  validateFileType,
  createApiResponse
};
