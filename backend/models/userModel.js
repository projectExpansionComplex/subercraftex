const mongoose = require('mongoose')



const UserSchema = new mongoose.Schema({
  uid: { type: String, unique: true },
  
  username:{
    type:String,
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
  user_type: { type: String, enum: ['individual', 'designer','business'], default: 'user' },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  profile_picture_url: { type: String,default:"https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png" },
  bio: { type: String },
  location: { type: String },
  specialties: { type: [String], default: [] },
  years_experience: { type: Number },
  portfolio_link: { type: String },
  company_name: { type: String },
  company_size: { type: String },
  industry: { type: String },
  googleId: {
    type: String,
    unique: true,
    sparse: true, // Allows for unique but nullable values
  },
  fileName: String,
  role:{type:String,default:'user', enum: ['admin', 'user','superadmin']},
  gender:{type:String,default:''},
  mobile:{type:String,default:''},
  address:{type:String,default:''},
  verified:{type:Boolean,default:false,required:true},
  country: {type:String},
  city: {type:String},
  state: {type:String},
  zip: {type:String},
  savedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'craftexProject' }], // Array of saved projects
  isDeleted: { type: Boolean, default: false }, // Soft delete flag
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'craftexProduct', // Reference to the product model
    },
  ],


},
{timestamps:true})


const User = mongoose.model("user",UserSchema);

module.exports=User;
