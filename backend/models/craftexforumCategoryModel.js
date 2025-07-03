const mongoose = require('mongoose');

const forumCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Category name
  description: { type: String, required: true }, // Category description
  createdAt: { type: Date, default: Date.now }, // Timestamp of category creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('ForumCategory', forumCategorySchema);