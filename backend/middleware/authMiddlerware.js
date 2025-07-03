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
  exports.auth = async (req, res, next)=>{
    
    try {
      const token = req.header('Authorization')
      if(!token){
        // If the route doesn't require auth (like "Coming Soon"), continue the request
      return next();  // Move to the next middleware (or route handler)
      } 

  // Verify the token
      const decoded_token = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
      if(!decoded_token){
        res.status(403).json({msg:"Invalid Authentication"})
        return next(new ErrorResponse("Invalid Authentication", 403))
      }

        // Find user based on token
      const user = await Users.findOne({_id:decoded_token.id})
      if (!user) {
        return next(new ErrorResponse("User not found", 404));
      }

      // Attach user data to request
      req.user = user
      next()
    } catch (err) {
      return res.status(401).json({msg:err.message})
    }
  }


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
  


