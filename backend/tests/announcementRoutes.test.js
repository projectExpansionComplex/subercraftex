const request = require('supertest');
const app = require('../src/server');
const Announcement = require('../models/Announcement');

describe('Announcement Routes', () => {
  afterEach(async () => {
    await Announcement.deleteMany({});
  });

  describe('POST /api/announcements', () => {
    it('should create a new announcement', async () => {
      const res = await request(app)
        .post('/api/announcements')
        .send({
          title: 'New Announcement',
          message: 'This is a test announcement.',
          sentAt: new Date(),
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Announcement created successfully');
    });
  });

  describe('GET /api/announcements', () => {
    it('should get all announcements', async () => {
      await Announcement.create({
        title: 'New Announcement',
        content: 'This is a test announcement.',
        author: 'Admin',
      });

      const res = await request(app).get('/api/announcements');

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].title).toEqual('New Announcement');
    });
  });

  describe('GET /api/announcements/:id', () => {
    it('should get a single announcement', async () => {
      const announcement = await Announcement.create({
        title: 'New Announcement',
        content: 'This is a test announcement.',
        author: 'Admin',
      });

      const res = await request(app).get(`/api/announcements/${announcement._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('New Announcement');
    });
  });

  describe('PUT /api/announcements/:id', () => {
    it('should update an announcement', async () => {
      const announcement = await Announcement.create({
        title: 'New Announcement',
        content: 'This is a test announcement.',
        author: 'Admin',
      });

      const res = await request(app)
        .put(`/api/announcements/${announcement._id}`)
        .send({
          title: 'Updated Announcement',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Announcement updated successfully');
    });
  });

  describe('DELETE /api/announcements/:id', () => {
    it('should delete an announcement', async () => {
      const announcement = await Announcement.create({
        title: 'New Announcement',
        content: 'This is a test announcement.',
        author: 'Admin',
      });

      const res = await request(app).delete(`/api/announcements/${announcement._id}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Announcement deleted successfully');
    });
  });
});
