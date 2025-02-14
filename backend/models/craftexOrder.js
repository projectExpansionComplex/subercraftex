const mongoose = require('mongoose');

const craftexorderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexProduct', required: true }, // Reference to the product
      quantity: { type: Number, default: 1, min: 1 }, // Quantity of the product
      price: { type: Number, required: true }, // Price at the time of purchase
    },
  ],
  total: { type: Number, required: true }, // Total cost of the order
  status: { type: String, enum: ['pending', 'shipped', 'delivered'], default: 'pending' }, // Order status
  shippingAddress: { type: String, required: true }, // Shipping address
  paymentMethod: { type: String, required: true }, // Payment method (e.g., credit card, PayPal)
  createdAt: { type: Date, default: Date.now }, // Timestamp of order creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexOrder', craftexorderSchema);