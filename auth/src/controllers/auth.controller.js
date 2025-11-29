const User = require('../models/User.Model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { username, email, password, firstname, lastname } = req.body;

        /* if (!username || !email || !password || !firstname || !lastname) {
            return res.status(400).json({ message: "All fields are required" });
        } */

        const existingUser = await User.findOne({
            $or: [
                { email },
                { username }
            ]
        });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            fullName: {
                firstname,
                lastname
            }
        });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || "secret", { expiresIn: "1h" });

        res.status(201).json({ message: "User created successfully", token, user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }

};
