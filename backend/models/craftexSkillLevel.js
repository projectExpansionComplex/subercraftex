const mongoose = require('mongoose');

const craftexSkillLevelSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // Skill level name (must be unique)
  description: { type: String }, // Optional description
  createdAt: { type: Date, default: Date.now }, // Timestamp of creation
  updatedAt: { type: Date, default: Date.now }, // Timestamp of last update
});

// Update the `updatedAt` field before saving
craftexSkillLevelSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('craftexSkillLevel', craftexSkillLevelSchema);