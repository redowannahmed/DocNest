const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const MedicalHistory = require("../models/MedicalHistory");
const PinnedCondition = require("../models/PinnedCondition");
const Medication = require("../models/Medication");

const router = express.Router();

// Helper to format image fields
const formatImages = (input) => {
  if (!input) return [];
  if (typeof input === 'string') {
    return [{ url: input, publicId: 'unknown' }];
  }
  if (Array.isArray(input)) {
    return input.map(img => {
      if (typeof img === 'string') {
        return { url: img, publicId: 'unknown' };
      }
      return {
        url: img.url || '',
        publicId: img.publicId || 'unknown'
      };
    });
  }
  return [];
};

// ===== MEDICAL HISTORY CRUD =====

// GET all medical history records for logged-in user
router.get("/medical-history", verifyToken, async (req, res) => {
  try {
    const items = await MedicalHistory.find({ user: req.user.id });
    res.json(items);
  } catch (error) {
    console.error("Error fetching medical history:", error.message);
    res.status(500).json({ message: "Failed to fetch medical history" });
  }
});

// POST new medical history entry
router.post("/medical-history", verifyToken, async (req, res) => {
  try {
    const {
      date,
      doctor,
      specialty,
      reason,
      status,
      notes,
      prescriptionImgs,
      testReports
    } = req.body;

    const item = new MedicalHistory({
      user: req.user.id,
      date,
      doctor,
      specialty,
      reason,
      status,
      notes,
      prescriptionImgs: formatImages(prescriptionImgs),
      testReports: formatImages(testReports)
    });

    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error("Medical history save error:", error.message);
    res.status(500).json({ message: "Failed to save medical history" });
  }
});

// ===== PINNED CONDITIONS CRUD =====

router.get("/pinned-conditions", verifyToken, async (req, res) => {
  try {
    const items = await PinnedCondition.find({ user: req.user.id });
    res.json(items);
  } catch (error) {
    console.error("Error fetching pinned conditions:", error.message);
    res.status(500).json({ message: "Failed to fetch pinned conditions" });
  }
});

router.post("/pinned-conditions", verifyToken, async (req, res) => {
  try {
    const item = new PinnedCondition({ ...req.body, user: req.user.id });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error("Error saving pinned condition:", error.message);
    res.status(500).json({ message: "Failed to save pinned condition" });
  }
});

// ===== MEDICATIONS CRUD =====

router.get("/medications", verifyToken, async (req, res) => {
  try {
    const items = await Medication.find({ user: req.user.id });
    res.json(items);
  } catch (error) {
    console.error("Error fetching medications:", error.message);
    res.status(500).json({ message: "Failed to fetch medications" });
  }
});

router.post("/medications", verifyToken, async (req, res) => {
  try {
    const item = new Medication({ ...req.body, user: req.user.id });
    await item.save();
    res.status(201).json(item);
  } catch (error) {
    console.error("Error saving medication:", error.message);
    res.status(500).json({ message: "Failed to save medication" });
  }
});

module.exports = router;
