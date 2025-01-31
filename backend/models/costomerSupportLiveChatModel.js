const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    message: String,
    timestamp: {
      type: Date,
      default: Date.now,
    },
  }],
  status: {
    type: String,
    enum: ['open', 'closed'],
    default: 'open',
  },
});

module.exports = mongoose.model('Chat', chatSchema);
