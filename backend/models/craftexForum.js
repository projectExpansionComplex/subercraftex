const mongoose = require('mongoose');

const craftexforumSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Forum topic title
  description: { type: String, required: true }, // Forum topic description
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who created the topic
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who commented
      text: { type: String, required: true }, // Comment text
      createdAt: { type: Date, default: Date.now }, // Timestamp of the comment
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Timestamp of topic creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexForum', craftexforumSchema);