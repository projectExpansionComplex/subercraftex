const mongoose = require('mongoose');

const craftexBlogPostCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Category name (e.g., "Design", "Sustainability")
  description: { type: String }, // Optional description of the category
  createdAt: { type: Date, default: Date.now }, // Timestamp of creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

// Update the `updatedAt` field before saving
craftexBlogPostCategorySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('craftexBlogPostCategory', craftexBlogPostCategorySchema);