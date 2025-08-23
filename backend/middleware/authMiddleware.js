const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyToken = (req, res, next) => {
  let token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Access Denied" });

  // Support both raw token and "Bearer <token>"
  if (typeof token === "string" && token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

exports.requireDoctorRole = async (req, res, next) => {
  try {
    if (req.user?.role === "doctor") return next();
    // Fall back to DB check to avoid stale/malformed JWT role
    const user = await User.findById(req.user.id).select("role");
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.role !== "doctor") {
      return res.status(403).json({ message: "Doctors only" });
    }
    next();
  } catch (e) {
    return res.status(500).json({ message: "Role verification failed" });
  }
};

exports.requireAdminRole = async (req, res, next) => {
  try {
    if (req.user?.role === "admin") return next();
    // Fall back to DB check to avoid stale/malformed JWT role
    const user = await User.findById(req.user.id).select("role");
    if (!user) return res.status(401).json({ message: "User not found" });
    if (user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (e) {
    return res.status(500).json({ message: "Role verification failed" });
  }
};
