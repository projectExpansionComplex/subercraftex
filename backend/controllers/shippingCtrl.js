const Shipping = require('../models/shippingAndDeliveryModel');

// Create a shipping record
exports.createShipping = async (req, res) => {
  try {
    const shipping = new Shipping(req.body);
    await shipping.save();
    res.status(201).json(shipping);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get shipping details for an order
exports.getShipping = async (req, res) => {
  try {
    const shipping = await Shipping.findOne({ order: req.params.orderId });

    if (!shipping) return res.status(404).json({ message: 'Shipping not found' });

    res.status(200).json(shipping);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update shipping status
exports.updateShippingStatus = async (req, res) => {
  try {
    const shipping = await Shipping.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!shipping) return res.status(404).json({ message: 'Shipping not found' });

    res.status(200).json(shipping);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete shipping record
exports.deleteShipping = async (req, res) => {
  try {
    const shipping = await Shipping.findByIdAndDelete(req.params.id);

    if (!shipping) return res.status(404).json({ message: 'Shipping not found' });

    res.status(200).json({ message: 'Shipping record deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
