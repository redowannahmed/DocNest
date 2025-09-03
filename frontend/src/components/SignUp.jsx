import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../css/SignUp.css";

const passwordStrength = (password) => {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
};

const nameValid = (name) => /^[A-Za-z .'-]{2,100}$/.test(name.trim()) && /[A-Za-z]/.test(name);

const ageValid = (age) => !age || (Number(age) >= 0 && Number(age) <= 120 && /^\d+$/.test(age));

const genderValid = (gender) => !gender || ["male", "female", "other", ""].includes(gender.trim().toLowerCase());

const SignUp = ({ onRegister }) => {
  const [form, setForm] = useState({ name: "", email: "", password: "", age: "", gender: "", location: "", role: "patient", bmdcId: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client validation
    if (!nameValid(form.name)) return setError("Name must be at least 2 letters and use only valid characters.");
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email.trim())) return setError("Enter a valid email address.");
    if (!passwordStrength(form.password)) return setError("Password must be at least 8 chars, incl. upper, lower, number, special char.");
    if (!ageValid(form.age)) return setError("Age must be a number between 0 and 120.");
    if (!genderValid(form.gender)) return setError("Gender must be 'male', 'female', or 'other'.");
    if (form.role === "doctor" && (!form.bmdcId || !form.bmdcId.trim())) return setError("BMDC ID is required for doctor registration.");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, email: form.email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      
      // Different success messages based on role
      if (form.role === "doctor") {
        setSuccess("Doctor registration request submitted! Please wait for admin approval.");
        setTimeout(() => navigate("/signin"), 3000);
      } else {
        setSuccess("Registration successful!");
        // If API returns token/user, store them (current API returns token only in login; keep future-proof)
        if (data?.user && data?.token) {
          localStorage.setItem("user", JSON.stringify(data.user))
          localStorage.setItem("token", data.token)
        }
        setTimeout(() => navigate("/signin"), 1500);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <div className="webapp-corner">DocNest</div>
      <div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join now!</p>
        <form onSubmit={handleSubmit}>
          <div className="form-section personal-info">
            <div className="input-group">
              <i className="fas fa-user input-icon"></i>
              <input 
                name="name" 
                placeholder="Full Name" 
                value={form.name} 
                onChange={handleChange} 
                required 
                autoComplete="name"
              />
            </div>
            <div className="input-group">
              <i className="fas fa-envelope input-icon"></i>
              <input 
                name="email" 
                type="email" 
                placeholder="Email Address" 
                value={form.email} 
                onChange={handleChange} 
                required 
                autoComplete="email"
              />
            </div>
            <div className="input-group">
              <i className="fas fa-lock input-icon"></i>
              <input 
                name="password" 
                type="password" 
                placeholder="Password" 
                value={form.password} 
                onChange={handleChange} 
                required 
                autoComplete="new-password"
              />
            </div>
          </div>
          <div className="form-section additional-info">
            <div className="input-group">
              <i className="fas fa-birthday-cake input-icon"></i>
              <input 
                name="age" 
                placeholder="Age" 
                value={form.age} 
                onChange={handleChange} 
                type="number"
                min={0}
                max={120}
              />
            </div>
            <div className="input-group">
              <i className="fas fa-venus-mars input-icon"></i>
              <input 
                name="gender" 
                placeholder="Gender (male/female/other)" 
                value={form.gender} 
                onChange={handleChange} 
                autoComplete="sex"
              />
            </div>
            <div className="input-group">
              <i className="fas fa-map-marker-alt input-icon"></i>
              <input 
                name="location" 
                placeholder="Location" 
                value={form.location} 
                onChange={handleChange} 
                autoComplete="address-level2"
              />
            </div>
            <div className="input-group">
              <i className="fas fa-user-md input-icon"></i>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="role-select"
              >
                <option value="patient">Register as Patient</option>
                <option value="doctor">Register as Doctor</option>
              </select>
            </div>
            {form.role === "doctor" && (
              <div className="input-group">
                <i className="fas fa-id-card input-icon"></i>
                <input 
                  name="bmdcId" 
                  placeholder="BMDC Registration ID" 
                  value={form.bmdcId} 
                  onChange={handleChange} 
                  required={form.role === "doctor"}
                  autoComplete="off"
                />
              </div>
            )}
          </div>
          <button type="submit">Create Account</button>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </form>
        <div className="auth-links">
          <p>Already have an account? <Link to="/signin">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
