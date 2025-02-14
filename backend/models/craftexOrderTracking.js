const mongoose = require('mongoose');

const craftexorderTrackingSchema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexOrder', required: true }, // Reference to the order
  status: { type: String, enum: ['pending', 'shipped', 'out-for-delivery', 'delivered'], default: 'pending' }, // Tracking status
  location: { type: String }, // Current location of the shipment
  estimatedDelivery: { type: Date }, // Estimated delivery date
  createdAt: { type: Date, default: Date.now }, // Timestamp of tracking update
});

module.exports = mongoose.model('craftexOrderTracking', craftexorderTrackingSchema);