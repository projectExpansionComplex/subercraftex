const request = require('supertest');
const app = require('../src/server');
const Category = require('../models/categoryModel');

describe('Category Routes', () => {
  it('should create a new category', async () => {
    const res = await request(app)
      .post('/api/categories')
      .send({
        name: 'Electronics',
        slug: 'electronics',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'Electronics');
  });

  it('should fetch all categories', async () => {
    await Category.create({
      name: 'Electronics',
      slug: 'electronics',
    });

    const res = await request(app).get('/api/categories');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should fetch a single category by ID', async () => {
    const category = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
    });

    const res = await request(app).get(`/api/categories/${category._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Electronics');
  });

  it('should update a category', async () => {
    const category = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
    });

    const res = await request(app)
      .put(`/api/categories/${category._id}`)
      .send({ name: 'Updated Electronics' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated Electronics');
  });

  it('should delete a category', async () => {
    const category = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
    });

    const res = await request(app).delete(`/api/categories/${category._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Category deleted successfully');
  });
});
