const Users = require('../models/userModel')
const ResetToken = require('../models/resetTokenModel')
const ErrorResponse = require('../utils/errorResponse')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')




//Middle ware to validate reset token
  exports.isResetTokenValid = async (req,res,next)=>{

        try{
          const {token, id} = req.query

          if(!token || !id){
            res.status(400).json({msg:"Invalid request1"})
            return next(new ErrorResponse("Invalid request", 400))
          }

          // Find user by ID
          const user = await Users.findById(id)
          if(!user){
            res.status(400).json({msg:"user not found"})
            return next(new ErrorResponse("user not found", 400))

          }

   // Find reset token for the user
          const resetToken = await ResetToken.findOne({owner:user._id})
          if(!resetToken){
            res.status(400).json({msg:"Reset token not found!"})
            return next(new ErrorResponse("Reset token not found!", 400))
          }

// Compare the provided token with the stored hash token
          const isMatch = await bcrypt.compare(token, resetToken.token)
          if(!isMatch){
            res.status(400).json({msg:"Reset token is invalid!"})
            return next(new ErrorResponse("Reset token is invalid!", 400))
          }

// Proceed if token is valid
          req.user = user
          next()
        }catch(err){
          return res.status(500).json({msg:err.message})
        }



  }

  // Middleware to authenticate user via JWT
 


  // Middleware to authorize user based on role
  exports.authorize = (...roles) => {
    return (req, res, next) => {
      if(!roles.includes(req.user.role)) {
        return next(
          new ErrorResponse('You do not have permission perform this action', 403)
        )
      }
      next();
    };
  };

  // Middleware to protect routes (JWT)
exports.protect = async (req, res, next) => {
  let token;
    // Check for token in Authorization header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');// Exclude password from user object
    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

// Middleware for role-based access control
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};
  


exports.auth2 = async (req, res, next) => {
  console.log('auth2 middleware');
  try {
    // Check if the Authorization header exists and starts with "Bearer"
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Extract the token from the header
    const token = authHeader.split(' ')[1]; // Split "Bearer <token>" and get the token

    // Verify the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    if (!decodedToken) {
      return res.status(403).json({ msg: 'Invalid Authentication' });
    }

    // Find user based on token
    const user = await Users.findOne({ _id: decodedToken.id });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Attach user data to the request object
    req.user = user;
    next();
  } catch (err) {
    console.error('Error in auth middleware:', err);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};