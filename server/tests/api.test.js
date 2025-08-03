const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');
const User = require('../models/User');
const Experience = require('../models/Experience');

// Test database
const MONGODB_URI = process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017/interview-platform-test';

describe('Authentication Routes', () => {
  beforeAll(async () => {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await User.deleteMany({});
    await Experience.deleteMany({});
  });

  describe('GET /auth/status', () => {
    it('should return not authenticated for unauthenticated user', async () => {
      const res = await request(app)
        .get('/auth/status')
        .expect(200);

      expect(res.body.isAuthenticated).toBe(false);
      expect(res.body.user).toBe(null);
    });
  });

  describe('GET /auth/user', () => {
    it('should return 401 for unauthenticated user', async () => {
      const res = await request(app)
        .get('/auth/user')
        .expect(401);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Not authenticated');
    });
  });
});

describe('Experience Routes', () => {
  let user;

  beforeEach(async () => {
    // Create a test user
    user = new User({
      googleId: 'test123',
      email: 'test@university.edu',
      name: 'Test User',
      role: 'Student'
    });
    await user.save();
  });

  describe('GET /api/experiences', () => {
    it('should return empty array when no experiences exist', async () => {
      const res = await request(app)
        .get('/api/experiences')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
      expect(res.body.pagination.totalDocuments).toBe(0);
    });

    it('should return experiences with pagination', async () => {
      // Create test experiences
      const experience1 = new Experience({
        userId: user._id,
        companyInfo: {
          companyName: 'Google',
          role: 'Software Engineer Intern',
          department: 'Engineering',
          internshipType: 'Summer',
          duration: '3 months',
          location: 'On-site',
          applicationDate: new Date()
        },
        rounds: [{
          roundNumber: 1,
          roundType: 'Technical',
          duration: 60,
          technicalQuestions: [{
            question: 'Reverse a linked list',
            difficulty: 'Medium',
            topics: ['Linked List']
          }],
          behavioralQuestions: [],
          roundResult: 'Selected',
          tips: 'Practice data structures',
          overallExperience: 4
        }],
        overallRating: 4,
        finalResult: 'Selected',
        wouldRecommend: true,
        preparationTime: 4,
        keyTips: 'Practice coding',
        mistakesToAvoid: 'Don\'t panic',
        backgroundInfo: {
          yearOfStudy: '3rd Year',
          skills: ['JavaScript', 'Python']
        }
      });

      await experience1.save();

      const res = await request(app)
        .get('/api/experiences')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].companyInfo.companyName).toBe('Google');
    });
  });
});

describe('Upload Routes', () => {
  it('should require authentication for file upload', async () => {
    const res = await request(app)
      .post('/api/upload/single')
      .expect(401);

    expect(res.body.message).toBe('Authentication required');
  });
});

describe('Analytics Routes', () => {
  describe('GET /api/analytics/trending', () => {
    it('should return trending data structure', async () => {
      const res = await request(app)
        .get('/api/analytics/trending')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('topCompanies');
      expect(res.body.data).toHaveProperty('popularRoles');
      expect(res.body.data).toHaveProperty('commonSkills');
      expect(res.body.data).toHaveProperty('internshipTypes');
      expect(res.body.data).toHaveProperty('locationStats');
    });
  });
});

describe('User Routes', () => {
  describe('GET /api/users/leaderboard', () => {
    it('should return leaderboard data', async () => {
      const res = await request(app)
        .get('/api/users/leaderboard')
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });
});
