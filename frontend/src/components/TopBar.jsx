import "../css/TopBar.css";

export default function TopBar() {
  return (
    <header className="top-bar">
      <div className="logo">DocNest</div>
      <div className="greeting">Hello, Saeed</div>
      <div className="icons-container">
        <div className="notification-icon">
          <span className="notification-badge"></span>
          <i className="fa fa-bell"></i>
        </div>
        <i className="fa fa-cog settings-icon"></i>
      </div>
    </header>
  );
}