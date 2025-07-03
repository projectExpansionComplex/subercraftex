const request = require('supertest');
const app = require('../src/server');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

describe('Authentication Routes', () => {
  afterEach(async () => {
    await User.deleteMany({});
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'johndoe@example.com',
          password: 'password123',
          user_type: 'individual'
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'User registered successfully');
    });

    it('should not register a user with an existing email', async () => {
      await User.create({
        first_name: 'John',
        last_name: 'Doe',
        email: 'johndoe@example.com',
        password: 'password123',
        user_type: 'individual'
      });

      const res = await request(app)
        .post('/api/users/register')
        .send({
          first_name: 'John',
          last_name: 'Doe',
          email: 'johndoe@example.com',
          password: 'password123',
          user_type: 'individual'
        });

      expect(res.statusCode).toEqual(409);
      expect(res.body).toHaveProperty('message', 'User already exists');
    });
  });

  describe('POST /api/users/login', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('password123', salt);

      await User.create({
        first_name: 'John',
        last_name: 'Doe',
        email: 'johndoe@example.com',
        password: passwordHash,
        user_type: 'individual'
      });
    });

    it('should log in an existing user', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'johndoe@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not log in a user with an incorrect password', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'johndoe@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });

    it('should not log in a non-existent user', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});