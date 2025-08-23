const mongoose = require("mongoose");

const doctorRequestSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }, // Store hashed password
    age: Number,
    gender: String,
    location: String,
    bmdcId: { type: String, required: true }, // BMDC registration ID
    status: { 
        type: String, 
        enum: ["pending", "approved", "rejected"], 
        default: "pending" 
    },
    submittedAt: { type: Date, default: Date.now },
    reviewedAt: Date,
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Admin who reviewed
    rejectionReason: String
}, { timestamps: true });

// Create unique index for email to prevent duplicate requests
doctorRequestSchema.index({ email: 1 }, { unique: true });
// Create unique index for BMDC ID to prevent duplicate doctor registrations
doctorRequestSchema.index({ bmdcId: 1 }, { unique: true });

module.exports = mongoose.model("DoctorRequest", doctorRequestSchema);
