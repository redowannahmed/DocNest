import "../css/PinnedHealthOverview.css";
import React, { useState } from "react";

export default function PinnedHealthOverview({ user, pinnedConditions = [], setPinnedConditions, medications = [], setMedications }) {
  const [conditionForm, setConditionForm] = useState({ name: "", severity: "", icon: "" });
  const [medForm, setMedForm] = useState({ name: "", dosage: "", frequency: "", icon: "" });

  const token = localStorage.getItem("token");

  const addCondition = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/userdata/pinned-conditions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(conditionForm),
    });
    const data = await res.json();
    setPinnedConditions([...pinnedConditions, data]);
    setConditionForm({ name: "", severity: "", icon: "" });
  };

  const addMedication = async (e) => {
    e.preventDefault();
    const res = await fetch("/api/userdata/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(medForm),
    });
    const data = await res.json();
    setMedications([...medications, data]);
    setMedForm({ name: "", dosage: "", frequency: "", icon: "" });
  };

  return (
    <div className="health-overview-container">
      <div className="health-overview-header">
        <h2 className="overview-title">Health Overview</h2>
      </div>
      <div className="health-cards-grid">
        {/* Chronic Conditions Card */}
        <div className="health-card conditions-card">
          <div className="card-header">
            <div className="card-title">
              <div className="title-icon">🧀</div>
              <h3>Chronic Conditions</h3>
            </div>
            <div className="card-badge">
              <span className="badge-count">{pinnedConditions.length}</span>
            </div>
          </div>
          <div className="card-content">
            <div className="conditions-list">
              {pinnedConditions.map((condition, idx) => (
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
            <form onSubmit={addCondition} className="add-form">
              <input placeholder="Condition" value={conditionForm.name} onChange={e => setConditionForm({ ...conditionForm, name: e.target.value })} required />
              <input placeholder="Severity" value={conditionForm.severity} onChange={e => setConditionForm({ ...conditionForm, severity: e.target.value })} required />
              <input placeholder="Icon (emoji)" value={conditionForm.icon} onChange={e => setConditionForm({ ...conditionForm, icon: e.target.value })} />
              <button type="submit">Add</button>
            </form>
          </div>
        </div>
        {/* Medications Card */}
        <div className="health-card medications-card">
          <div className="card-header">
            <div className="card-title">
              <div className="title-icon">💊</div>
              <h3>Medications</h3>
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
                      <div className="medication-frequency">{med.frequency}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="card-footer">
            <form onSubmit={addMedication} className="add-form">
              <input placeholder="Medication" value={medForm.name} onChange={e => setMedForm({ ...medForm, name: e.target.value })} required />
              <input placeholder="Dosage" value={medForm.dosage} onChange={e => setMedForm({ ...medForm, dosage: e.target.value })} />
              <input placeholder="Frequency" value={medForm.frequency} onChange={e => setMedForm({ ...medForm, frequency: e.target.value })} />
              <input placeholder="Icon (emoji)" value={medForm.icon} onChange={e => setMedForm({ ...medForm, icon: e.target.value })} />
              <button type="submit">Add</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}