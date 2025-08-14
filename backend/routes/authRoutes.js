const express = require("express");
const { register, login } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");
const User = require("../models/User");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

// Get current user info
router.get("/me", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
