const request = require('supertest');
const app = require('../src/server');
const Coupon = require('../models/discountAndCouponModel');

describe('Coupon Routes', () => {
  afterEach(async () => {
    await Coupon.deleteMany({});
  });

  describe('POST /api/coupons', () => {
    it('should create a new coupon', async () => {
      const res = await request(app)
        .post('/api/coupons')
        .send({
          code: 'TESTCOUPON',
          discount: 10,
          validFrom: new Date(),
          validUntil: new Date(Date.now() + 86400000), // 1 day from now
          discountValue: 10,
          discountType: 'percentage',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Coupon created successfully');
    });
  });

  describe('GET /api/coupons', () => {
    it('should get all coupons', async () => {
      await Coupon.create({
        code: 'TESTCOUPON',
        discount: 10,
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 86400000),
        discountValue: 10,
        discountType: 'percentage',
      });

      const res = await request(app).get('/api/coupons');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].code).toEqual('TESTCOUPON');
    });
  });

  describe('GET /api/coupons/:id', () => {
    it('should get a single coupon', async () => {
      const coupon = await Coupon.create({
        code: 'TESTCOUPON',
        discount: 10,
      });

      const res = await request(app).get(`/api/coupons/${coupon._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.code).toEqual('TESTCOUPON');
    });
  });

  describe('PUT /api/coupons/:id', () => {
    it('should update a coupon', async () => {
      const coupon = await Coupon.create({
        code: 'TESTCOUPON',
        discount: 10,
      });

      const res = await request(app)
        .put(`/api/coupons/${coupon._id}`)
        .send({
          discount: 20,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Coupon updated successfully');
    });
  });

  describe('DELETE /api/coupons/:id', () => {
    it('should delete a coupon', async () => {
      const coupon = await Coupon.create({
        code: 'TESTCOUPON',
        discount: 10,
      });

      const res = await request(app).delete(`/api/coupons/${coupon._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Coupon deleted successfully');
    });
  });
});
