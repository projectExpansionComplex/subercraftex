const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../src/server');
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');

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