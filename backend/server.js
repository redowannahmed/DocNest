const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const uploadRoutes = require('./routes/uploadRoutes');
const authRoutes = require("./routes/authRoutes");
const userDataRoutes = require("./routes/userDataRoutes");
const forumRoutes = require("./routes/forumRoutes");
const { verifyToken } = require("./middleware/authMiddleware");
const User = require("./models/User");



const app = express(); // ✅ Declare app first

app.use(cors());
app.use(express.json());

// ✅ Then use routes
app.use('/api/upload', uploadRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/userdata", userDataRoutes);
app.use("/api/forum", forumRoutes);


// Get current user
app.get("/api/auth/me", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update user profile
app.put("/api/auth/me", verifyToken, async (req, res) => {
    try {
        const updates = (({ name, age, gender, location }) => ({ name, age, gender, location }))(req.body);
        const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
