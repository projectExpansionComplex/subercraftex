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
  // Sustainability Metrics
  sustainability_metrics: {
    eco_friendly_materials: { type: Boolean, default: false }, // Whether materials are eco-friendly
    carbon_footprint: { type: Number, default: 0 }, // Carbon footprint in kg CO2e
    water_usage: { type: Number, default: 0 }, // Water usage in liters
    renewable_energy_used: { type: Boolean, default: false }, // Whether renewable energy is used
    recyclable_packaging: { type: Boolean, default: false } // Whether packaging is recyclable
  }
});

module.exports = mongoose.model('craftexSustainability', craftexsustainabilitySchema);