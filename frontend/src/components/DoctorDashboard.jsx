import { useState, useEffect } from "react";
import "../css/DoctorDashboard.css";

export default function DoctorDashboard({ user }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [expandedPosts, setExpandedPosts] = useState({});


  const token = localStorage.getItem("token");
  const [activePost, setActivePost] = useState(null);

  const openCommentsModal = (post) => {
  setActivePost(post);
};

const closeCommentsModal = () => {
  setActivePost(null);
};




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

  // Update posts list
  setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));

  // Clear input
  setCommentInputs({ ...commentInputs, [postId]: "" });

  // Close modal
  closeCommentsModal();
};


  const toggleExpand = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };



  const [commentInputs, setCommentInputs] = useState({});

  const timeAgo = (date) => {
    const now = new Date();
    const created = new Date(date);
    const diffMs = now - created;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHrs / 24);
    
    if (diffHrs < 1) return "just now";
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`;
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  };

  return (
    <div className="doctor-dashboard">
      <header className="doctor-header">
        <h1>Doctor Dashboard</h1>
        <p>Welcome, Dr. {user.name}</p>
      </header>

      <div className="dashboard-content-row">
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
              <div key={post._id} className={`forum-post ${expandedPosts[post._id] ? "expanded" : ""}`}>
                <h3>{post.title}</h3>
                <p>{post.content}</p>

{!expandedPosts[post._id] ? (
  <button
    className="see-more-btn"
    onClick={() => toggleExpand(post._id)}
  >
    ...see more
  </button>
) : (
  <button
    className="see-more-btn"
    onClick={() => toggleExpand(post._id)}
  >
    Show less
  </button>
)}




                <small className="post-author">By Dr. {post.author && post.author.name ? post.author.name : "Unknown"}</small>
                <br/>
                <small className="post-date">
                  {new Date(post.createdAt).toLocaleString()}
                </small>
                <div className="comment-meta">
                  <small className="comment-count">
                    {post.comments.length} comment{post.comments.length !== 1 ? "s" : ""}
                  </small>
                  <button
                    className="open-comments-btn"
                    onClick={() => openCommentsModal(post)}
                  >
                    Comments
                  </button>
                </div>
              </div>
            ))}
          </div>
          {activePost && (
            <div className="modal-overlay">
              <div className="modal">
                <h3>{activePost.title}</h3>
                <p>{activePost.content}</p>
                <div className="modal-comments">
                  {activePost.comments.map((comment) => (
                    <div key={comment._id} className="forum-comment">
                      <strong>Dr. {comment.author && comment.author.name ? comment.author.name : "Unknown"}:</strong> {comment.text}
                      <div className="comment-time">{timeAgo(comment.createdAt)}</div>
                    </div>
                  ))}
                </div>
                <form
                  onSubmit={(e) => handleAddComment(e, activePost._id)}
                  className="comment-form"
                >
                  <input
                    type="text"
                    placeholder="Add a comment..."
                    value={commentInputs[activePost._id] || ""}
                    onChange={(e) =>
                      setCommentInputs({
                        ...commentInputs,
                        [activePost._id]: e.target.value,
                      })
                    }
                    required
                  />
                  <button type="submit">Comment</button>
                </form>
                <button className="close-modal-btn" onClick={closeCommentsModal}>
                  Close
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="profile-access">
          <h2>Ask for Patient Profile Access</h2>
          <div className="coming-soon">
            <p>Coming soon... Doctors will be able to request access to patient's profile here.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
