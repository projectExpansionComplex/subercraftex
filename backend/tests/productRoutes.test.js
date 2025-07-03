const request = require('supertest');
const app = require('../src/server');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');
const { globalToken } = require('../config/jest.setup');

describe('Product Routes', () => {
  let category;

  beforeEach(async () => {
    category = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
    });
  });

  afterEach(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});
  });

  describe('POST /api/products', () => {
    it('should create a new product', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          name: 'Test Product',
          price: 100,
          description: 'This is a test product.',
          category: category._id,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Product created successfully');
    }, 30000);
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      await Product.create({
        name: 'Test Product',
        price: 100,
        description: 'This is a test product.',
        category: category._id,
      });

      const res = await request(app)
        .get('/api/products')
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].name).toEqual('Test Product');
    }, 30000);
  });

  describe('GET /api/products/:id', () => {
    it('should get a single product', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        description: 'This is a test product.',
        category: category._id,
      });

      const res = await request(app)
        .get(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Test Product');
    }, 30000);
  });

  describe('PUT /api/products/:id', () => {
    it('should update a product', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        description: 'This is a test product.',
        category: category._id,
      });

      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          price: 200,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Product updated successfully');
    }, 30000);
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        description: 'This is a test product.',
        category: category._id,
      });

      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Product deleted successfully');
    }, 30000);
  });
});