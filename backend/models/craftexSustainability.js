const mongoose = require('mongoose');

const craftexsustainabilitySchema = new mongoose.Schema({
  title: { type: String, required: true }, // Title of the sustainability content
  description: { type: String, required: true }, // Detailed description
  imageUrl: { type: String, required: true }, // URL to the featured image
  thumbnail: { 
    type: String, 
    required: true 
  }, // URL to the product thumbnail image
  content: { type: String, required: true }, // Main content (e.g., article text)
  tags: [{ type: String }], // Tags for categorization (e.g., "eco-friendly", "recycling")
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who created the content
  createdAt: { type: Date, default: Date.now }, // Timestamp of content creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexSustainability', craftexsustainabilitySchema);