const jwt = require("jsonwebtoken");
const User = require("../models/User.Model");

exports.authMiddleware = async (req, res, next) => {
  // Extract token from cookie or Authorization header
  const token =
    req.cookies.token ||
    (req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    // Return 404 if user doesn't exist (not 401)
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    // Handle JWT errors with appropriate messages
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: "Token expired" });
    }
    return res.status(401).json({ message: error.message });
  }
};