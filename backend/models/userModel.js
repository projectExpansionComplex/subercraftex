const crypto = require('crypto');
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const UserSchema = new mongoose.Schema({
  fullname:{
    type:String,
    trim:true,
    maxlength:25,
    required:true
  },
  username:{
    type:String,
    required:[true,"please provide a username  "],
    unique:true,
    maxlength:25,
    trim:true,
  },
  email:{
    type:String,
    required:[true,"please provide an email"],
    trim:true,
    unique:true,
    match:[
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
       "Please fill valid email address"
    ]
  },
  password:{
    type:String,
    required:[true,"Please add a password"],
    minlength:6,
    select:false
  },
  avatar:{
    type:String,
    default:"https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png"
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows for unique but nullable values
  },
  fileName: String,
  role:{type:String,default:'user'},
  gender:{type:String,default:''},
  mobile:{type:String,default:''},
  address:{type:String,default:''},
  verified:{type:Boolean,default:false,required:true},
  country: {type:String},
  city: {type:String},
  state: {type:String},
  zip: {type:String}


},
{timestamps:true})


const User = mongoose.model("user",UserSchema);

module.exports=User;
