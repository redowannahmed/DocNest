const express = require("express");
const { verifyToken } = require("../middleware/authMiddleware");
const MedicalHistory = require("../models/MedicalHistory");
const PinnedCondition = require("../models/PinnedCondition");
const Medication = require("../models/Medication");

const router = express.Router();

// Medical History CRUD
router.get("/medical-history", verifyToken, async (req, res) => {
  const items = await MedicalHistory.find({ user: req.user.id });
  res.json(items);
});
router.post("/medical-history", verifyToken, async (req, res) => {
  const item = new MedicalHistory({ ...req.body, user: req.user.id });
  await item.save();
  res.status(201).json(item);
});

// Pinned Conditions CRUD
router.get("/pinned-conditions", verifyToken, async (req, res) => {
  const items = await PinnedCondition.find({ user: req.user.id });
  res.json(items);
});
router.post("/pinned-conditions", verifyToken, async (req, res) => {
  const item = new PinnedCondition({ ...req.body, user: req.user.id });
  await item.save();
  res.status(201).json(item);
});

// Medications CRUD
router.get("/medications", verifyToken, async (req, res) => {
  const items = await Medication.find({ user: req.user.id });
  res.json(items);
});
router.post("/medications", verifyToken, async (req, res) => {
  const item = new Medication({ ...req.body, user: req.user.id });
  await item.save();
  res.status(201).json(item);
});

module.exports = router;
