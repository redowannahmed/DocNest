import "../css/TopBar.css";

export default function TopBar() {
  return (
    <header className="top-bar">
      <div className="top-bar-content">
        <div className="logo-section">
          <div className="logo">
            <span className="logo-icon">🏥</span>
            <span className="logo-text">DocNest</span>
          </div>
        </div>
        
        <div className="center-section">
          <div className="greeting">Good evening, Saeed</div>
        </div>
        
        <div className="actions-section">
          <button className="icon-button notification-button">
            <i className="fa fa-bell"></i>
            <span className="notification-dot"></span>
          </button>
          <button className="icon-button">
            <i className="fa fa-cog"></i>
          </button>
          <div className="user-avatar">
            <span>S</span>
          </div>
        </div>
      </div>
    </header>
  );
}