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
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })

      const data = await response.json()
      if (response.ok) {
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
      <div className="webapp-corner">DocNest</div>
      <div>
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to access your medical records</p>
        <form onSubmit={handleSubmit}>
          <div className="form-section">
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
          {error && <div className="error">{error}</div>}
        </form>
        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/signup">Sign up here</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SignIn
