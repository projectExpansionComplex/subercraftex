const mongoose = require('mongoose');

const craftexprojectSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Project title
  description: { type: String, required: true }, // Project description
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who posted the project
  designer: { type: mongoose.Schema.Types.ObjectId, ref: 'Designer' }, // Reference to the assigned designer
  status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' }, // Project status
  bids: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who placed the bid
      amount: { type: Number, required: true }, // Bid amount
      comment: { type: String }, // Optional comment with the bid
      createdAt: { type: Date, default: Date.now }, // Timestamp of the bid
    },
  ],
  createdAt: { type: Date, default: Date.now }, // Timestamp of project creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexProject', craftexprojectSchema);