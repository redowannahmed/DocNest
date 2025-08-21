const ForumPost = require("../models/ForumPost");

exports.createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const post = new ForumPost({
      author: req.user.id,
      title,
      content,
    });
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAllPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate("author", "name role")
      .populate("comments.author", "name role")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;

    const post = await ForumPost.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      author: req.user.id,
      text,
    });

    await post.save();
    
    // Populate the updated post with author details including role
    const populatedPost = await ForumPost.findById(postId)
      .populate("author", "name role")
      .populate("comments.author", "name role");
      
    res.status(201).json(populatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDoctorPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find()
      .populate("author", "name role")
      .populate("comments.author", "name role")
      .sort({ createdAt: -1 });
    
    // Filter posts to only include those by doctors
    const doctorPosts = posts.filter(post => post.author?.role === "doctor");
    res.json(doctorPosts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyPosts = async (req, res) => {
  try {
    const posts = await ForumPost.find({ author: req.user.id })
      .populate("author", "name role")
      .populate("comments.author", "name role")
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content } = req.body;

    const post = await ForumPost.findOne({ _id: postId, author: req.user.id });
    if (!post) {
      return res.status(404).json({ message: "Post not found or you don't have permission to edit this post" });
    }

    post.title = title;
    post.content = content;
    await post.save();

    const updatedPost = await ForumPost.findById(postId)
      .populate("author", "name role")
      .populate("comments.author", "name role");

    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await ForumPost.findOne({ _id: postId, author: req.user.id });
    if (!post) {
      return res.status(404).json({ message: "Post not found or you don't have permission to delete this post" });
    }

    await ForumPost.findByIdAndDelete(postId);
    res.json({ message: "Post deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
