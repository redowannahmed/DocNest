import "../css/ProfileSummaryCard.css";

export default function ProfileSummaryCard() {
  return (
    <div className="profile-summary-card">
      <div className="profile-content">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <div className="avatar-image">
              <span className="avatar-initials">SA</span>
            </div>
            <div className="status-indicator"></div>
          </div>
        </div>

        <div className="profile-info-section">
          <div className="profile-header">
            <h1 className="profile-name">Saeed Al Mahmud</h1>
            <div className="profile-badge">Verified</div>
          </div>
          <div className="profile-details">
            <div className="detail-item">
              <span className="detail-text">24 years old</span>
            </div>
            <div className="detail-item">
              <span className="detail-text">Male</span>
            </div>
            <div className="detail-item">
              <span className="detail-text">Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>

        <div className="profile-actions">
          <button className="edit-button">
            <span>Edit Profile</span>
          </button>
          <button className="share-button">
            Share
          </button>
        </div>
      </div>
    </div>
  );
}