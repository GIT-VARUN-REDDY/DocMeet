const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer "))
      return res.status(401).json({ message: "No token. Please login." });

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password -otp -otpExpiry");
    if (!user) return res.status(401).json({ message: "User not found." });
    if (!user.isVerified) return res.status(403).json({ message: "Please verify your email." });

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ message: "Session expired. Please login again." });
    return res.status(401).json({ message: "Invalid token." });
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role))
    return res.status(403).json({ message: `Access denied. Requires: ${roles.join(" or ")}` });
  next();
};

module.exports = { protect, authorize };