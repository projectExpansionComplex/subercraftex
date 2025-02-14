const mongoose = require('mongoose');

const craftexnotificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user
  type: { type: String, enum: ['success', 'error', 'info'], required: true }, // Notification type
  message: { type: String, required: true }, // Notification message
  isRead: { type: Boolean, default: false }, // Whether the notification has been read
  createdAt: { type: Date, default: Date.now }, // Timestamp of notification creation
});

module.exports = mongoose.model('craftexNotification', craftexnotificationSchema);