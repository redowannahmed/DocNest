import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/SignIn.css";

const SignIn = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("patient");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Login failed");
      localStorage.setItem("token", data.token);
      onLogin({ ...data.user, selectedRole }, data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div>
        <h2>Let's Start Learning</h2>
        <p className="auth-subtitle">Please login or sign up to continue</p>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <span className="input-icon">✉️</span>
            <input 
              type="email" 
              placeholder="Your Email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input 
              type="password" 
              placeholder="Your Password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
            />
          </div>
          <div className="input-group">
            <label>Log In As</label>
            <select
              value={selectedRole}
              onChange={e => setSelectedRole(e.target.value)}
            >
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
          <button type="submit">Sign In</button>
          {error && <p className="error">{error}</p>}
        </form>
        <div className="auth-links">
          <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
