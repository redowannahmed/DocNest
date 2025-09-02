const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const PatientAccessCode = require("../models/PatientAccessCode");
const MedicalHistory = require("../models/MedicalHistory");
const PinnedCondition = require("../models/PinnedCondition");
const Medication = require("../models/Medication");
const User = require("../models/User");

// Generate a random 6-digit access code
const generateAccessCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// POST - Generate patient access code
router.post("/generate-access-code", verifyToken, async (req, res) => {
  try {
    const { hiddenVisitIds = [] } = req.body;
    
    // Verify user is a patient using DB role (avoid stale JWT role)
    const requestingUser = await User.findById(req.user.id).select('role');
    if (!requestingUser) {
      return res.status(401).json({ message: "User not found" });
    }
    if (requestingUser.role !== 'patient') {
      return res.status(403).json({ message: "Only patients can generate access codes" });
    }

    // Deactivate any existing active codes for this patient
    await PatientAccessCode.updateMany(
      { patient: req.user.id, isActive: true },
      { isActive: false }
    );

    // Generate unique access code
    let accessCode;
    let isUnique = false;
    let attempts = 0;
    
    while (!isUnique && attempts < 10) {
      accessCode = generateAccessCode();
      const existing = await PatientAccessCode.findOne({ accessCode });
      if (!existing) {
        isUnique = true;
      }
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ message: "Failed to generate unique access code" });
    }

    // Create new access code (expires in 30 minutes)
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    
    const newAccessCode = new PatientAccessCode({
      patient: req.user.id,
      accessCode,
      hiddenVisitIds,
      expiresAt
    });

    await newAccessCode.save();

    res.status(201).json({
      accessCode,
      expiresAt,
      hiddenVisitCount: hiddenVisitIds.length
    });

  } catch (error) {
    console.error("Generate access code error:", error);
    res.status(500).json({ message: "Failed to generate access code" });
  }
});

// POST - Doctor accesses patient profile using code
router.post("/access-patient-profile", verifyToken, async (req, res) => {
  try {
    const { accessCode } = req.body;
    
    // Verify user is a doctor using DB role (avoid stale JWT role)
    const requestingUser = await User.findById(req.user.id).select('role');
    if (!requestingUser) {
      return res.status(401).json({ message: "User not found" });
    }
    if (requestingUser.role !== 'doctor') {
      return res.status(403).json({ message: "Only doctors can access patient profiles" });
    }

    // Find valid access code
    const codeRecord = await PatientAccessCode.findOne({
      accessCode,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('patient', 'name age gender location email');

    if (!codeRecord) {
      return res.status(404).json({ message: "Invalid or expired access code" });
    }

    // Update access record
    codeRecord.accessedBy = req.user.id;
    codeRecord.accessedAt = new Date();
    await codeRecord.save();

    // Get patient's medical data (excluding hidden visits)
    const medicalHistory = await MedicalHistory.find({
      user: codeRecord.patient._id,
      _id: { $nin: codeRecord.hiddenVisitIds }
    }).sort({ date: -1 });

    const pinnedConditions = await PinnedCondition.find({
      user: codeRecord.patient._id
    });

    const medications = await Medication.find({
      user: codeRecord.patient._id
    });

    res.json({
      patient: codeRecord.patient,
      medicalHistory,
      pinnedConditions,
      medications,
      accessExpiresAt: codeRecord.expiresAt,
      hiddenVisitCount: codeRecord.hiddenVisitIds.length,
      accessCode: codeRecord.accessCode
    });

  } catch (error) {
    console.error("Access patient profile error:", error);
    res.status(500).json({ message: "Failed to access patient profile" });
  }
});

// GET - Get patient's medical visits for sharing selection
router.get("/medical-visits-for-sharing", verifyToken, async (req, res) => {
  try {
    // Verify user is a patient using DB role (avoid stale JWT role)
    const requestingUser = await User.findById(req.user.id).select('role');
    if (!requestingUser) {
      return res.status(401).json({ message: "User not found" });
    }
    if (requestingUser.role !== 'patient') {
      return res.status(403).json({ message: "Only patients can access this endpoint" });
    }

    const visits = await MedicalHistory.find({ user: req.user.id })
      .select('_id date doctor specialty reason status')
      .sort({ date: -1 });

    res.json(visits);
  } catch (error) {
    console.error("Get medical visits error:", error);
    res.status(500).json({ message: "Failed to fetch medical visits" });
  }
});

// GET - Check if doctor has active access to a patient
router.get("/check-patient-access/:accessCode", verifyToken, async (req, res) => {
  try {
    const { accessCode } = req.params;
    
    // Verify user is a doctor using DB role (avoid stale JWT role)
    const requestingUser = await User.findById(req.user.id).select('role');
    if (!requestingUser) {
      return res.status(401).json({ message: "User not found" });
    }
    if (requestingUser.role !== 'doctor') {
      return res.status(403).json({ message: "Only doctors can check patient access" });
    }

    const codeRecord = await PatientAccessCode.findOne({
      accessCode,
      accessedBy: req.user.id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('patient', 'name age gender location email');

    if (!codeRecord) {
      return res.status(404).json({ message: "No active access found" });
    }

    // Calculate remaining time
    const now = new Date();
    const remainingMs = codeRecord.expiresAt.getTime() - now.getTime();
    const remainingMinutes = Math.max(0, Math.ceil(remainingMs / (1000 * 60)));

    res.json({
      hasAccess: true,
      patient: codeRecord.patient,
      expiresAt: codeRecord.expiresAt,
      remainingMinutes,
      hiddenVisitCount: codeRecord.hiddenVisitIds.length
    });

  } catch (error) {
    console.error("Check patient access error:", error);
    res.status(500).json({ message: "Failed to check patient access" });
  }
});

// POST - Doctor adds a medical visit to patient via active access code
router.post("/patients/:accessCode/medical-history", verifyToken, async (req, res) => {
  try {
    console.log("=== Add Visit Request ===");
    console.log("User ID:", req.user.id);
    console.log("Access Code:", req.params.accessCode);
    console.log("Request Body:", JSON.stringify(req.body, null, 2));
    
    // Verify user is a doctor
    const doctor = await User.findById(req.user.id).select('role name');
    console.log("Doctor found:", doctor);
    if (!doctor) return res.status(401).json({ message: "User not found" });
    if (doctor.role !== 'doctor') return res.status(403).json({ message: "Only doctors can add visits" });

    const { accessCode } = req.params;
    const codeRecord = await PatientAccessCode.findOne({
      accessCode,
      accessedBy: req.user.id,
      isActive: true,
      expiresAt: { $gt: new Date() }
    }).populate('patient', 'id');

    console.log("Code record found:", codeRecord);
    if (!codeRecord) {
      return res.status(403).json({ message: "No active access for this code" });
    }

    const {
      date,
      doctor: doctorName,
      specialty,
      reason,
      status = 'Completed',
      notes,
      digitalPrescription,
      prescriptionImgs,
      testReports
    } = req.body;

    if (!date || !doctorName || !reason) {
      return res.status(400).json({ message: "date, doctor, and reason are required" });
    }

    // Future date validation (same as patient path)
    const visit = new Date(date);
    const today = new Date();
    visit.setHours(0,0,0,0); today.setHours(0,0,0,0);
    if (visit > today) {
      return res.status(400).json({ message: "Visit date cannot be in the future" });
    }

    const item = new MedicalHistory({
      user: codeRecord.patient._id,
      date,
      doctor: doctorName,
      specialty,
      reason,
      status,
      notes,
      prescriptionImgs: Array.isArray(prescriptionImgs) ? prescriptionImgs : [],
      testReports: Array.isArray(testReports) ? testReports : [],
      createdBy: req.user.id,
      createdByRole: 'doctor',
      digitalPrescription: digitalPrescription || undefined
    });

    await item.save();
    return res.status(201).json(item);
  } catch (error) {
    console.error("Doctor add visit error:", error);
    return res.status(500).json({ message: "Failed to add medical visit" });
  }
});

module.exports = router;
