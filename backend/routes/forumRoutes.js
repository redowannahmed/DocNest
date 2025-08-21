const express = require("express");
const router = express.Router();
const { verifyToken, requireDoctorRole } = require("../middleware/authMiddleware");
const { createPost, getAllPosts, addComment, getDoctorPosts, getMyPosts, updatePost, deletePost } = require("../controllers/forumController");

// Get all posts (accessible to all authenticated users - patients and doctors)
router.get("/", verifyToken, getAllPosts);

// Get only doctor posts (for patient blog view)
router.get("/doctors", verifyToken, getDoctorPosts);

// Get only current doctor's posts (for doctor dashboard)
router.get("/my-posts", verifyToken, requireDoctorRole, getMyPosts);

// Create new post (doctors only)
router.post("/", verifyToken, requireDoctorRole, createPost);

// Update post (doctors only, own posts)
router.put("/:postId", verifyToken, requireDoctorRole, updatePost);

// Delete post (doctors only, own posts)
router.delete("/:postId", verifyToken, requireDoctorRole, deletePost);

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
