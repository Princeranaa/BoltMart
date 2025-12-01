const jwt = require("jsonwebtoken");

exports.authMiddleware = (req, res, next) => {
  // Extract token from cookie or Authorization header
  const token =
    req.cookies.token ||
    (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    let message = "Unauthorized";

    if (error.name === "TokenExpiredError") message = "Token expired";
    else if (error.name === "JsonWebTokenError") message = "Invalid token";

    return res.status(401).json({ message });
  }
};
