import "../css/PinnedHealthOverview.css";

export default function PinnedHealthOverview() {
  return (
    <div className="pinned-health-grid">
      <div className="health-card">
        <h3 className="health-card-title">Chronic Conditions</h3>
        <div className="health-tags-container">
          {["🌿 Diabetes", "🌿 Hypertension"].map((cond, idx) => (
            <div
              key={idx}
              className="condition-tag"
            >
              {cond}
            </div>
          ))}
        </div>
      </div>
      <div className="health-card">
        <h3 className="health-card-title">Current Medications</h3>
        <div className="health-tags-container">
          {["💊 Metformin 500mg", "💊 Lisinopril 10mg"].map((med, idx) => (
            <div
              key={idx}
              className="medication-tag"
            >
              {med}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}