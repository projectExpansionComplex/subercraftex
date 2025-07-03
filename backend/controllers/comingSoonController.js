const ComingSoon = require('../models/ComingSoon');

// Public route: Get Coming Soon details (no authentication)
exports.getComingSoonDetails = async (req, res, next) => {
  try {
    const comingSoon = await ComingSoon.findOne();
    if (!comingSoon) {
      return res.status(404).json({ msg: 'Coming Soon details not found' });
    }
    return res.status(200).json(comingSoon);  // Public response, no authentication needed
  } catch (err) {
    return next(err);  // Pass error to next middleware
  }
};

// Create Coming Soon details (Admin)
exports.createComingSoon = async (req, res, next) => {
  const { title, description, launchDate } = req.body;
  try {
    const comingSoon = new ComingSoon({ title, description, launchDate });
    await comingSoon.save();
    res.status(201).json(comingSoon);
  } catch (err) {
    next(err);
  }
};

// Update Coming Soon details (Admin)
exports.updateComingSoon = async (req, res, next) => {
  const { title, description, launchDate } = req.body;
  try {
    const comingSoon = await ComingSoon.findOne();
    if (!comingSoon) {
      return res.status(404).json({ msg: 'Coming Soon details not found' });
    }
    comingSoon.title = title;
    comingSoon.description = description;
    comingSoon.launchDate = launchDate;
    await comingSoon.save();
    res.status(200).json(comingSoon);
  } catch (err) {
    next(err);
  }
};
