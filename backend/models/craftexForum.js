const mongoose = require('mongoose');

const craftexforumSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true }, // Unique identifier for the topic
  title: { type: String, required: true }, // Forum topic title
  content: { type: String, required: true }, // Forum topic content
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumCategory', required: true }, // Reference to the ForumCategory
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who created the topic
  comments: [
    {
      uid: { type: String, required: true, unique: true }, // Unique identifier for the comment
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who commented
      text: { type: String, required: true }, // Comment text
      upvotes: { type: Number, default: 0 }, // Upvotes for the comment
      createdAt: { type: Date, default: Date.now }, // Timestamp of the comment
    },
  ],
  upvotes: { type: Number, default: 0 }, // Upvotes for the topic
  createdAt: { type: Date, default: Date.now }, // Timestamp of topic creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexForum', craftexforumSchema);