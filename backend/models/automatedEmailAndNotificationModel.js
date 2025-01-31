const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push'],
    required: true,
  },
  message: String,
  sentAt: Date,
});

module.exports = mongoose.model('Notification', notificationSchema);
