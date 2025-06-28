import "../css/TopBar.css"

export default function TopBar({ user }) {
  return (
    <header className="top-bar">
      <div className="top-bar-content">
        <div className="logo-section">
          <div className="logo">
            <span className="logo-text">Doc</span>
          </div>
          <div className="hidden md:block h-6 w-px bg-slate-300 mx-4"></div>
          <div className="hidden md:block text-sm text-slate-600 font-medium">Patient Dashboard</div>
        </div>

        <div className="center-section">
          <div className="greeting">Good evening, {user?.name || "Patient"}</div>
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
            <span>{user?.name ? user.name.charAt(0).toUpperCase() : "U"}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
