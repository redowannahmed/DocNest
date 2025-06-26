const mongoose = require("mongoose");

const medicalHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  doctor: String,
  reason: String,
  prescriptionImgs: [String],
  testReports: [String],
  notes: String
}, { timestamps: true });

module.exports = mongoose.model("MedicalHistory", medicalHistorySchema);
