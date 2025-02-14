const mongoose = require('mongoose');

const craftexinspirationSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Inspiration title
  description: { type: String, required: true }, // Inspiration description
  imageUrl: { type: String, required: true }, // URL to the inspiration image
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who created the inspiration
  createdAt: { type: Date, default: Date.now }, // Timestamp of inspiration creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexInspiration', craftexinspirationSchema);