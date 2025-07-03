const request = require('supertest');
const app = require('../src/server');
const Category = require('../models/categoryModel');
const { globalToken } = require('../config/jest.setup');

describe('Category Routes', () => {
  afterEach(async () => {
    await Category.deleteMany({});
  });

  describe('POST /api/categories', () => {
    it('should create a new category', async () => {
      const res = await request(app)
        .post('/api/categories')
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          name: 'Test Category',
          slug: 'test-category',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Category created successfully');
    }, 30000);
  });

  describe('GET /api/categories', () => {
    it('should get all categories', async () => {
      await Category.create({
        name: 'Test Category',
        slug: 'test-category',
      });

      const res = await request(app)
        .get('/api/categories')
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].name).toEqual('Test Category');
    }, 30000);
  });

  describe('GET /api/categories/:id', () => {
    it('should get a single category', async () => {
      const category = await Category.create({
        name: 'Test Category',
        slug: 'test-category',
      });

      const res = await request(app)
        .get(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Test Category');
    }, 30000);
  });

  describe('PUT /api/categories/:id', () => {
    it('should update a category', async () => {
      const category = await Category.create({
        name: 'Test Category',
        slug: 'test-category',
      });

      const res = await request(app)
        .put(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          name: 'Updated Category',
          slug: 'updated-category',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Category updated successfully');
    }, 30000);
  });

  describe('DELETE /api/categories/:id', () => {
    it('should delete a category', async () => {
      const category = await Category.create({
        name: 'Test Category',
        slug: 'test-category',
      });

      const res = await request(app)
        .delete(`/api/categories/${category._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Category deleted successfully');
    }, 30000);
  });
});
