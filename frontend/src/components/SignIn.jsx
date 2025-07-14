"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "../css/SignIn.css"

const SignIn = ({ onLogin }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("patient")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Make actual API call to your backend
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        // Use backend-provided role only
        const userData = { ...data.user }
        onLogin(userData, data.token)
      } else {
        setError(data.message || "Login failed")
      }
    } catch (err) {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "2rem" }}>
          <Link
            to="/"
            style={{
              color: "#667eea",
              textDecoration: "none",
              fontSize: "0.9rem",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              marginBottom: "1rem",
            }}
          >
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <h2>Welcome Back</h2>
          <p className="auth-subtitle">Sign in to access your medical records</p>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="input-group">
          <i className="fas fa-envelope input-icon"></i>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
        </div>

        <div className="input-group">
          <i className="fas fa-lock input-icon"></i>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>

        <div className="input-group">
          <i className="fas fa-user-md input-icon"></i>
          <select value={role} onChange={(e) => setRole(e.target.value)} required className="role-select">
            <option value="patient">Sign in as Patient</option>
            <option value="doctor">Sign in as Doctor</option>
          </select>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Signing In...
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt"></i>
              Sign In
            </>
          )}
        </button>
      </form>

      <div className="auth-links">
        <p>
          Don't have an account? <Link to="/signup">Sign up here</Link>
        </p>
      </div>
    </div>
  )
}

export default SignIn
