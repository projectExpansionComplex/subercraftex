const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/authMiddlerware');
const {
  getComingSoonDetails,
  createComingSoon,
  updateComingSoon,
} = require('../controllers/comingSoonController');

// Public route: get coming soon details
router.get('/', getComingSoonDetails);

// Admin routes: Create and update Coming Soon details

router.post('/', auth, authorize('superadmin'), createComingSoon);
router.put('/', auth, authorize('superadmin'), updateComingSoon);

module.exports = router;
