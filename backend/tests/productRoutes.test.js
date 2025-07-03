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
        .send({
          name: 'Test Product',
          price: 100,
          description: 'This is a test product.',
          category: category._id,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Product created successfully');
    });
  });

  describe('GET /api/products', () => {
    it('should get all products', async () => {
      await Product.create({
        name: 'Test Product',
        price: 100,
        description: 'This is a test product.',
        category: category._id,
      });

      const res = await request(app).get('/api/products');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].name).toEqual('Test Product');
    });
  });

  describe('GET /api/products/:id', () => {
    it('should get a single product', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        description: 'This is a test product.',
        category: category._id,
      });

      const res = await request(app).get(`/api/products/${product._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Test Product');
    });
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
        .send({
          price: 200,
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Product updated successfully');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('should delete a product', async () => {
      const product = await Product.create({
        name: 'Test Product',
        price: 100,
        description: 'This is a test product.',
        category: category._id,
      });

      const res = await request(app).delete(`/api/products/${product._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Product deleted successfully');
    });
  });
});