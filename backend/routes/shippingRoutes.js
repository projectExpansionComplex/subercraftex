const express = require('express');
const shippingController = require('../controllers/shippingCtrl');
const authMiddleware = require('../middleware/authMiddlerware'); // Protect routes for authenticated users

const router = express.Router();

router.post('/', authMiddleware.protect, shippingController.createShipping);
router.get('/:orderId', authMiddleware.protect, shippingController.getShipping);
router.put('/:id', authMiddleware.protect, shippingController.updateShippingStatus);
router.delete('/:id', authMiddleware.protect, shippingController.deleteShipping);

module.exports = router;
