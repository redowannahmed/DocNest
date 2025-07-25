const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: Number,
    gender: String,
    location: String,
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["patient", "doctor"], default: "patient" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
