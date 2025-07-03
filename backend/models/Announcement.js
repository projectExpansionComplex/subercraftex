// models/Announcement.js
const mongoose = require("mongoose");

const AnnouncementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Title of the announcement
    message: { type: String, required: true }, // Message of the announcement
    sentAt: { type: Date, default: Date.now }, // Timestamp when announcement was sent
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", AnnouncementSchema);
