const mongoose = require('mongoose');

const craftexreviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the reviewer
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexProduct' }, // Reference to the product (if applicable)
  designer: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexDesigner' }, // Reference to the designer (if applicable)
  rating: { type: Number, required: true, min: 1, max: 5 }, // Rating (1-5 stars)
  comment: { type: String }, // Review comment
  createdAt: { type: Date, default: Date.now }, // Timestamp of review creation
});

module.exports = mongoose.model('craftexReview', craftexreviewSchema);