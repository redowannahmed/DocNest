const jwt = require("jsonwebtoken");

exports.verifyToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access Denied" });

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: "Invalid Token" });
    }
};

exports.requireDoctorRole = (req, res, next) => {
  if (req.user.role !== "doctor") {
    return res.status(403).json({ message: "Doctors only" });
  }
  next();
};
