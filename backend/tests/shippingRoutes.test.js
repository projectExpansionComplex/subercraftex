const request = require('supertest');
const app = require('../src/server');
const Shipping = require('../models/shippingAndDeliveryModel');
const User = require('../models/userModel');
const mongoose = require('mongoose');
const { globalToken, globalUser } = require('../config/jest.setup');

describe('Shipping Routes', () => {
  let user;

  beforeEach(async () => {
    user = await User.create({
      first_name: 'John',
      last_name: 'Doe',
      email: 'johndoe@example.com',
      password: 'password123',
      user_type: 'individual'
    });
  });

  afterEach(async () => {
    await Shipping.deleteMany({});
    await User.deleteMany({});
  });

  describe('POST /api/shipping', () => {
    it('should create a new shipping option', async () => {
      const res = await request(app)
        .post('/api/shipping')
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          address: {
            street: '123 Test St',
            city: 'Test City',
            state: 'TS',
            zipCode: '12345',
            country: 'TestLand',
          },
          shippingMethod: 'standard',
          cost: 10,
          user: globalUser._id,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Shipping option created successfully');
    }, 30000);
  });

  describe('GET /api/shipping', () => {
    it('should get all shipping options', async () => {
      await Shipping.create({
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'TestLand',
        },
        shippingMethod: 'standard',
        cost: 10,
        user: globalUser._id,
      });

      const res = await request(app)
        .get('/api/shipping')
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].shippingMethod).toEqual('standard');
    }, 30000);
  });

  describe('GET /api/shipping/:id', () => {
    it('should get a single shipping option', async () => {
      const shipping = await Shipping.create({
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'TestLand',
        },
        shippingMethod: 'standard',
        cost: 10,
        user: globalUser._id,
      });

      const res = await request(app)
        .get(`/api/shipping/${shipping._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.shippingMethod).toEqual('standard');
    }, 30000);
  });

  describe('PUT /api/shipping/:id', () => {
    it('should update a shipping option', async () => {
      const shipping = await Shipping.create({
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'TestLand',
        },
        shippingMethod: 'standard',
        cost: 10,
        user: globalUser._id,
      });

      const res = await request(app)
        .put(`/api/shipping/${shipping._id}`)
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          shippingMethod: 'express',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Shipping option updated successfully');
    }, 30000);
  });

  describe('DELETE /api/shipping/:id', () => {
    it('should delete a shipping option', async () => {
      const shipping = await Shipping.create({
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'TestLand',
        },
        shippingMethod: 'standard',
        cost: 10,
        user: globalUser._id,
      });

      const res = await request(app)
        .delete(`/api/shipping/${shipping._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Shipping option deleted successfully');
    }, 30000);
  });
});