const express = require('express');
const couponController = require('../controllers/couponAndDiscountCtrl');
const authMiddleware = require('../middleware/authMiddlerware'); // Only admin users should manage coupons

const router = express.Router();

router.post('/', authMiddleware.protect, authMiddleware.restrictTo('admin'), couponController.createCoupon);
router.get('/', couponController.getCoupons);
router.get('/:code', couponController.getCouponByCode);
router.put('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), couponController.updateCoupon);
router.delete('/:id', authMiddleware.protect, authMiddleware.restrictTo('admin'), couponController.deleteCoupon);

module.exports = router;
