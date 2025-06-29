import { useState, useEffect } from "react";
import "../css/DoctorDashboard.css";

export default function DoctorDashboard({ user }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/api/forum", {
      headers: { Authorization: token },
    })
      .then(res => res.json())
      .then(setPosts);
  }, [token]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/forum", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify(newPost),
    });
    const data = await res.json();
    setPosts([data, ...posts]);
    setNewPost({ title: "", content: "" });
  };
  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text) return;

    const res = await fetch(`/api/forum/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ text }),
    });

    const updatedPost = await res.json();
    setPosts(posts.map(p => p._id === updatedPost._id ? updatedPost : p));
    setCommentInputs({ ...commentInputs, [postId]: "" });
  };

  const [commentInputs, setCommentInputs] = useState({});

  return (
    <div className="doctor-dashboard">
      <header className="doctor-header">
        <h1>Doctor Dashboard</h1>
        <p>Welcome, Dr. {user.name}</p>
      </header>

      <section className="community-forum">
        <h2>Community Forum</h2>

        <form onSubmit={handleCreatePost} className="forum-form">
          <input
            placeholder="Post Title"
            value={newPost.title}
            onChange={e => setNewPost({ ...newPost, title: e.target.value })}
            required
          />
          <textarea
            placeholder="What's on your mind?"
            value={newPost.content}
            onChange={e => setNewPost({ ...newPost, content: e.target.value })}
            required
          />
          <button type="submit">Post</button>
        </form>

        <div className="forum-posts">
          {posts.map(post => (
            <div key={post._id} className="forum-post">
              <h3>{post.title}</h3>
              <p>{post.content}</p>
              <small className="post-author">By Dr. {post.author.name}</small>
              <br/>
              <small className="post-date">
                {new Date(post.createdAt).toLocaleString()}
              </small>

              <div className="forum-comments">
                {post.comments.map(comment => (
                  <div key={comment._id} className="forum-comment">
                    <strong>Dr. {comment.author.name}:</strong> {comment.text}
                  </div>
                ))}
              </div>

              <form onSubmit={e => handleAddComment(e, post._id)} className="comment-form">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentInputs[post._id] || ""}
                  onChange={e =>
                    setCommentInputs({ ...commentInputs, [post._id]: e.target.value })
                  }
                  required
                />
                <button type="submit">Comment</button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section className="profile-access">
        <h2>Ask for Patient Profile Access</h2>
        <div className="coming-soon">
          <p>Coming soon... Doctors will be able to request patient profiles here.</p>
        </div>
      </section>

    </div>
  );
}
