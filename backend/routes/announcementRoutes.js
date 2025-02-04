const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/authMiddlerware');
const {
  createAnnouncement,
  getAnnouncements,
} = require('../controllers/announcementController');

// Admin routes: create and view announcements
router.post('/', auth, authorize('admin'), createAnnouncement);
router.get('/', getAnnouncements);

module.exports = router;
