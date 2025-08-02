const express = require("express");
const router = express.Router();
const { verifyToken, requireDoctorRole } = require("../middleware/authMiddleware");
const { createPost, getAllPosts, addComment, getDoctorPosts } = require("../controllers/forumController");

// Get all posts (accessible to all authenticated users - patients and doctors)
router.get("/", verifyToken, getAllPosts);

// Get only doctor posts (for patient blog view)
router.get("/doctors", verifyToken, getDoctorPosts);

// Create new post (doctors only)
router.post("/", verifyToken, requireDoctorRole, createPost);

// Add comment to a post (accessible to all authenticated users)
router.post("/:postId/comments", verifyToken, addComment);

// Test endpoint to check if routes are working
router.get("/test", verifyToken, (req, res) => {
  res.json({ 
    message: "Forum routes are working", 
    user: { 
      id: req.user.id, 
      role: req.user.role 
    },
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
