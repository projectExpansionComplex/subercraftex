const Coupon = require('../models/discountAndCouponModel');

// Create a new coupon
exports.createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all coupons
exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find();
    res.status(200).json(coupons);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get a single coupon by code
exports.getCouponByCode = async (req, res) => {
  try {
    const coupon = await Coupon.findOne({ code: req.params.code });

    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    res.status(200).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update a coupon by ID
exports.updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    res.status(200).json(coupon);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete a coupon by ID
exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);

    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    res.status(200).json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
