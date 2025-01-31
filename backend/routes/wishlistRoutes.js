const express = require('express');
const wishlistController = require('../controllers/wishlistCtrl');
const authMiddleware = require('../middleware/authMiddlerware'); // Protect routes for authenticated users

const router = express.Router();

router.post('/', authMiddleware.protect, wishlistController.addToWishlist);
router.get('/', authMiddleware.protect, wishlistController.getWishlist);
router.delete('/', authMiddleware.protect, wishlistController.removeFromWishlist);

module.exports = router;
