const mongoose = require('mongoose')

const cmsSchema = new mongoose.Schema({
  title: String,
  content: String,
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: Date,
});

module.exports = mongoose.model('CMS', cmsSchema);
