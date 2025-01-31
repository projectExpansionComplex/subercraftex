const request = require('supertest');
const app = require('../src/server');
const Tag = require('../models/tagModel');

describe('Tag Routes', () => {
  it('should create a new tag', async () => {
    const res = await request(app)
      .post('/api/tags')
      .send({
        name: 'New Arrival',
        slug: 'new-arrival',
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('name', 'New Arrival');
  });

  it('should fetch all tags', async () => {
    await Tag.create({
      name: 'New Arrival',
      slug: 'new-arrival',
    });

    const res = await request(app).get('/api/tags');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should fetch a single tag by ID', async () => {
    const tag = await Tag.create({
      name: 'New Arrival',
      slug: 'new-arrival',
    });

    const res = await request(app).get(`/api/tags/${tag._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'New Arrival');
  });

  it('should update a tag', async () => {
    const tag = await Tag.create({
      name: 'New Arrival',
      slug: 'new-arrival',
    });

    const res = await request(app)
      .put(`/api/tags/${tag._id}`)
      .send({ name: 'Updated Tag' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated Tag');
  });

  it('should delete a tag', async () => {
    const tag = await Tag.create({
      name: 'New Arrival',
      slug: 'new-arrival',
    });

    const res = await request(app).delete(`/api/tags/${tag._id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'Tag deleted successfully');
  });
});
