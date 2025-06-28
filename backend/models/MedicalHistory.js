const mongoose = require("mongoose");

const medicalHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, required: true },
  doctor: String,
  specialty: String,  // Added to match frontend
  reason: String,
  status: { type: String, enum: ["Scheduled", "Completed", "Cancelled"], default: "Completed" }, // Added to match frontend
  prescriptionImgs: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  }],
  testReports: [{
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  }],
  notes: String
}, { timestamps: true });

// Add a pre-remove hook to delete associated Cloudinary files
medicalHistorySchema.pre('remove', async function(next) {
  try {
    const { cloudinary } = require('../utils/cloudinary');
    
    // Delete prescription images
    await Promise.all(this.prescriptionImgs.map(async (img) => {
      await cloudinary.uploader.destroy(img.publicId);
    }));

    // Delete test reports
    await Promise.all(this.testReports.map(async (report) => {
      await cloudinary.uploader.destroy(report.publicId);
    }));

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("MedicalHistory", medicalHistorySchema);