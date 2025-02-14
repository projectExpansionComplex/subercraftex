const mongoose = require('mongoose');

const craftexcartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexProduct', required: true }, // Reference to the product
      quantity: { type: Number, default: 1, min: 1 }, // Quantity of the product
      price: { type: Number, required: true }, // Price at the time of adding to cart
    },
  ],
  total: { type: Number, default: 0 }, // Total cost of the cart
  createdAt: { type: Date, default: Date.now }, // Timestamp of cart creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexCart', craftexcartSchema);