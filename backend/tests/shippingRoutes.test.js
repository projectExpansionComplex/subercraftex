const request = require('supertest');
const app = require('../src/server');
const Shipping = require('../models/shippingAndDeliveryModel');

describe('Shipping Routes', () => {
  afterEach(async () => {
    await Shipping.deleteMany({});
  });

  describe('POST /api/shipping', () => {
    it('should create a new shipping option', async () => {
      const res = await request(app)
        .post('/api/shipping')
        .send({
          name: 'Standard Shipping',
          price: 10,
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Shipping option created successfully');
    });
  });

  describe('GET /api/shipping', () => {
    it('should get all shipping options', async () => {
      await Shipping.create({
        name: 'Standard Shipping',
        price: 10,
      });

      const res = await request(app).get('/api/shipping');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].name).toEqual('Standard Shipping');
    });
  });

  describe('GET /api/shipping/:id', () => {
    it('should get a single shipping option', async () => {
      const shipping = await Shipping.create({
        name: 'Standard Shipping',
        price: 10,
      });

      const res = await request(app).get(`/api/shipping/${shipping._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Standard Shipping');
    });
  });

  describe('PUT /api/shipping/:id', () => {
    it('should update a shipping option', async () => {
      const shipping = await Shipping.create({
        name: 'Standard Shipping',
        price: 10,
      });

      const res = await request(app)
        .put(`/api/shipping/${shipping._id}`)
        .send({
          price: 20,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Shipping option updated successfully');
    });
  });

  describe('DELETE /api/shipping/:id', () => {
    it('should delete a shipping option', async () => {
      const shipping = await Shipping.create({
        name: 'Standard Shipping',
        price: 10,
      });

      const res = await request(app).delete(`/api/shipping/${shipping._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Shipping option deleted successfully');
    });
  });
});
