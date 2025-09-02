"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import {
  User,
  Key,
  Clock,
  Shield,
  EyeOff,
  Plus,
  Edit3,
  Trash2,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  X,
  Save,
  Eye,
  Send,
  ExternalLink,
  LogOut,
  FileText,
  Globe,
} from "lucide-react"
import DoctorAddVisitDialog from "./DoctorAddVisitDialog"
import sessionManager from "../utils/SessionManager"
import "../css/DoctorDashboard.css"

export default function DoctorDashboard({ user, onLogout }) {
  const [posts, setPosts] = useState([])
  const [newPost, setNewPost] = useState({ title: "", content: "" })
  const [expandedPosts, setExpandedPosts] = useState({})
  const [activePost, setActivePost] = useState(null)
  const [commentInputs, setCommentInputs] = useState({})
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState("")
  const [isCreatePostExpanded, setIsCreatePostExpanded] = useState(false)
  const [accessCode, setAccessCode] = useState("")
  const [accessCodeError, setAccessCodeError] = useState("")
  const [loadingAccess, setLoadingAccess] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [editForm, setEditForm] = useState({ title: "", content: "" })
  const [showAddVisit, setShowAddVisit] = useState(false)
  const [currentAccessCode, setCurrentAccessCode] = useState("")
  const navigate = useNavigate()
  const location = useLocation()
  const token = sessionManager.getToken()

  const showToast = (message) => {
    setNotificationMessage(message)
    setShowNotification(true)
    setTimeout(() => {
      setShowNotification(false)
    }, 4000)
  }

  const openCommentsModal = (post) => {
    setActivePost(post)
  }
  const closeCommentsModal = () => {
    setActivePost(null)
  }

  useEffect(() => {
    fetch("/api/forum/my-posts", { headers: { Authorization: token } })
      .then((res) => res.json())
      .then(setPosts)
  }, [token])

  // Handle location state when returning from patient profile
  useEffect(() => {
    if (location.state?.showAddVisit && location.state?.accessCode) {
      setShowAddVisit(true)
      setCurrentAccessCode(location.state.accessCode)
      // Clear the location state to prevent re-triggering
      window.history.replaceState({}, document.title)
    }
  }, [location.state])

  const handleCreatePost = async (e) => {
    e.preventDefault()

    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("Please fill in both title and content")
      return
    }

    try {
      const res = await fetch("/api/forum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(newPost),
      })

      if (res.ok) {
        const data = await res.json()
        setPosts([data, ...posts])
        setNewPost({ title: "", content: "" })
        setIsCreatePostExpanded(false) // Close the form after successful submission

        // Show success notification
        showToast("🎉 Blog post published successfully! It's now visible on the Doctor Blogs page.")
      } else {
        const errorData = await res.json()
        showToast(`❌ Failed to publish: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error creating post:", error)
      showToast("❌ Failed to publish blog post. Please try again.")
    }
  }

  const handleAddComment = async (e, postId) => {
    e.preventDefault()
    const text = commentInputs[postId]
    if (!text) return

    const res = await fetch(`/api/forum/${postId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
      body: JSON.stringify({ text }),
    })

    const updatedPost = await res.json()
    setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)))
    setCommentInputs({ ...commentInputs, [postId]: "" })
    closeCommentsModal()
  }

  const toggleExpand = (postId) => {
    setExpandedPosts((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }

  const timeAgo = (date) => {
    const now = new Date()
    const created = new Date(date)
    const diffMs = now - created
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHrs / 24)

    if (diffHrs < 1) return "just now"
    if (diffHrs < 24) return `${diffHrs} hour${diffHrs > 1 ? "s" : ""} ago`
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
  }

  const handleAccessPatient = async (e) => {
    e.preventDefault()
    if (!accessCode.trim()) {
      setAccessCodeError("Please enter an access code")
      return
    }

    setLoadingAccess(true)
    setAccessCodeError("")

    try {
      const response = await fetch("/api/patient-access/access-patient-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({ accessCode: accessCode.trim() }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentAccessCode(accessCode.trim())
        setAccessCode("")
        showToast(`✅ Successfully accessed ${data.patient.name}'s profile`)

        // Navigate to full-page patient profile
        navigate("/patient-profile", { state: { patientData: data } })
      } else {
        const errorData = await response.json()
        setAccessCodeError(errorData.message || "Invalid access code")
      }
    } catch (error) {
      console.error("Error accessing patient profile:", error)
      setAccessCodeError("Failed to access patient profile. Please try again.")
    } finally {
      setLoadingAccess(false)
    }
  }

  const startEditPost = (post) => {
    setEditingPost(post._id)
    setEditForm({ title: post.title, content: post.content })
  }

  const cancelEdit = () => {
    setEditingPost(null)
    setEditForm({ title: "", content: "" })
  }

  const handleEditPost = async (e) => {
    e.preventDefault()

    if (!editForm.title.trim() || !editForm.content.trim()) {
      alert("Please fill in both title and content")
      return
    }

    try {
      const res = await fetch(`/api/forum/${editingPost}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(editForm),
      })

      if (res.ok) {
        const updatedPost = await res.json()
        setPosts(posts.map((p) => (p._id === updatedPost._id ? updatedPost : p)))
        setEditingPost(null)
        setEditForm({ title: "", content: "" })
        showToast("✅ Blog post updated successfully!")
      } else {
        const errorData = await res.json()
        showToast(`❌ Failed to update: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error updating post:", error)
      showToast("❌ Failed to update blog post. Please try again.")
    }
  }

  const handleDeletePost = async (postId) => {
    if (!confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      return
    }

    try {
      const res = await fetch(`/api/forum/${postId}`, {
        method: "DELETE",
        headers: {
          Authorization: token,
        },
      })

      if (res.ok) {
        setPosts(posts.filter((p) => p._id !== postId))
        showToast("🗑️ Blog post deleted successfully!")
      } else {
        const errorData = await res.json()
        showToast(`❌ Failed to delete: ${errorData.message || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Error deleting post:", error)
      showToast("❌ Failed to delete blog post. Please try again.")
    }
  }

  return (
    <div className="doctor-dashboard">
      <header className="dashboard-header">
        <div
          style={{
            maxWidth: "80rem",
            margin: "0 auto",
            padding: "1.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  background: "linear-gradient(135deg, #374151 0%, #1f2937 100%)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--shadow-medium)",
                }}
              >
                <User style={{ width: "1.5rem", height: "1.5rem", color: "#ffffff" }} />
              </div>
              <div>
                <h1
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: "0 0 0.25rem 0",
                  }}
                >
                  Doctor Dashboard
                </h1>
                <p
                  style={{
                    color: "#6b7280",
                    margin: 0,
                  }}
                >
                  Welcome, <span style={{ fontWeight: "500", color: "#1f2937" }}>Dr. {user.name}</span>
                </p>
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <button
                onClick={() => navigate("/doctor-blogs")}
                className="btn-secondary"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.75rem 1.25rem",
                  fontWeight: "500",
                  fontSize: "0.875rem",
                }}
              >
                <ExternalLink style={{ width: "1rem", height: "1rem" }} />
                View Public Blogs
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="btn-destructive"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.25rem",
                    fontWeight: "500",
                    fontSize: "0.875rem",
                  }}
                >
                  <LogOut style={{ width: "1rem", height: "1rem" }} />
                  Logout
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main
        style={{
          maxWidth: "80rem",
          margin: "0 auto",
          padding: "2rem 1.5rem",
        }}
      >
        <div style={{ marginBottom: "2rem" }}>
          <section className="dashboard-card" style={{ padding: "1.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "1rem",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  width: "3rem",
                  height: "3rem",
                  background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--shadow-soft)",
                }}
              >
                <Key style={{ width: "1.5rem", height: "1.5rem", color: "#6366f1" }} />
              </div>
              <div style={{ flex: "1" }}>
                <h2
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: "0 0 0.5rem 0",
                  }}
                >
                  Patient Profile Access
                </h2>
                <p
                  style={{
                    color: "#6b7280",
                    margin: 0,
                  }}
                >
                  Enter the access code provided by a patient to view their medical profile in read-only mode.
                </p>
              </div>
            </div>

            <form onSubmit={handleAccessPatient}>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "flex-end",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    flex: "1",
                    maxWidth: "20rem",
                  }}
                >
                  <label
                    htmlFor="access-code"
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      color: "#1f2937",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Access Code
                  </label>
                  <input
                    type="text"
                    id="access-code"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength="6"
                    style={{
                      width: "100%",
                      padding: "0.75rem 1rem",
                      backgroundColor: "#ffffff",
                      border: `1px solid ${accessCodeError ? "#ef4444" : "#e5e7eb"}`,
                      borderRadius: "0.5rem",
                      fontSize: "1rem",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                    }}
                    onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #8b5cf6")}
                    onBlur={(e) => (e.target.style.boxShadow = "none")}
                  />
                  {accessCodeError && (
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#ef4444",
                        marginTop: "0.25rem",
                      }}
                    >
                      {accessCodeError}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loadingAccess || !accessCode.trim()}
                  className="btn-primary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.75rem 1.5rem",
                    fontWeight: "500",
                    cursor: loadingAccess || !accessCode.trim() ? "not-allowed" : "pointer",
                    opacity: loadingAccess || !accessCode.trim() ? 0.5 : 1,
                    transition: "background-color 0.15s",
                  }}
                  onMouseOver={(e) => {
                    if (!loadingAccess && accessCode.trim()) {
                      e.target.style.backgroundColor = "rgba(31, 41, 55, 0.9)"
                    }
                  }}
                  onMouseOut={(e) => {
                    if (!loadingAccess && accessCode.trim()) {
                      e.target.style.backgroundColor = "#1f2937"
                    }
                  }}
                >
                  {loadingAccess ? (
                    <>
                      <div
                        style={{
                          width: "1rem",
                          height: "1rem",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                          borderTop: "2px solid white",
                          borderRadius: "50%",
                          animation: "spin 1s linear infinite",
                        }}
                      />
                      Accessing...
                    </>
                  ) : (
                    <>
                      <Key style={{ width: "1rem", height: "1rem" }} />
                      Access Profile
                    </>
                  )}
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                  fontSize: "0.875rem",
                  color: "#6b7280",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Clock style={{ width: "1rem", height: "1rem" }} />
                  Expires in 30 min
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <Shield style={{ width: "1rem", height: "1rem" }} />
                  Read-only access
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <EyeOff style={{ width: "1rem", height: "1rem" }} />
                  Patient can hide visits
                </div>
              </div>
            </form>
          </section>
        </div>

        {/* Create Post Section */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div className="dashboard-card" style={{ overflow: "hidden" }}>
            {!isCreatePostExpanded ? (
              <button
                onClick={() => setIsCreatePostExpanded(true)}
                style={{
                  width: "100%",
                  padding: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  backgroundColor: "transparent",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(249, 250, 251, 0.5)")}
                onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
              >
                <div
                  style={{
                    width: "3rem",
                    height: "3rem",
                    background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                    borderRadius: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "var(--shadow-soft)",
                  }}
                >
                  <Plus style={{ width: "1.5rem", height: "1.5rem", color: "#6366f1" }} />
                </div>
                <div style={{ flex: "1" }}>
                  <h3
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: "600",
                      color: "#1f2937",
                      margin: "0 0 0.25rem 0",
                    }}
                  >
                    Create Public Blog Post
                  </h3>
                  <p
                    style={{
                      color: "#6b7280",
                      margin: 0,
                    }}
                  >
                    Share your medical expertise with patients and healthcare professionals
                  </p>
                </div>
                <ChevronDown style={{ width: "1.25rem", height: "1.25rem", color: "#6b7280" }} />
              </button>
            ) : (
              <div style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "1.5rem",
                  }}
                >
                  <div>
                    <h2
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: "600",
                        color: "#1f2937",
                        margin: "0 0 0.5rem 0",
                      }}
                    >
                      Create Public Blog Post
                    </h2>
                    <p
                      style={{
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      Share your medical insights, tips, or educational content... Your posts will be visible on the
                      public Doctor Blogs page.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsCreatePostExpanded(false)}
                    style={{
                      padding: "0.5rem",
                      backgroundColor: "transparent",
                      border: "none",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      transition: "background-color 0.15s",
                    }}
                    onMouseOver={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                    onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
                  >
                    <X style={{ width: "1.25rem", height: "1.25rem", color: "#6b7280" }} />
                  </button>
                </div>

                <form onSubmit={handleCreatePost}>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      htmlFor="blog-title"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "#1f2937",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Blog Title
                    </label>
                    <input
                      id="blog-title"
                      type="text"
                      placeholder="Enter an informative title for your blog post..."
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                      onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #8b5cf6")}
                      onBlur={(e) => (e.target.style.boxShadow = "none")}
                    />
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      htmlFor="blog-content"
                      style={{
                        display: "block",
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "#1f2937",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Blog Content
                    </label>
                    <textarea
                      id="blog-content"
                      placeholder="Share your medical insights, tips, or educational content..."
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      required
                      rows="8"
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        backgroundColor: "#ffffff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        fontSize: "1rem",
                        resize: "none",
                        transition: "border-color 0.15s, box-shadow 0.15s",
                      }}
                      onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #8b5cf6")}
                      onBlur={(e) => (e.target.style.boxShadow = "none")}
                    />
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        marginTop: "0.25rem",
                      }}
                    >
                      {newPost.content.length} characters
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                    }}
                  >
                    <button
                      type="submit"
                      className="btn-primary"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1.5rem",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      <Send style={{ width: "1rem", height: "1rem" }} />
                      Publish Blog Post
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/doctor-blogs")}
                      className="btn-secondary"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.75rem 1.5rem",
                        fontWeight: "500",
                        cursor: "pointer",
                      }}
                    >
                      <Eye style={{ width: "1rem", height: "1rem" }} />
                      Preview Public Page
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Published Posts Section */}
        <div className="dashboard-card" style={{ padding: "1.5rem" }}>
          <div style={{ marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                color: "#1f2937",
                margin: "0 0 0.5rem 0",
              }}
            >
              Your Published Blog Posts
            </h3>
            <p
              style={{
                color: "#6b7280",
                margin: 0,
              }}
            >
              These posts are visible to all patients and healthcare professionals
            </p>
          </div>

          {posts.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "3rem 0",
              }}
            >
              <div
                style={{
                  width: "4rem",
                  height: "4rem",
                  backgroundColor: "rgba(249, 250, 251, 0.5)",
                  borderRadius: "0.75rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1rem auto",
                }}
              >
                <FileText style={{ width: "2rem", height: "2rem", color: "#6b7280" }} />
              </div>
              <h4
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "500",
                  color: "#1f2937",
                  margin: "0 0 0.5rem 0",
                }}
              >
                No blog posts yet
              </h4>
              <p
                style={{
                  color: "#6b7280",
                  margin: "0 0 1rem 0",
                }}
              >
                Share your medical expertise by creating your first blog post above!
              </p>
            </div>
          ) : (
            <div>
              {posts.map((post) => (
                <div
                  key={post._id}
                  className="dashboard-card"
                  style={{
                    padding: "1.5rem",
                    marginBottom: "1rem",
                    transition: "all 0.3s ease",
                  }}
                >
                  {editingPost === post._id ? (
                    /* Edit Form */
                    <form onSubmit={handleEditPost}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: "1rem",
                        }}
                      >
                        <h4
                          style={{
                            fontSize: "1.125rem",
                            fontWeight: "500",
                            color: "#1f2937",
                            margin: 0,
                          }}
                        >
                          Edit Blog Post
                        </h4>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{
                            padding: "0.5rem",
                            backgroundColor: "transparent",
                            border: "none",
                            borderRadius: "0.5rem",
                            cursor: "pointer",
                            transition: "background-color 0.15s",
                          }}
                          onMouseOver={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                          onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
                        >
                          <X style={{ width: "1rem", height: "1rem", color: "#6b7280" }} />
                        </button>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <label
                          htmlFor={`edit-title-${post._id}`}
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#1f2937",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Title
                        </label>
                        <input
                          id={`edit-title-${post._id}`}
                          type="text"
                          value={editForm.title}
                          onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                          required
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            fontSize: "1rem",
                            transition: "border-color 0.15s, box-shadow 0.15s",
                          }}
                          onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #8b5cf6")}
                          onBlur={(e) => (e.target.style.boxShadow = "none")}
                        />
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <label
                          htmlFor={`edit-content-${post._id}`}
                          style={{
                            display: "block",
                            fontSize: "0.875rem",
                            fontWeight: "500",
                            color: "#1f2937",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Content
                        </label>
                        <textarea
                          id={`edit-content-${post._id}`}
                          value={editForm.content}
                          onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                          required
                          rows="6"
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            backgroundColor: "#ffffff",
                            border: "1px solid #e5e7eb",
                            borderRadius: "0.5rem",
                            fontSize: "1rem",
                            resize: "none",
                            transition: "border-color 0.15s, box-shadow 0.15s",
                          }}
                          onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #8b5cf6")}
                          onBlur={(e) => (e.target.style.boxShadow = "none")}
                        />
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                        }}
                      >
                        <button
                          type="submit"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 1rem",
                            backgroundColor: "#1f2937",
                            color: "#ffffff",
                            borderRadius: "0.5rem",
                            border: "none",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.15s",
                          }}
                          onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(31, 41, 55, 0.9)")}
                          onMouseOut={(e) => (e.target.style.backgroundColor = "#1f2937")}
                        >
                          <Save style={{ width: "1rem", height: "1rem" }} />
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={cancelEdit}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#f3f4f6",
                            color: "#1f2937",
                            borderRadius: "0.5rem",
                            border: "none",
                            fontWeight: "500",
                            cursor: "pointer",
                            transition: "background-color 0.15s",
                          }}
                          onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(243, 244, 246, 0.8)")}
                          onMouseOut={(e) => (e.target.style.backgroundColor = "#f3f4f6")}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    /* Regular Post View */
                    <>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          marginBottom: "1rem",
                        }}
                      >
                        <div style={{ flex: "1" }}>
                          <h4
                            style={{
                              fontSize: "1.125rem",
                              fontWeight: "600",
                              color: "#1f2937",
                              margin: "0 0 0.5rem 0",
                            }}
                          >
                            {post.title}
                          </h4>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1rem",
                              fontSize: "0.875rem",
                              color: "#6b7280",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.25rem",
                              }}
                            >
                              <Globe style={{ width: "1rem", height: "1rem" }} />
                              Public
                            </div>
                            <span>{timeAgo(post.createdAt)}</span>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        {expandedPosts[post._id] || post.content.length <= 200 ? (
                          <p
                            style={{
                              color: "#1f2937",
                              lineHeight: "1.625",
                              margin: 0,
                            }}
                          >
                            {post.content}
                          </p>
                        ) : (
                          <p
                            style={{
                              color: "#1f2937",
                              lineHeight: "1.625",
                              margin: 0,
                            }}
                          >
                            {post.content.substring(0, 200)}...
                          </p>
                        )}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.75rem",
                        }}
                      >
                        {!expandedPosts[post._id] && post.content.length > 200 ? (
                          <button
                            onClick={() => toggleExpand(post._id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.875rem",
                              color: "#8b5cf6",
                              backgroundColor: "transparent",
                              border: "none",
                              cursor: "pointer",
                              transition: "color 0.15s",
                            }}
                            onMouseOver={(e) => (e.target.style.color = "rgba(139, 92, 246, 0.8)")}
                            onMouseOut={(e) => (e.target.style.color = "#8b5cf6")}
                          >
                            <ChevronDown style={{ width: "1rem", height: "1rem" }} />
                            Read more
                          </button>
                        ) : expandedPosts[post._id] && post.content.length > 200 ? (
                          <button
                            onClick={() => toggleExpand(post._id)}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              fontSize: "0.875rem",
                              color: "#8b5cf6",
                              backgroundColor: "transparent",
                              border: "none",
                              cursor: "pointer",
                              transition: "color 0.15s",
                            }}
                            onMouseOver={(e) => (e.target.style.color = "rgba(139, 92, 246, 0.8)")}
                            onMouseOut={(e) => (e.target.style.color = "#8b5cf6")}
                          >
                            <ChevronUp style={{ width: "1rem", height: "1rem" }} />
                            Show less
                          </button>
                        ) : null}

                        <button
                          onClick={() => openCommentsModal(post)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.875rem",
                            color: "#6b7280",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            transition: "color 0.15s",
                          }}
                          onMouseOver={(e) => (e.target.style.color = "#1f2937")}
                          onMouseOut={(e) => (e.target.style.color = "#6b7280")}
                        >
                          <MessageCircle style={{ width: "1rem", height: "1rem" }} />
                          {post.comments?.length || 0} Comments
                        </button>

                        <button
                          onClick={() => startEditPost(post)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.875rem",
                            color: "#6b7280",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            transition: "color 0.15s",
                          }}
                          onMouseOver={(e) => (e.target.style.color = "#1f2937")}
                          onMouseOut={(e) => (e.target.style.color = "#6b7280")}
                        >
                          <Edit3 style={{ width: "1rem", height: "1rem" }} />
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeletePost(post._id)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.875rem",
                            color: "#ef4444",
                            backgroundColor: "transparent",
                            border: "none",
                            cursor: "pointer",
                            transition: "color 0.15s",
                          }}
                          onMouseOver={(e) => (e.target.style.color = "rgba(239, 68, 68, 0.8)")}
                          onMouseOut={(e) => (e.target.style.color = "#ef4444")}
                        >
                          <Trash2 style={{ width: "1rem", height: "1rem" }} />
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {activePost && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            zIndex: 50,
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "0.75rem",
              border: "1px solid #e5e7eb",
              maxWidth: "42rem",
              width: "100%",
              maxHeight: "80vh",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: "1.5rem",
                borderBottom: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: "600",
                    color: "#1f2937",
                    margin: 0,
                  }}
                >
                  {activePost.title}
                </h3>
                <button
                  onClick={closeCommentsModal}
                  style={{
                    padding: "0.5rem",
                    backgroundColor: "transparent",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "#f9fafb")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")}
                >
                  <X style={{ width: "1.25rem", height: "1.25rem", color: "#6b7280" }} />
                </button>
              </div>
            </div>

            <div
              style={{
                padding: "1.5rem",
                maxHeight: "24rem",
                overflowY: "auto",
              }}
            >
              <p
                style={{
                  color: "#1f2937",
                  lineHeight: "1.625",
                  marginBottom: "1.5rem",
                }}
              >
                {activePost.content}
              </p>

              <div>
                <h4
                  style={{
                    fontWeight: "500",
                    color: "#1f2937",
                    marginBottom: "1rem",
                  }}
                >
                  Comments
                </h4>
                {activePost.comments.map((comment) => (
                  <div
                    key={comment._id}
                    style={{
                      backgroundColor: "rgba(249, 250, 251, 0.5)",
                      borderRadius: "0.5rem",
                      padding: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: "500",
                          color: "#1f2937",
                        }}
                      >
                        Dr. {comment.author && comment.author.name ? comment.author.name : "Unknown"}
                      </span>
                      <span
                        style={{
                          fontSize: "0.875rem",
                          color: "#6b7280",
                        }}
                      >
                        {timeAgo(comment.createdAt)}
                      </span>
                    </div>
                    <p
                      style={{
                        color: "#1f2937",
                        margin: 0,
                      }}
                    >
                      {comment.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                padding: "1.5rem",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <form
                onSubmit={(e) => handleAddComment(e, activePost._id)}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                }}
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
                  style={{
                    flex: "1",
                    padding: "0.5rem 1rem",
                    backgroundColor: "#ffffff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                  onFocus={(e) => (e.target.style.boxShadow = "0 0 0 2px #8b5cf6")}
                  onBlur={(e) => (e.target.style.boxShadow = "none")}
                />
                <button
                  type="submit"
                  style={{
                    padding: "0.5rem 1rem",
                    backgroundColor: "#1f2937",
                    color: "#ffffff",
                    borderRadius: "0.5rem",
                    border: "none",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                  }}
                  onMouseOver={(e) => (e.target.style.backgroundColor = "rgba(31, 41, 55, 0.9)")}
                  onMouseOut={(e) => (e.target.style.backgroundColor = "#1f2937")}
                >
                  Comment
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {showNotification && (
        <div className="toast-notification">
          <p
            style={{
              color: "#1f2937",
              margin: 0,
              fontWeight: "500",
            }}
          >
            {notificationMessage}
          </p>
        </div>
      )}

      {/* Add Medical Visit Dialog */}
      <DoctorAddVisitDialog
        isOpen={showAddVisit}
        onClose={() => setShowAddVisit(false)}
        accessCode={currentAccessCode}
        onSaved={(newVisit) => {
          showToast("✅ Visit added to patient profile")
          setShowAddVisit(false)
        }}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
