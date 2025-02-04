// controllers/subscriptionController.js
const Subscription = require("../models/Subscription");

// Subscribe with email
exports.subscribe = async (req, res) => {
  const { email } = req.body;

  try {
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    // Prevent duplicate subscriptions
    const existingSubscription = await Subscription.findOne({ email });
    if (existingSubscription) {
      return res.status(400).json({ message: "This email is already subscribed" });
    }

    const newSubscription = new Subscription({ email });
    await newSubscription.save();
    res.status(201).json({ msg: 'Subscribed successfully' });
    // res.status(201).json(newSubscription);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all subscribers (Admin)
exports.getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await Subscription.find();
    res.status(200).json(subscribers);
  } catch (err) {
    next(err);
  }
};
