const request = require('supertest');
const app = require('../src/server');
const Coupon = require('../models/discountAndCouponModel');
const { globalToken } = require('../config/jest.setup');

describe('Coupon Routes', () => {
  afterEach(async () => {
    await Coupon.deleteMany({});
  });

  describe('POST /api/coupons', () => {
    it('should create a new coupon', async () => {
      const res = await request(app)
        .post('/api/coupons')
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          code: 'TESTCOUPON',
          discountValue: 10,
          discountType: 'percentage',
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 86400000), // 1 day from now
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Coupon created successfully');
    }, 30000);
  });

  describe('GET /api/coupons', () => {
    it('should get all coupons', async () => {
      await Coupon.create({
        code: 'TESTCOUPON',
        discountValue: 10,
        discountType: 'percentage',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 86400000),
      });

      const res = await request(app)
        .get('/api/coupons')
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].code).toEqual('TESTCOUPON');
    }, 30000);
  });

  describe('GET /api/coupons/:id', () => {
    it('should get a single coupon', async () => {
      const coupon = await Coupon.create({
        code: 'TESTCOUPON',
        discountValue: 10,
        discountType: 'percentage',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 86400000),
      });

      const res = await request(app)
        .get(`/api/coupons/${coupon._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.code).toEqual('TESTCOUPON');
    }, 30000);
  });

  describe('PUT /api/coupons/:id', () => {
    it('should update a coupon', async () => {
      const coupon = await Coupon.create({
        code: 'TESTCOUPON',
        discountValue: 10,
        discountType: 'percentage',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 86400000),
      });

      const res = await request(app)
        .put(`/api/coupons/${coupon._id}`)
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          discountValue: 20,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Coupon updated successfully');
    }, 30000);
  });

  describe('DELETE /api/coupons/:id', () => {
    it('should delete a coupon', async () => {
      const coupon = await Coupon.create({
        code: 'TESTCOUPON',
        discountValue: 10,
        discountType: 'percentage',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 86400000),
      });

      const res = await request(app)
        .delete(`/api/coupons/${coupon._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Coupon deleted successfully');
    }, 30000);
  });
});
