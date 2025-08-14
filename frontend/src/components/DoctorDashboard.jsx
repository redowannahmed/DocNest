import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/DoctorDashboard.css";
import PatientProfileView from "./PatientProfileView";

export default function DoctorDashboard({ user }) {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "" });
  const [expandedPosts, setExpandedPosts] = useState({});
  const [activePost, setActivePost] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState("");
  const [isCreatePostExpanded, setIsCreatePostExpanded] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [accessCodeError, setAccessCodeError] = useState("");
  const [loadingAccess, setLoadingAccess] = useState(false);
  const [patientData, setPatientData] = useState(null);
  const [showPatientProfile, setShowPatientProfile] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const showToast = (message) => {
    setNotificationMessage(message);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 4000);
  };

  const openCommentsModal = (post) => {
    setActivePost(post);
  };
  const closeCommentsModal = () => {
    setActivePost(null);
  };

  useEffect(() => {
    fetch("/api/forum", { headers: { Authorization: token } })
      .then((res) => res.json())
      .then(setPosts);
  }, [token]);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Please fill in both title and content");
      return;
    }

    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(newPost),
      });

      if (res.ok) {
        const data = await res.json();
        setPosts([data, ...posts]);
        setNewPost({ title: "", content: "" });
        setIsCreatePostExpanded(false); // Close the form after successful submission
        
        // Show success notification
        showToast("🎉 Blog post published successfully! It's now visible on the Doctor Blogs page.");
      } else {
        const errorData = await res.json();
        showToast(`❌ Failed to publish: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      showToast("❌ Failed to publish blog post. Please try again.");
    }
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
    setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)));
    setCommentInputs({ ...commentInputs, [postId]: "" });
    closeCommentsModal();
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

  const handleAccessPatient = async (e) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setAccessCodeError("Please enter an access code");
      return;
    }

    setLoadingAccess(true);
    setAccessCodeError("");

    try {
      const response = await fetch("/api/patient-access/access-patient-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      });

      if (response.ok) {
        const data = await response.json();
        setPatientData(data);
        setShowPatientProfile(true);
        setAccessCode("");
        showToast(`✅ Successfully accessed ${data.patient.name}'s profile`);
      } else {
        const errorData = await response.json();
        setAccessCodeError(errorData.message || "Invalid access code");
      }
    } catch (error) {
      console.error("Error accessing patient profile:", error);
      setAccessCodeError("Failed to access patient profile. Please try again.");
    } finally {
      setLoadingAccess(false);
    }
  };

  const closePatientProfile = () => {
    setShowPatientProfile(false);
    setPatientData(null);
  };

  return (
    <div className="doctor-dashboard">
      <header className="doctor-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="title">Doctor Dashboard</h1>
            <p>Welcome, <span className="doctor-name">Dr. {user.name}</span></p>
          </div>
          <div className="header-actions">
            <button 
              className="view-blogs-btn"
              onClick={() => navigate('/doctor-blogs')}
            >
              <i className="fas fa-external-link-alt"></i>
              View Public Blogs
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content-row">
        <section className="community-forum">
          
          {/* Create Post Section */}
          <div className="create-post-section">
            {!isCreatePostExpanded ? (
              <div className="create-post-prompt" onClick={() => setIsCreatePostExpanded(true)}>
                <div className="prompt-icon">
                  <i className="fas fa-plus-circle"></i>
                </div>
                <div className="prompt-content">
                  <h3>Create Public Blog Post</h3>
                  <p>Share your medical expertise with patients and healthcare professionals</p>
                </div>
                <div className="prompt-arrow">
                  <i className="fas fa-chevron-right"></i>
                </div>
              </div>
            ) : (
              <div className="create-post-expanded">
                <div className="section-header">
                  <div className="header-with-close">
                    <div>
                      <h2>Create Public Blog Post</h2>
                      <p className="section-description">
                        Share your medical expertise with patients and other healthcare professionals. 
                        Your posts will be visible on the public Doctor Blogs page.
                      </p>
                    </div>
                    <button 
                      type="button" 
                      className="close-form-btn"
                      onClick={() => setIsCreatePostExpanded(false)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <form onSubmit={handleCreatePost} className="forum-form">
                  <div className="form-group">
                    <label htmlFor="blog-title">Blog Title</label>
                    <input
                      id="blog-title"
                      placeholder="Enter an informative title for your blog post..."
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="blog-content">Blog Content</label>
                    <textarea
                      id="blog-content"
                      placeholder="Share your medical insights, tips, or educational content..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      required
                      rows="8"
                    />
                    <small className="character-count">
                      {newPost.content.length} characters
                    </small>
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="publish-btn">
                      <i className="fas fa-paper-plane"></i>
                      Publish Blog Post
                    </button>
                    <button 
                      type="button" 
                      className="preview-btn"
                      onClick={() => navigate('/doctor-blogs')}
                    >
                      <i className="fas fa-eye"></i>
                      Preview Public Page
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>

          {/* Published Posts Section */}
          <div className="published-posts-section">
            <div className="published-blogs">
            <div className="blogs-header">
              <h3>Your Published Blog Posts</h3>
              <p>These posts are visible to all patients and healthcare professionals</p>
            </div>
            
            {posts.length === 0 ? (
              <div className="no-posts-message">
                <i className="fas fa-edit"></i>
                <p>You haven't published any blog posts yet.</p>
                <p>Share your medical expertise by creating your first blog post above!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div
                  key={post._id}
                  className={`blog-post-preview ${expandedPosts[post._id] ? "expanded" : ""}`}
                >
                  <div className="post-header">
                    <h4 className="post-title">{post.title}</h4>
                    <div className="post-meta">
                      <span className="post-status">
                        <i className="fas fa-globe"></i>
                        Public
                      </span>
                      <span className="post-date">{timeAgo(post.createdAt)}</span>
                    </div>
                  </div>

                  <div className="post-content">
                    {expandedPosts[post._id] || post.content.length <= 200 ? (
                      <p>{post.content}</p>
                    ) : (
                      <p>
                        {post.content.substring(0, 200)}...
                      </p>
                    )}
                  </div>

                  <div className="post-actions">
                    {!expandedPosts[post._id] && post.content.length > 200 ? (
                      <button
                        className="expand-btn"
                        onClick={() => toggleExpand(post._id)}
                      >
                        <i className="fas fa-chevron-down"></i>
                        Read more
                      </button>
                    ) : expandedPosts[post._id] && post.content.length > 200 ? (
                      <button
                        className="expand-btn"
                        onClick={() => toggleExpand(post._id)}
                      >
                        <i className="fas fa-chevron-up"></i>
                        Show less
                      </button>
                    ) : null}

                    <button
                      className="view-comments-btn"
                      onClick={() => openCommentsModal(post)}
                    >
                      <i className="fas fa-comments"></i>
                      {post.comments?.length || 0} Comments
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          </div>

        </section>

        <section className="profile-access">
          <h2>Patient Profile Access</h2>
          <p className="access-description">
            Enter the access code provided by a patient to view their medical profile in read-only mode.
          </p>

          <form onSubmit={handleAccessPatient} className="access-form">
            <div className="form-group">
              <label htmlFor="access-code">Patient Access Code</label>
              <input
                type="text"
                id="access-code"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Enter 6-digit access code"
                maxLength="6"
                className={accessCodeError ? "error" : ""}
              />
              {accessCodeError && (
                <div className="error-message">{accessCodeError}</div>
              )}
            </div>
            
            <button 
              type="submit" 
              className="access-btn"
              disabled={loadingAccess || !accessCode.trim()}
            >
              {loadingAccess ? (
                <>
                  <span className="loading-spinner"></span>
                  Accessing...
                </>
              ) : (
                <>
                  <i className="fas fa-key"></i>
                  Access Patient Profile
                </>
              )}
            </button>
          </form>

          <div className="access-info">
            <h4>How it works:</h4>
            <ul>
              <li>Patients generate temporary access codes from their dashboard</li>
              <li>Access codes expire after 30 minutes for security</li>
              <li>You'll have read-only access to their medical history</li>
              <li>Patients can choose to hide specific medical visits</li>
            </ul>
          </div>
        </section>

      </div>

      {activePost && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{activePost.title}</h3>
            <p>{activePost.content}</p>

            <div className="modal-comments">
              {activePost.comments.map((comment) => (
                <div key={comment._id} className="forum-comment">
                  <strong>
                    Dr.{" "}
                    {comment.author && comment.author.name
                      ? comment.author.name
                      : "Unknown"}
                    :
                  </strong>{" "}
                  {comment.text}
                  <div className="comment-time">
                    {timeAgo(comment.createdAt)}
                  </div>
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

            <button
              className="close-modal-btn"
              onClick={closeCommentsModal}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showNotification && (
        <div className="toast-notification">
          <div className="toast-content">
            {notificationMessage}
          </div>
        </div>
      )}

      {/* Patient Profile View */}
      {showPatientProfile && patientData && (
        <PatientProfileView
          patient={patientData.patient}
          medicalHistory={patientData.medicalHistory}
          pinnedConditions={patientData.pinnedConditions}
          medications={patientData.medications}
          accessExpiresAt={patientData.accessExpiresAt}
          hiddenVisitCount={patientData.hiddenVisitCount}
          onClose={closePatientProfile}
        />
      )}

    </div>
  );
}
