const mongoose = require("mongoose");

exports.connectDB =  () => {
    try {
        mongoose.connect(process.env.MONGO_URI)
        console.log("mongoose connection success");

    } catch (error) {
        console.log("mongoose connection error", error);
    }
}