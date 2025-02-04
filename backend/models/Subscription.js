// models/Subscription.js
const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true }, // Email of the subscriber
    subscribedAt: { type: Date, default: Date.now }, // Timestamp when subscribed
  },
  { timestamps: true }
);

module.exports = mongoose.model("Subscription", SubscriptionSchema);
