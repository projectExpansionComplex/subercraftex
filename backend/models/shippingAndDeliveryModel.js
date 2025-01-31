const mongoose = require('mongoose')

const shippingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  shippingMethod: {
    type: String,
    enum: ['standard', 'express', 'overnight'],
    required: true,
  },
  cost: {
    type: Number,
    required: true,
  },
  estimatedDelivery: Date,
  trackingNumber: String,
  deliveryStatus: {
    type: String,
    enum: ['pending', 'shipped', 'delivered', 'returned'],
    default: 'pending',
  },
});

module.exports = mongoose.model('Shipping', shippingSchema);
