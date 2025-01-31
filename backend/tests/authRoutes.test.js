const request = require('supertest');
const app = require('../src/server'); // Your main app file
const User = require('../models/userModel'); // Path to your User model
const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const ResetToken = require("../models/resetTokenModel");
const ResetToken2 = require("../models/resetTokenModel2");
const crypto = require("crypto");

const createRandomBytes = () =>
  new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) reject(err);
      const token = buff.toString("hex");
      resolve(token);
    });
  });


describe('Authentication Routes', () => {
  beforeAll(async () => {
    // Connect to your test database
    try {
      await mongoose.connect('mongodb://localhost:27017/ecommerce-test', {
        
  
      });
  
      console.log("pesEcommers test MongoDB Connection Success 👍");
    } catch (error) {
      console.log("pesEcommers test MongoDB Connection Failed 💥");
      process.exit(1);
    }
  });

  afterEach(async () => {
    // Clean up the database between tests
    await User.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect from the test database
    await mongoose.connection.close();
  });

  describe('POST /api/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/register')
        .send({
          fullname:"siysinyuy",
	        username:"suber",
	        email:"mohamadsiysinyuy@gmail.com",
	        password:"msb1@@@@"
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('mohamadsiysinyuy@gmail.com');
    });

    it('should not register a user with an existing email', async () => {
      await User.create({
        fullname:"siysinyuy",
	        username:"suber",
	        email:"mohamadsiysinyuy@gmail.com",
	        password:"msb1@@@@"
      });

      const res = await request(app)
        .post('/api/register')
        .send({
          fullname:"siysinyuy",
	        username:"suber",
	        email:"mohamadsiysinyuy@gmail.com",
	        password:"msb1@@@@"
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'This email already exists.');
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      const salt = await bcrypt.genSalt(10);

      const passwordHash = await bcrypt.hash('msb1@@@@', salt);

      await User.create({
        fullname:"siysinyuy",
	        username:"suber",
	        email:"mohamadsiysinyuy@gmail.com",
	        password:passwordHash
      });
    });

    it('should log in an existing user', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email:"mohamadsiysinyuy@gmail.com",
	        password:"msb1@@@@"
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('access_token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('mohamadsiysinyuy@gmail.com');
    });

    it('should not log in a user with an incorrect password', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'mohamadsiysinyuy@gmail.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'Invalid Login credentials');
      expect(res.body).toHaveProperty('success', true);

    });

    it('should not log in a non-existent user', async () => {
      const res = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'msb1@@@@',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'Invalid Login credentials');
    });
  });

  describe('POST /api/forgotpassword', () => {
    it('should send a password reset link to email', async () => {
      await User.create({
        fullname:"siysinyuy",
	        username:"suber",
	        email:"mohamadsiysinyuy@gmail.com",
	        password:"msb1@@@@"
      });

      const res = await request(app)
        .post('/api/forgotpassword')
        .send({
          email: 'mohamadsiysinyuy@gmail.com',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('msg', 'Password reset link is sent to your email.');
    });

    it('should not send a reset link to a non-existent email', async () => {
      const res = await request(app)
        .post('/api/forgotpassword')
        .send({
          email: 'nonexistent@example.com',
        });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('msg', 'Email could not be sent');
    });
  });

  // describe('POST /api/reset-password/:token', () => {
  //   it('should reset the user’s password', async () => {
  //     await User.create({
  //       fullname:"siysinyuy",
	//         username:"suber",
	//         email:"mohamadsiysinyuy@gmail.com",
	//         password:"msb1@@@@"
  //     });
  //     const user_name = await User.findOne({ username: "suber" });

  //     const randomBytes = await createRandomBytes();
  //     //encripting the randomBytes
  //     const salt = await bcrypt.genSalt(10);
  //     const randomBytesHash = await bcrypt.hash(randomBytes, salt);

  //     const token = await ResetToken.create({
  //       owner: user_name._id,
  //       token: randomBytesHash,
  //     });
     

  //     const res = await request(app)
  //       .post(`/api/reset-password?token=${token}`)
  //       .send({
  //         password: 'newpassword123',
  //       });

  //     expect(res.statusCode).toEqual(200);
  //     expect(res.body).toHaveProperty('message', 'Password updated successfully');
  //   });

  //   it('should not reset the password if the token is invalid', async () => {
  //     const res = await request(app)
  //       .post('/api/reset-password/invalidToken')
  //       .send({
  //         password: 'newpassword123',
  //       });

  //     expect(res.statusCode).toEqual(400);
  //     expect(res.body).toHaveProperty('message', 'Invalid or expired token');
  //   });
  // });
});
