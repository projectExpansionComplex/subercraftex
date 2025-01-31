const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const ErrorResponse = require('../utils/errorResponse');
const UtilFeatures = require('../utils/utilFeatures');
const { filterObj } = require('../helpers/helpers');


exports.userCtrl = {
  getAllUsers:async (req, res,next) => {
    let query = Users.find();
    const features = new UtilFeatures(query, req.query);
    const results = features
      .filter()
      .limitFields()
      .sort()
      .paginate()
      .populateWith();
    try {
      const userss = await results.query;
    
     res.status(200).json({
        status:true,
        total: userss.length || 0,
       users:userss
  })
    } catch (err) {
      res.status(500).json({msg:err.message})
      return next(new ErrorResponse(err.message, 500))
    }
  },

  searchUser: async (req,res) => {
    
    try {
      let superQ = {}

      Object.entries({...req.query}).map((val, i, arr) => {
      superQ[val[0]] = { '$regex': val[1], '$options': 'i' }
})
  
      const users = await Users.find( superQ).limit(10).select("fullname username avatar")
      res.json({users})
    } catch (err) {
      return res.status(500).json({msg:err.message})
    }
  },

  getUser: async (req,res) => {
    try {
      const user = await Users.findById(req.params.id).select('-password');
      if(!user){
        res.status(400).json({msg:"User does not exists"})
        return next(new ErrorResponse("User does not exists", 400))
      }

      res.status(200).json({user})
    } catch (err) {
      return res.status(500).json({msg:err.message})
    }
  },

  updateUser: async (req,res,next) => {
    try {
      const {fullname, gender, mobile, address} = req.body;

      if(req.body.password) {
        return next(
          new ErrorResponse('This route is not for password updates. Go to ForgotPassword', 400)
        );
      }

      if(!fullname){
        res.status(400).json({msg:"Please Add your full name"})
        return next(new ErrorResponse("Please Add your full name", 400))
      }
       await Users.findOneAndUpdate({_id:req.user._id},{
        fullname, gender
      })

      const user = await Users.findOne({_id:req.user._id})
      res.json({
        user: user,
        msg:"Update Success!"
      })
    } catch (err) {
      return res.status(500).json({msg:err.message})
    }
  },

  deleteUser: async (req,res) => {
    try {
      
      const userId = req.body.userId
      const user = await Users.findOne({_id:userId})
      if(!user){
        res.status(400).json({msg:"User does not exist"})
        return next(new ErrorResponse("User does not exist", 400))
      }

      if(req.user.role !== 'superadmin'  ){
        res.status(400).json({msg:"You do not have the permissions to Delete User"})
        return next(new ErrorResponse("You do not have the permissions to Delete User", 400))
      }
      
      await Users.findOneAndDelete({_id:user._id})
      return res.status(200).json({
        msg:"User Successfully deleted!"
      })
    } catch (err) {
      return res.status(500).json({msg:err.message})
    }
  },

}

exports.updateMe = catchAsync(async (req, res, next) => {
  if(req.body.password) {
    return next(
      new ErrorResponse('This route is not for password updates. Go to ForgotPassword', 400)
    );
  }

  const filteredBody = filterObj(req.body, 'fullname', 'mobile', 'address', 'gender');
  if (req.file) {
    filteredBody.fileName = req.file.filename;
    filteredBody.avatar = `public/uploads/${req.file.filename}`;
  }

  const user = await Users.findByIdAndUpdate(req.user._id, filteredBody, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: user,
    }
  })
});

exports.assignRole = catchAsync(async (req, res, next) => {
  const { role, userId } = req.body;
  if (!role) {
    return next ( new ErrorResponse('The Role to assign is not defined', 400));
  }

  if (!userId) {
    return next ( new ErrorResponse('User ID is required', 400));
  }

  await Users.findByIdAndUpdate({_id:userId}, {role: role});
  res.status(200).json({
    status: 'success'
  });
});