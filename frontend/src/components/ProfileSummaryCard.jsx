import "../css/ProfileSummaryCard.css";

export default function ProfileSummaryCard() {
  return (
    <div className="profile-summary-card">
      <div className="profile-avatar"></div>
      <div className="profile-info">
        <div className="profile-name">Saeed Al Mahmud</div>
        <div className="profile-meta">Age: 24 | Gender: Male</div>
      </div>
      <button className="profile-edit-btn">Edit Profile</button>
    </div>
  );
}