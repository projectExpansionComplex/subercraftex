const mongoose = require('mongoose');

const craftexcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Category name
  description: { type: String }, // Category description
  imageUrl: { type: String, required: true }, // URL to the category image
  createdAt: { type: Date, default: Date.now }, // Timestamp of category creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
  craftexProducts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'craftexProduct' }]
});

module.exports = mongoose.model('craftexCategory', craftexcategorySchema);