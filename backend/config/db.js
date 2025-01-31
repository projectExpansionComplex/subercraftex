const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      

    });

    console.log("pesEcommers MongoDB Connection Success 👍");
  } catch (error) {
    console.log("pesEcommers MongoDB Connection Failed 💥");
    process.exit(1);
  }
};

module.exports = connectDB;
