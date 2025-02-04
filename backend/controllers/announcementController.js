const Announcement = require('../models/Announcement');
const Subscription = require('../models/Subscription');
const { sendEmail } = require('../utils/nodemailer'); // Nodemailer setup

// Create and send an announcement
exports.createAnnouncement = async (req, res,next) => {
  const { title, message } = req.body;

  try {
    const newAnnouncement = new Announcement({ title, message });
    await newAnnouncement.save();

    // Optional: Notify subscribers via email (using Nodemailer)
      // Notify all subscribers
      const subscribers = await Subscription.find();
      subscribers.forEach(async (subscriber) => {
        await sendEmail(subscriber.email, title, message);
      });
  
    // Example code for sending an email to subscribers (to be implemented later)

    res.status(201).json(newAnnouncement);
  } catch (error) {
    // res.status(500).json({ message: error.message });
    next(error);
  }
};

// Get all announcements
exports.getAnnouncements = async (req, res,next) => {
  try {
    const announcements = await Announcement.find();
    res.status(200).json(announcements);
  } catch (error) {
    // res.status(500).json({ message: error.message });
    next(error);
  }
};
