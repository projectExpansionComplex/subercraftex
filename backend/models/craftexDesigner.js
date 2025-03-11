const mongoose = require('mongoose');

const craftexdesignerSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user
  name: { type: String, required: true }, // Designer's display name
  avatar: { type: String, default: "/uploads/designer-avatar/default-avatar.jpg" }, // Profile picture file path
  specialty: { type: String, required: true }, // Designer's specialty (e.g., woodworking, apparel)
  bio: { type: String }, // Short bio or description
  portfolio: [{ type: String }], // Array of portfolio image URLs
  rating: { type: Number, default: 0, min: 0, max: 5 }, // Average rating
  reviews: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // Reference to the reviewer
      comment: { type: String }, // Review comment
      rating: { type: Number, min: 1, max: 5 }, // Rating given by the user
      createdAt: { type: Date, default: Date.now }, // Timestamp of the review
    },
  ],
  location: { type: String }, // Add this field for location filtering
  createdAt: { type: Date, default: Date.now }, // Timestamp of designer profile creation
});

module.exports = mongoose.model('craftexDesigner', craftexdesignerSchema);