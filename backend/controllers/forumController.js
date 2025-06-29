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
      .populate("author", "name")
      .populate("comments.author", "name")
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
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
