const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const VerificationTokenSchema = new mongoose.Schema({
  owner:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required:true
  },
  token:{
    type:String,
    required: true,
  },
  createdAt:{
    type:Date,
    expires: 3600,
    default: Date.now()
  }
})


const VerificationToken = mongoose.model("VerificationToken",VerificationTokenSchema);

module.exports=VerificationToken;
