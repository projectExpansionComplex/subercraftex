const mongoose = require('mongoose')

const analyticsSchema = new mongoose.Schema({
  metric: String,
  value: Number,
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Analytics', analyticsSchema);
