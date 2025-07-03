const request = require('supertest');
const app = require('../src/server');
const ComingSoon = require('../models/ComingSoon');
require('dotenv').config();
const mongoose = require('mongoose');


const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');

// Import all models for cleanup



let globalToken;
let globalUser;

beforeAll(async () => {
  connectDB(); // Connect to the database using the same method as index.js

  // Create a test user and get a token
  const password = 'testpassword123';
  const hashedPassword = await bcrypt.hash(password, 10);
  globalUser = await User.create({
    first_name: 'Test',
    last_name: 'User',
    email: `test${Date.now()}@example.com`,
    password: hashedPassword,
    user_type: 'individual',
    role: 'superadmin',
    username: 'testuser' + Date.now(), // Ensure unique username
  });

  const res = await request(app)
    .post('/api/users/login')
    .send({
      email: globalUser.email,
      password: password,
    });
 
  globalToken = res._body.access_token;
 
  console.log('Global Token:', globalToken);
  console.log('Global User:', globalUser);
}, 60000);

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany();
  }
}, 60000);

afterAll(async () => {
  await mongoose.connection.close();
}, 60000);


describe('Coming Soon Routes', () => {
 
  afterEach(async () => {
    await ComingSoon.deleteMany({});
  });

  describe('POST /api/coming-soon', () => {
    it('should create a new coming soon entry', async () => {
      const res = await request(app)
       
        .post('/api/coming-soon')
        .set('Authorization', globalToken)
        .send({
          title: 'New Coming Soon Item',
          description: 'This is a test coming soon item.',
          launchDate: new Date(),
        });

 
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('title', 'New Coming Soon Item');
      expect(res.body).toHaveProperty('description', 'This is a test coming soon item.');
      expect(res.body).toHaveProperty('launchDate');
    }, 30000);
  });
});