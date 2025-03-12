const mongoose = require('mongoose');

const craftexblogPostSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Blog post title
  excerpt: { type: String, required: true }, // Short excerpt for preview
  content: { type: String, required: true }, // Full blog post content (rich text)
  featuredImage: { type: String}, // URL to the featured image
  videoUrl: { type: String }, // URL to the uploaded video
  youtubeUrl: { type: String }, // URL to a YouTube video
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the author
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexBlogPostCategory' }, // Reference to the blog post category
  tags: [{ type: String }], // Tags for categorization
  status: { type: String, enum: ['draft', 'published'], default: 'draft' }, // Blog post status
  publishDate: { type: Date, default: Date.now }, // Publish date
  createdAt: { type: Date, default: Date.now }, // Timestamp of creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

// Update the `updatedAt` field before saving
craftexblogPostSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('craftexBlogPost', craftexblogPostSchema);