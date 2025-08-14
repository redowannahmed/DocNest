const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: Number,
    gender: String,
    location: String,
    email: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["patient", "doctor"], default: "patient" }
}, { timestamps: true });

// Create compound unique index for email + role combination
// This allows same email for different roles (patient vs doctor)
userSchema.index({ email: 1, role: 1 }, { unique: true });

module.exports = mongoose.model("User", userSchema);
