import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section personal-info">
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
          <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={handleChange} required />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="form-section additional-info">
          <input name="age" placeholder="Age" value={form.age} onChange={handleChange} />
          <input name="gender" placeholder="Gender" value={form.gender} onChange={handleChange} />
          <input name="location" placeholder="Location" value={form.location} onChange={handleChange} />
        </div>
        <button type="submit">Create Account</button>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">Registration successful! Redirecting to sign in...</p>}
      </form>
    </div>
  );
};

export default SignUp;
