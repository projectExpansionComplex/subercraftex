const request = require('supertest');
const app = require('../src/server');
const Tag = require('../models/tagModel');
const { globalToken } = require('../config/jest.setup');

describe('Tag Routes', () => {
  afterEach(async () => {
    await Tag.deleteMany({});
  });

  describe('POST /api/tags', () => {
    it('should create a new tag', async () => {
      const res = await request(app)
        .post('/api/tags')
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          name: 'Test Tag',
          slug: 'test-tag',
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Tag created successfully');
    }, 30000);
  });

  describe('GET /api/tags', () => {
    it('should get all tags', async () => {
      await Tag.create({
        name: 'Test Tag',
        slug: 'test-tag',
      });

      const res = await request(app)
        .get('/api/tags')
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].name).toEqual('Test Tag');
    }, 30000);
  });

  describe('GET /api/tags/:id', () => {
    it('should get a single tag', async () => {
      const tag = await Tag.create({
        name: 'Test Tag',
        slug: 'test-tag',
      });

      const res = await request(app)
        .get(`/api/tags/${tag._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Test Tag');
    }, 30000);
  });

  describe('PUT /api/tags/:id', () => {
    it('should update a tag', async () => {
      const tag = await Tag.create({
        name: 'Test Tag',
        slug: 'test-tag',
      });

      const res = await request(app)
        .put(`/api/tags/${tag._id}`)
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          name: 'Updated Tag',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Tag updated successfully');
    }, 30000);
  });

  describe('DELETE /api/tags/:id', () => {
    it('should delete a tag', async () => {
      const tag = await Tag.create({
        name: 'Test Tag',
        slug: 'test-tag',
      });

      const res = await request(app)
        .delete(`/api/tags/${tag._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Tag deleted successfully');
    }, 30000);
  });
});
