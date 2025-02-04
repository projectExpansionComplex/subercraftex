// models/ComingSoon.js
const mongoose = require("mongoose");

const ComingSoonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Title of the announcement
    description: { type: String, required: true }, // Description of the event
    launchDate: { type: Date, required: true }, // Expected launch date
    createdAt: { type: Date, default: Date.now }, // Timestamp for when the record was created
  },
  { timestamps: true }
);

module.exports = mongoose.model("ComingSoon", ComingSoonSchema);
