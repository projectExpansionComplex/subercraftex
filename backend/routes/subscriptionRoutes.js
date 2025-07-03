const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/authMiddlerware');
const {
  subscribe,
  getSubscribers,
} = require('../controllers/subscriptionController');

// Public route: subscribe
router.post('/', subscribe);

// Admin route: get all subscribers
router.get('/', auth, authorize('admin'), getSubscribers);

module.exports = router;
