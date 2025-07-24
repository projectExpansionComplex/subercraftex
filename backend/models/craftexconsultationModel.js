const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  designer: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexDesigner', required: true }, // Reference to the designer
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user booking the consultation
  date: { type: Date, required: true }, // Date of the consultation
  time: { type: String, required: true }, // Time of the consultation (e.g., "14:00")
  status: { type: String, enum: ['pending', 'confirmed', 'completed', 'cancelled'], default: 'pending' }, // Status of the consultation
  createdAt: { type: Date, default: Date.now }, // Timestamp of the booking
});

module.exports = mongoose.model('Consultation', consultationSchema);