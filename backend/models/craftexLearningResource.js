const mongoose = require('mongoose');

const craftexlearningResourceSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Resource title
  description: { type: String, required: true }, // Resource description
  type: { type: String, enum: ['article', 'video', 'tutorial'], required: true }, // Resource type
  url: { type: String }, // URL for articles or external links
  videoType: { type: String, enum: ['uploaded', 'youtube'] }, // Make videoType optional
  videoUrl: { type: String }, // YouTube video link (for video resources)
  videoFile: { type: String }, // Path to uploaded video file (for uploaded videos)
  thumbnail: { type: String }, // Thumbnail image URL
  images: [{ type: String }], // Array of image URLs
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexTutorialCategory', required: true }, // Reference to the tutorial category
  skill_level: { type: mongoose.Schema.Types.ObjectId, ref: 'craftexSkillLevel' }, // Reference to the skill level
  rating: { type: Number, default: 0 }, // Average rating of the resource
  ratings: [{ // Array of user ratings
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // User who rated
    score: { type: Number, min: 1, max: 5 }, // Rating score (1-5)
  }],
  user_progress: { // User progress tracking
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, // User who is learning
    progress: { type: Number, min: 0, max: 100, default: 0 }, // Progress percentage
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true }, // Reference to the user who created the resource
  createdAt: { type: Date, default: Date.now }, // Timestamp of resource creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

module.exports = mongoose.model('craftexLearningResource', craftexlearningResourceSchema);