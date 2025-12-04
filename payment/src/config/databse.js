const mongoose = require("mongoose");

exports.connectDb = () => {
  try {
    mongoose.connect(process.env.MONGO_URI);
    console.log("Database connected");
  } catch (error) {
    console.log("something went wrong", error);
  }
};
