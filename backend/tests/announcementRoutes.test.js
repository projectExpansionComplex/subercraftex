const request = require('supertest');
const app = require('../src/server');
const Announcement = require('../models/Announcement');
const { globalToken } = require('../config/jest.setup');

describe('Announcement Routes', () => {
  afterEach(async () => {
    await Announcement.deleteMany({});
  });

  describe('POST /api/announcements', () => {
    it('should create a new announcement', async () => {
      const res = await request(app)
        .post('/api/announcements')
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          title: 'New Announcement',
          message: 'This is a test announcement.',
          sentAt: new Date(),
        });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Announcement created successfully');
    }, 30000);
  });

  describe('GET /api/announcements', () => {
    it('should get all announcements', async () => {
      await Announcement.create({
        title: 'New Announcement',
        message: 'This is a test announcement.',
        sentAt: new Date(),
      });

      const res = await request(app)
        .get('/api/announcements')
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0].title).toEqual('New Announcement');
    }, 30000);
  });

  describe('GET /api/announcements/:id', () => {
    it('should get a single announcement', async () => {
      const announcement = await Announcement.create({
        title: 'New Announcement',
        message: 'This is a test announcement.',
        sentAt: new Date(),
      });

      const res = await request(app)
        .get(`/api/announcements/${announcement._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.title).toEqual('New Announcement');
    }, 30000);
  });

  describe('PUT /api/announcements/:id', () => {
    it('should update an announcement', async () => {
      const announcement = await Announcement.create({
        title: 'New Announcement',
        message: 'This is a test announcement.',
        sentAt: new Date(),
      });

      const res = await request(app)
        .put(`/api/announcements/${announcement._id}`)
        .set('Authorization', `Bearer ${globalToken}`)
        .send({
          title: 'Updated Announcement',
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Announcement updated successfully');
    }, 30000);
  });

  describe('DELETE /api/announcements/:id', () => {
    it('should delete an announcement', async () => {
      const announcement = await Announcement.create({
        title: 'New Announcement',
        message: 'This is a test announcement.',
        sentAt: new Date(),
      });

      const res = await request(app)
        .delete(`/api/announcements/${announcement._id}`)
        .set('Authorization', `Bearer ${globalToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message', 'Announcement deleted successfully');
    }, 30000);
  });
});
