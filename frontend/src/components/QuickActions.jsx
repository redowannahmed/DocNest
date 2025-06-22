import "../css/QuickActions.css";

const actions = [
  { label: "Upload Record", icon: "➕" },
  { label: "Share Access", icon: "🔑" },
  { label: "View Timeline", icon: "📅" },
  { label: "Doctor Blogs", icon: "📖" },
];

export default function QuickActions() {
  return (
    <div className="quick-actions-grid">
      {actions.map((action, idx) => (
        <div key={idx} className="quick-action-card">
          <div className="action-icon">{action.icon}</div>
          <div className="action-label">{action.label}</div>
        </div>
      ))}
    </div>
  );
}
