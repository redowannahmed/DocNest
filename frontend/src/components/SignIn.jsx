import React, { useState } from "react";
import "../css/SignIn.css";

const SignIn = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      onLogin(data.user, data.token);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="auth-container">
      <h2>Sign In</h2>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required />
        <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Sign In</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
};

export default SignIn;
