import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/DoctorBlogs.css";
import sessionManager from "../utils/SessionManager";

export default function DoctorBlogs() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPosts, setExpandedPosts] = useState({});
  const [activePost, setActivePost] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const token = sessionManager.getToken();
  const user = sessionManager.getUser(); // Updated: get current user to determine proper back navigation

  useEffect(() => {
    fetchDoctorPosts();
    // Test API connectivity
    testAPIConnection();
  }, []);

  const testAPIConnection = async () => {
    try {
      const response = await fetch("/api/forum/test", {
        headers: { Authorization: token }
      });
      if (response.ok) {
        const data = await response.json();
        console.log("API Test successful:", data);
      } else {
        console.log("API Test failed:", response.status, response.statusText);
      }
    } catch (error) {
      console.log("API Test error:", error);
    }
  };

  const fetchDoctorPosts = async () => {
    try {
      console.log("Fetching doctor posts...");
      console.log("Token:", token ? "Present" : "Missing");
      
      // Check if we have a valid token
      if (!token) {
        navigate("/signin");
        return;
      }
      
      // First try to get all posts to see if the API is working
      const allPostsResponse = await fetch("/api/forum", {
        headers: { 
          Authorization: token,
          "Content-Type": "application/json"
        },
      });
      
      console.log("All posts response status:", allPostsResponse.status);
      console.log("Response headers:", allPostsResponse.headers);
      
      if (allPostsResponse.ok) {
        const allPosts = await allPostsResponse.json();
        console.log("All posts received:", allPosts);
        
        if (allPosts.length === 0) {
          setPosts([]);
          return;
        }
        
        // Filter to show only doctor posts
        const doctorPosts = allPosts.filter(post => {
          console.log(`Post by ${post.author?.name} (role: ${post.author?.role})`);
          return post.author?.role === "doctor";
        });
        
        console.log("Filtered doctor posts:", doctorPosts);
        setPosts(doctorPosts);
      } else {
        console.error("Failed to fetch posts:", allPostsResponse.status, allPostsResponse.statusText);
        
        if (allPostsResponse.status === 401) {
          // Token might be expired, redirect to login
          sessionManager.logout();
          navigate("/signin");
          return;
        } else if (allPostsResponse.status === 403) {
          console.error("Access forbidden");
        } else {
          const errorText = await allPostsResponse.text();
          console.error("Error response:", errorText);
        }
      }
      
    } catch (error) {
      console.error("Error fetching doctor posts:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDoctorPosts();
  };

  const handleAddComment = async (e, postId) => {
    e.preventDefault();
    const text = commentInputs[postId];
    if (!text) return;

    try {
      const res = await fetch(`/api/forum/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const updatedPost = await res.json();
        console.log("Comment added, updated post:", updatedPost);
        setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
        setCommentInputs({ ...commentInputs, [postId]: "" });
        setActivePost(updatedPost); // Update the active post to show new comment
      } else {
        console.error("Failed to add comment:", res.status, res.statusText);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const openCommentsModal = (post) => {
    setActivePost(post);
  };

  const closeCommentsModal = () => {
    setActivePost(null);
  };

  const toggleExpand = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

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

  if (loading) {
    return (
      <div className="doctor-blogs">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading doctor blogs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="doctor-blogs">
      <header className="doctor-blogs-header">
        <div className="header-content">
          <button onClick={() => navigate(user?.role === 'doctor' ? '/doctor' : '/dashboard')} className="back-button">
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>
          <div className="header-title">
            <h1>Doctor Blogs</h1>
            <p>Expert insights and medical knowledge from healthcare professionals</p>
          </div>
          <button 
            onClick={handleRefresh} 
            className="refresh-button"
            disabled={refreshing}
          >
            <i className={`fas fa-sync-alt ${refreshing ? 'spinning' : ''}`}></i>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </header>

      <div className="blogs-content">
        {posts.length === 0 ? (
          <div className="no-posts">
            <div className="no-posts-icon">
              <i className="fas fa-stethoscope"></i>
            </div>
            <h3>No Doctor Blogs Yet</h3>
            <p>Check back later for expert medical insights and tips from healthcare professionals.</p>
          </div>
        ) : (
          <div className="posts-container">
            {posts.map((post) => (
              <article key={post._id} className="blog-post">
                <div className="post-header">
                  <div className="author-info">
                    <div className="author-avatar">
                      <i className="fas fa-user-md"></i>
                    </div>
                    <div className="author-details">
                      <h4 className="author-name">
                        {post.author?.role === "doctor" ? "Dr. " : ""}{post.author?.name || "Unknown"}
                        {/* Debug info */}
                        <small style={{color: '#666', fontWeight: 'normal'}}>
                          {" "}(Role: {post.author?.role || "unknown"})
                        </small>
                      </h4>
                      <span className="post-time">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                  {post.author?.role === "doctor" ? (
                    <div className="doctor-badge">
                      <i className="fas fa-certificate"></i>
                      Verified Doctor
                    </div>
                  ) : (
                    <div className="patient-badge">
                      <i className="fas fa-user"></i>
                      {post.author?.role || "User"}
                    </div>
                  )}
                </div>

                <div className="post-content">
                  <h2 className="post-title">{post.title}</h2>
                  <div className="post-body">
                    {expandedPosts[post._id] || post.content.length <= 300 ? (
                      <p>{post.content}</p>
                    ) : (
                      <p>
                        {post.content.substring(0, 300)}...
                        <button
                          className="read-more-btn"
                          onClick={() => toggleExpand(post._id)}
                        >
                          Read more
                        </button>
                      </p>
                    )}
                    {expandedPosts[post._id] && post.content.length > 300 && (
                      <button
                        className="read-less-btn"
                        onClick={() => toggleExpand(post._id)}
                      >
                        Read less
                      </button>
                    )}
                  </div>
                </div>

                <div className="post-actions">
                  <button
                    className="comment-btn"
                    onClick={() => openCommentsModal(post)}
                  >
                    <i className="fas fa-comment"></i>
                    {post.comments?.length || 0} Comments
                  </button>
                  <button className="like-btn">
                    <i className="fas fa-heart"></i>
                    Helpful
                  </button>
                  <button className="share-btn">
                    <i className="fas fa-share"></i>
                    Share
                  </button>
                </div>

                {post.comments && post.comments.length > 0 && (
                  <div className="recent-comments">
                    <h5>Recent Comments:</h5>
                    {post.comments.slice(-2).map((comment, idx) => (
                      <div key={idx} className="comment-preview">
                        <strong>{comment.author?.name || "User"}:</strong>
                        <span>{comment.text}</span>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Comments Modal */}
      {activePost && (
        <div className="comments-modal-overlay" onClick={closeCommentsModal}>
          <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Comments</h3>
              <button className="close-btn" onClick={closeCommentsModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              <div className="post-summary">
                <h4>{activePost.title}</h4>
                <p className="post-author">By Dr. {activePost.author?.name}</p>
              </div>

              <div className="comments-section">
                {activePost.comments && activePost.comments.length > 0 ? (
                  activePost.comments.map((comment, idx) => (
                    <div key={idx} className="comment">
                      <div className="comment-author">
                        <i className="fas fa-user"></i>
                        <strong>{comment.author?.name || "User"}</strong>
                        <span className="comment-time">
                          {timeAgo(comment.createdAt)}
                        </span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="no-comments">No comments yet. Be the first to comment!</p>
                )}
              </div>

              <form
                className="comment-form"
                onSubmit={(e) => handleAddComment(e, activePost._id)}
              >
                <div className="comment-input-group">
                  <textarea
                    placeholder="Add your comment..."
                    value={commentInputs[activePost._id] || ""}
                    onChange={(e) =>
                      setCommentInputs({
                        ...commentInputs,
                        [activePost._id]: e.target.value,
                      })
                    }
                    required
                  />
                  <button type="submit" className="submit-comment-btn">
                    <i className="fas fa-paper-plane"></i>
                    Post Comment
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
