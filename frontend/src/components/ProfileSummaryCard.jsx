// ProfileSummaryCard.jsx
import "../css/ProfileSummaryCard.css";
import React, { useState } from "react";
import sessionManager from "../utils/SessionManager";

export default function ProfileSummaryCard({ user, setUser }) {
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    age: user.age,
    gender: user.gender,
    location: user.location,
  });
  const token = sessionManager.getToken();

  const handleSave = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/auth/me", {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setUser(data);
    setEditMode(false);
  };

  if (!user) return null;
  return (
    <div className="profile-summary-card">
      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <div className="avatar-image">
              <span className="avatar-initials">
                {user.name ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase() : ""}
              </span>
            </div>
            <div className="status-indicator"></div>
          </div>
        </div>
        <div className="profile-info-section">
          <div className="profile-header">
            <h1 className="profile-name">{user.name}</h1>
          </div>
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-text">{user.age ? user.age + " years old" : ""}</span>
            </div>
            <div className="detail-item">
              <span className="detail-text">{user.gender}</span>
            </div>
            <div className="detail-item">
              <span className="detail-text">{user.location}</span>
            </div>
          </div>
        </div>
        <div className="profile-actions">
          {editMode ? (
            <form onSubmit={handleSave} className="edit-form">
              <input
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <input
                className="input-field"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value })}
              />
              <input
                className="input-field"
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
              />
              <input
                className="input-field"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <div className="button-group">
                <button className="save-button" type="submit">Save</button>
                <button className="cancel-button" type="button" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </form>
          ) : (
            <button className="edit-button" onClick={() => setEditMode(true)}>
              <span>Edit Profile</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}