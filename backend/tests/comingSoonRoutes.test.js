const request = require('supertest');
const app = require('../src/server');
const ComingSoon = require('../models/ComingSoon');

describe('Coming Soon Routes', () => {
  afterEach(async () => {
    await ComingSoon.deleteMany({});
  });

  describe('POST /api/coming-soon', () => {
    it('should subscribe an email to the coming soon list', async () => {
      const res = await request(app)
        .post('/api/coming-soon')
        .send({
          email: 'test@example.com',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'You have successfully subscribed to our coming soon list.');
    });
  });

  describe('GET /api/coming-soon', () => {
    it('should get all subscribed emails', async () => {
      await ComingSoon.create({
        email: 'test@example.com',
      });

      const res = await request(app).get('/api/coming-soon');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].email).toEqual('test@example.com');
    });
  });
});
