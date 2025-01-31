const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const ResetTokenSchema = new mongoose.Schema({
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


const ResetToken = mongoose.model("ResetToken",ResetTokenSchema);

module.exports=ResetToken;
