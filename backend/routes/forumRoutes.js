const express = require("express");
const router = express.Router();
const { verifyToken, requireDoctorRole } = require("../middleware/authMiddleware");
const { createPost, getAllPosts, addComment } = require("../controllers/forumController");

// Get all posts
router.get("/", verifyToken, requireDoctorRole, getAllPosts);

// Create new post
router.post("/", verifyToken, requireDoctorRole, createPost);

// Add comment to a post
router.post("/:postId/comments", verifyToken, requireDoctorRole, addComment);

module.exports = router;
