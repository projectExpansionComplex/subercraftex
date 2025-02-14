const mongoose = require('mongoose');

const craftexlearningResourceSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Resource title
  description: { type: String, required: true }, // Resource description
  type: { type: String, enum: ['article', 'video', 'tutorial'], required: true }, // Resource type
  url: { type: String, required: true }, // URL to the resource
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who created the resource
  createdAt: { type: Date, default: Date.now }, // Timestamp of resource creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexLearningResource', craftexlearningResourceSchema);