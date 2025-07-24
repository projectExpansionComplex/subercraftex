require('dotenv').config();
const request = require('supertest');
const app = require('../src/server');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Announcement = require('../models/Announcement');

describe('Announcement Routes', () => {
  let globalToken;
  let globalUser;

  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI);

    // Create a test user and get a token
    const password = 'testpassword123';
    const hashedPassword = await bcrypt.hash(password, 10);
    globalUser = await User.create({
      first_name: 'Test',
      last_name: 'User',
      email: `test${Date.now()}@example.com`,
      password: hashedPassword,
      user_type: 'individual',
      role: 'admin',
      username: 'testuser' + Date.now(),
      uid: 'testuid' + Date.now(),
    });

    globalToken = jwt.sign({ id: globalUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

  }, 60000);

  afterEach(async () => {
    await Announcement.deleteMany({});
    await User.deleteMany({}); // Clean up users created in tests
  }, 60000);

  afterAll(async () => {
    await mongoose.connection.close();
  }, 60000);

  describe('POST /api/announcements', () => {
    it('should create a new announcement as an admin', async () => {
      const res = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          title: 'New Announcement',
          message: 'This is a test announcement.',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('title', 'New Announcement');
      expect(res.body).toHaveProperty('message', 'This is a test announcement.');
    }, 30000);

    it('should not create a new announcement without authentication', async () => {
      const res = await request(app)
        .post('/api/announcements')
        .send({
          title: 'New Announcement',
          message: 'This is a test announcement.',
        });

      expect(res.statusCode).toEqual(401);
    }, 30000);

    it('should not create a new announcement without admin role', async () => {
      // Create a non-admin user
      const nonAdminUser = await User.create({
        first_name: 'Non',
        last_name: 'Admin',
        email: `nonadmin${Date.now()}@example.com`,
        password: await bcrypt.hash('password123', 10),
        user_type: 'individual',
        role: 'user',
        username: `nonadminuser${Date.now()}`,
        uid: `nonadminuid${Date.now()}`,
      });

      const nonAdminToken = jwt.sign({ id: nonAdminUser._id }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });

      const res = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${nonAdminToken}`)
        .send({
          title: 'New Announcement',
          message: 'This is a test announcement.',
        });

      expect(res.statusCode).toEqual(403);
    }, 30000);
  });

  describe('GET /api/announcements', () => {
    it('should get all announcements', async () => {
      await Announcement.create({
        title: 'Announcement 1',
        message: 'Message 1',
      });
      await Announcement.create({
        title: 'Announcement 2',
        message: 'Message 2',
      });

      const res = await request(app).get('/api/announcements');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(2);
      expect(res.body[0]).toHaveProperty('title', 'Announcement 1');
    }, 30000);
  });
});