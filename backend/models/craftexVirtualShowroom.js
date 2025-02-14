const mongoose = require('mongoose');

const craftexvirtualShowroomSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Showroom title
  description: { type: String, required: true }, // Showroom description
  images: [{ type: String }], // Array of image URLs
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who created the showroom
  createdAt: { type: Date, default: Date.now }, // Timestamp of showroom creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexVirtualShowroom', craftexvirtualShowroomSchema);