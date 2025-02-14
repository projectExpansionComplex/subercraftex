const mongoose = require('mongoose');

const craftexblogPostSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Blog post title
  excerpt: { type: String, required: true }, // Short excerpt for preview
  content: { type: String, required: true }, // Full blog post content
  imageUrl: { type: String, required: true }, // URL to the blog post image
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the author
  publishDate: { type: Date, default: Date.now }, // Publish date
  tags: [{ type: String }], // Tags for categorization
  createdAt: { type: Date, default: Date.now }, // Timestamp of creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexBlogPost', craftexblogPostSchema);