const mongoose = require('mongoose')

const loyaltySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  points: {
    type: Number,
    default: 0,
  },
  transactions: [{
    description: String,
    points: Number,
    date: {
      type: Date,
      default: Date.now,
    },
  }],
});

module.exports = mongoose.model('Loyalty', loyaltySchema);
