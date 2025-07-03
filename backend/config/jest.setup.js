require('dotenv').config();
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');

// Import all models for cleanup
const Announcement = require('../models/Announcement');
const Category = require('../models/categoryModel');
const ComingSoon = require('../models/ComingSoon');
const Coupon = require('../models/discountAndCouponModel');
const Product = require('../models/productModel');
const Shipping = require('../models/shippingAndDeliveryModel');
const Subscription = require('../models/Subscription');
const Tag = require('../models/tagModel');
const Wishlist = require('../models/wishlistModel');

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

module.exports = { globalToken, globalUser };