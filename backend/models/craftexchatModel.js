const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Users or designers participating in the chat
  ],
  messages: [
    {
      sender: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the sender
      content: { type: String, required: true }, // Message content
      timestamp: { type: Date, default: Date.now }, // Timestamp of the message
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Timestamp of the chat session
});

module.exports = mongoose.model('Chat', chatSchema);