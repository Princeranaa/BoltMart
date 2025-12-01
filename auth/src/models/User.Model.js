const mongoose = require("mongoose");

const addresses = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    country: String,
    zip: String
})


const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        select:false,
        required: true
    },
    fullName: {
        firstname: {
            type: String,
            require: true
        },
        lastname: {
            type: String,
            required: true
        },
    },
    role: {
        type: String,
        enum: ["user", "seller"],
        default: "user"
    },
    addresses: [
        addresses
    ]

});


module.exports = mongoose.model("user", userSchema)