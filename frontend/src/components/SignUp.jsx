import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/SignUp.css";

const SignUp = ({ onRegister }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", gender: "", location: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setSuccess(true);
      setTimeout(() => navigate("/signin"), 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join us to start your learning journey</p>
        <form onSubmit={handleSubmit}>
          <div className="form-section personal-info">
            <div className="input-group">
              <span className="input-icon">👤</span>
              <input 
                name="name" 
                placeholder="Full Name" 
                value={form.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-group">
              <span className="input-icon">✉️</span>
              <input 
                name="email" 
                type="email" 
                placeholder="Email Address" 
                value={form.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-group">
              <span className="input-icon">🔒</span>
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                value={form.password} 
                onChange={handleChange} 
                required 
              />
            </div>
          </div>
          <div className="form-section additional-info">
            <div className="input-group">
              <span className="input-icon">🎂</span>
              <input 
                name="age" 
                placeholder="Age" 
                value={form.age} 
                onChange={handleChange} 
              />
            </div>
            <div className="input-group">
              <span className="input-icon">⚧️</span>
              <input 
                name="gender" 
                placeholder="Gender" 
                value={form.gender} 
                onChange={handleChange} 
              />
            </div>
            <div className="input-group">
              <span className="input-icon">📍</span>
              <input 
                name="location" 
                placeholder="Location" 
                value={form.location} 
                onChange={handleChange} 
              />
            </div>
          </div>
          <button type="submit">Create Account</button>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">Registration successful! Redirecting to sign in...</p>}
        </form>
        <div className="auth-links">
          <p>Already have an account? <Link to="/signin">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
