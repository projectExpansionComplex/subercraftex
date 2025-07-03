const User = require('../models/userModel');

exports.mockAdminAuth = async (req, res, next) => {
  try {
    // Directly create a mock user object without database interaction
    req.user = {
      _id: '60a7b1b0b0b0b0b0b0b0b0b0', // Mock ObjectId
      first_name: 'Mock',
      last_name: 'Admin',
      email: 'mockadmin@example.com',
      user_type: 'individual',
      role: 'superadmin',
      username: 'mockadmin',
    };
    next();
  } catch (error) {
    console.error('Error in mockAdminAuth middleware:', error);
    res.status(500).json({ message: 'Internal server error during mock authentication' });
  }
};