const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

const ResetToken2Schema = new mongoose.Schema({
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


const ResetToken2 = mongoose.model("ResetToken2",ResetToken2Schema);

module.exports=ResetToken2;
