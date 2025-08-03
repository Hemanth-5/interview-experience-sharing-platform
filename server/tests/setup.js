// Test setup file
require('dotenv').config({ path: '.env.test' });

// Suppress console.log during tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://localhost:27017/interview-platform-test';
process.env.SESSION_SECRET = 'test-secret';

// Mock external services
jest.mock('../config/cloudinary', () => ({
  uploader: {
    destroy: jest.fn().mockResolvedValue({ result: 'ok' })
  },
  utils: {
    api_sign_request: jest.fn().mockReturnValue('mock-signature')
  }
}));
