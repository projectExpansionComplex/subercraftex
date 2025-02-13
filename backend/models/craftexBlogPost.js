const mongoose = require('mongoose');

const craftexblogPostSchema = new mongoose.Schema({
  title: String,
  excerpt: String,
  imageUrl: String,
  author: String,
  publishDate: Date
});

module.exports = mongoose.model('craftexBlogPost', craftexblogPostSchema);