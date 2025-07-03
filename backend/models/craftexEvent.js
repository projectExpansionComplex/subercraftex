const mongoose = require('mongoose');

const craftexeventSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Event title
  description: { type: String, required: true }, // Event description
  date: { type: Date, required: true }, // Event date and time
  location: { type: String, required: true }, // Event location (physical or virtual)
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the organizer
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }], // List of attendees
  createdAt: { type: Date, default: Date.now }, // Timestamp of event creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexEvent', craftexeventSchema);