const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

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
  await mongoose.connect('mongodb+srv://subercraftex:subercraftexpass@cluster0.2a7nq.mongodb.net/ecommerce-test');

  // Create a test user and get a token
  const password = 'testpassword123';
  const hashedPassword = await bcrypt.hash(password, 10);
  globalUser = await User.create({
    first_name: 'Test',
    last_name: 'User',
    email: 'test@example.com',
    password: hashedPassword,
    user_type: 'individual',
    role: 'admin',
    username: 'testuser' + Date.now(), // Ensure unique username
  });

  const res = await request(app)
    .post('/api/users/login')
    .send({
      email: 'test@example.com',
      password: password,
    });

  globalToken = res.body.token;
}, 60000);

afterEach(async () => {
  await User.deleteMany({});
  await Announcement.deleteMany({});
  await Category.deleteMany({});
  await ComingSoon.deleteMany({});
  await Coupon.deleteMany({});
  await Product.deleteMany({});
  await Shipping.deleteMany({});
  await Subscription.deleteMany({});
  await Tag.deleteMany({});
  await Wishlist.deleteMany({});
}, 60000);

afterAll(async () => {
  await mongoose.connection.close();
}, 60000);

module.exports = { globalToken, globalUser };