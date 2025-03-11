const mongoose = require('mongoose');

const craftexProjectCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Category name (e.g., "Furniture", "Home Decor")
  description: { type: String }, // Optional description of the category
  createdAt: { type: Date, default: Date.now }, // Timestamp of category creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

// Update the `updatedAt` field before saving
craftexProjectCategorySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('craftexProjectCategory', craftexProjectCategorySchema);