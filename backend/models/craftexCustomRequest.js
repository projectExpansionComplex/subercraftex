const mongoose = require('mongoose');

const craftexcustomRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user
  description: { type: String, required: true }, // Request description
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' }, // Request status
  designer: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexDesigner' }, // Reference to the assigned designer
  createdAt: { type: Date, default: Date.now }, // Timestamp of request creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexCustomRequest', craftexcustomRequestSchema);