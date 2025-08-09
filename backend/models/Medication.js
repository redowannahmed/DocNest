const mongoose = require("mongoose");

const medicationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  dosage: String,
  frequency: String,
  prescriptionImg: {
    url: { type: String, required: true },
    publicId: { type: String, required: true }
  }
}, { timestamps: true });

// Add a pre-remove hook to delete associated Cloudinary files
medicationSchema.pre('remove', async function(next) {
  try {
    const { cloudinary } = require('../utils/cloudinary');
    
    // Delete prescription image
    if (this.prescriptionImg && this.prescriptionImg.publicId) {
      await cloudinary.uploader.destroy(this.prescriptionImg.publicId);
    }

    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model("Medication", medicationSchema);
