import "../css/PinnedHealthOverview.css";

export default function PinnedHealthOverview() {
  const conditions = [
    { name: "Diabetes", severity: "controlled", icon: "🩺" },
    { name: "Hypertension", severity: "mild", icon: "❤️" }
  ];

  const medications = [
    { name: "Metformin", dosage: "500mg", frequency: "2x daily", icon: "💊" },
    { name: "Lisinopril", dosage: "10mg", frequency: "1x daily", icon: "💊" }
  ];

  return (
    <div className="health-overview-container">
      <div className="health-overview-header">
        <h2 className="overview-title">Health Overview</h2>
        <button className="view-all-btn">
          <span>View All</span>
          <i className="fa fa-arrow-right"></i>
        </button>
      </div>
      
      <div className="health-cards-grid">
        {/* Chronic Conditions Card */}
        <div className="health-card conditions-card">
          <div className="card-header">
            <div className="card-title">
              <div className="title-icon">🫀</div>
              <h3>Chronic Conditions</h3>
            </div>
            <div className="card-badge">
              <span className="badge-count">{conditions.length}</span>
            </div>
          </div>
          
          <div className="card-content">
            <div className="conditions-list">
              {conditions.map((condition, idx) => (
                <div key={idx} className="condition-item">
                  <div className="condition-info">
                    <div className="condition-icon">{condition.icon}</div>
                    <div className="condition-details">
                      <div className="condition-name">{condition.name}</div>
                      <div className={`condition-status status-${condition.severity}`}>
                        {condition.severity}
                      </div>
                    </div>
                  </div>
                  <div className="condition-indicator">
                    <div className={`status-dot ${condition.severity}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card-footer">
            <button className="add-condition-btn">
              <i className="fa fa-plus"></i>
              <span>Add Condition</span>
            </button>
          </div>
        </div>

        {/* Current Medications Card */}
        <div className="health-card medications-card">
          <div className="card-header">
            <div className="card-title">
              <div className="title-icon">💊</div>
              <h3>Current Medications</h3>
            </div>
            <div className="card-badge">
              <span className="badge-count">{medications.length}</span>
            </div>
          </div>
          
          <div className="card-content">
            <div className="medications-list">
              {medications.map((med, idx) => (
                <div key={idx} className="medication-item">
                  <div className="medication-info">
                    <div className="medication-icon">{med.icon}</div>
                    <div className="medication-details">
                      <div className="medication-name">{med.name}</div>
                      <div className="medication-dosage">{med.dosage}</div>
                    </div>
                  </div>
                  <div className="medication-frequency">
                    {med.frequency}
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card-footer">
            <button className="add-medication-btn">
              <i className="fa fa-plus"></i>
              <span>Add Medication</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}