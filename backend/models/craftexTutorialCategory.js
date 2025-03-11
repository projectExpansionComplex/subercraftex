const mongoose = require('mongoose');

const craftexTutorialCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Category name (must be unique)
  description: { type: String }, // Optional description
  learningResources: [
    { type: mongoose.Schema.Types.ObjectId, ref: 'craftexLearningResource' }, // Reference to learning resources
  ],
  createdAt: { type: Date, default: Date.now }, // Timestamp of creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

// Update the `updatedAt` field before saving
craftexTutorialCategorySchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('craftexTutorialCategory', craftexTutorialCategorySchema);