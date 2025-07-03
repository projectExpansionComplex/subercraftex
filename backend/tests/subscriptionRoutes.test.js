const request = require('supertest');
const app = require('../src/server');
const Subscription = require('../models/Subscription');
const { globalToken } = require('../config/jest.setup');

describe('Subscription Routes', () => {
  afterEach(async () => {
    await Subscription.deleteMany({});
  });

  describe('POST /api/subscriptions', () => {
    it('should create a new subscription', async () => {
      const res = await request(app)
        .post('/api/subscriptions')
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          email: 'test@example.com',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Subscription created successfully');
    }, 30000);
  });

  describe('GET /api/subscriptions', () => {
    it('should get all subscriptions', async () => {
      await Subscription.create({
        email: 'test@example.com',
      });

      const res = await request(app)
        .get('/api/subscriptions')
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].email).toEqual('test@example.com');
    }, 30000);
  });

  describe('GET /api/subscriptions/:id', () => {
    it('should get a single subscription', async () => {
      const subscription = await Subscription.create({
        email: 'test@example.com',
      });

      const res = await request(app)
        .get(`/api/subscriptions/${subscription._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toEqual('test@example.com');
    }, 30000);
  });

  describe('DELETE /api/subscriptions/:id', () => {
    it('should delete a subscription', async () => {
      const subscription = await Subscription.create({
        email: 'test@example.com',
      });

      const res = await request(app)
        .delete(`/api/subscriptions/${subscription._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Subscription deleted successfully');
    }, 30000);
  });
});
