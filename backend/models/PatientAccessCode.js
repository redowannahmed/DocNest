const mongoose = require("mongoose");

const patientAccessCodeSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  accessCode: { type: String, required: true, unique: true },
  hiddenVisitIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "MedicalHistory" }],
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date, required: true },
  accessedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Doctor who accessed
  accessedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for cleanup of expired codes
patientAccessCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("PatientAccessCode", patientAccessCodeSchema);
