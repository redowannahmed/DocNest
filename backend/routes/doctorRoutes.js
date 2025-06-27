// routes/doctorRoutes.js
const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const MedicalHistory = require("../models/MedicalHistory");
const User = require("../models/User");

const router = express.Router();

// Example: get all patients' visit history (you can filter access later)
router.get("/patients", verifyToken, async (req, res) => {
  if (req.user.role !== "doctor")
    return res.status(403).json({ message: "Access denied" });

  try {
    const patients = await User.find({ role: "patient" }).select("-password");
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/history/:patientId", verifyToken, async (req, res) => {
  if (req.user.role !== "doctor")
    return res.status(403).json({ message: "Access denied" });

  const patientId = req.params.patientId;
  const records = await MedicalHistory.find({ user: patientId });
  res.json(records);
});

module.exports = router;
