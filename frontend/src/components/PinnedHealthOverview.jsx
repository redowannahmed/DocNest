import React, { useState, useEffect } from "react";
import "../css/PinnedHealthOverview.css";

export default function PinnedHealthOverview({ user, pinnedConditions = [], setPinnedConditions, medications = [], setMedications }) {
  const [conditionForm, setConditionForm] = useState({ name: "", severity: "", icon: "" });
  const [medForm, setMedForm] = useState({ name: "", dosage: "", frequency: "", icon: "" });
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [hoveredCondition, setHoveredCondition] = useState(null);
  const [hoveredMedication, setHoveredMedication] = useState(null);

  const token = localStorage.getItem("token");

  // Fetch user's conditions and medications on mount
  useEffect(() => {
    const fetchData = async () => {
      if (token) {
        const [condRes, medRes] = await Promise.all([
          fetch("/api/userdata/pinned-conditions", { headers: { Authorization: token } }),
          fetch("/api/userdata/medications", { headers: { Authorization: token } }),
        ]);
        const condData = await condRes.json();
        const medData = await medRes.json();
        setPinnedConditions(condData || []);
        setMedications(medData || []);
      }
    };
    fetchData();
    // eslint-disable-next-line
  }, [token]);

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
    setShowConditionModal(false);
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
    setShowMedicationModal(false);
  };

  const deleteCondition = async (conditionId) => {
    try {
      const res = await fetch(`/api/userdata/pinned-conditions/${conditionId}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      
      if (res.ok) {
        setPinnedConditions(pinnedConditions.filter(condition => condition._id !== conditionId));
      } else {
        console.error("Failed to delete condition");
      }
    } catch (error) {
      console.error("Error deleting condition:", error);
    }
  };

  const deleteMedication = async (medicationId) => {
    try {
      const res = await fetch(`/api/userdata/medications/${medicationId}`, {
        method: "DELETE",
        headers: { Authorization: token },
      });
      
      if (res.ok) {
        setMedications(medications.filter(medication => medication._id !== medicationId));
      } else {
        console.error("Failed to delete medication");
      }
    } catch (error) {
      console.error("Error deleting medication:", error);
    }
  };

  return (
    <div className="health-overview-container">
      <div className="health-cards-grid">
        {/* Chronic Conditions Card */}
        <div className="health-card conditions-card">
          <div className="card-header">
            <div className="card-title">
              <div className="title-icon">📈</div>
              <h3>Chronic Conditions</h3>
            </div>
            <button 
              className="add-btn conditions-add-btn"
              onClick={() => setShowConditionModal(true)}
              type="button"
            >
              <span className="btn-icon">+</span>
              Add
            </button>
          </div>
          <div className="card-content">
            <div className="conditions-list">
              {pinnedConditions.length === 0 ? (
                <div className="empty-state">No conditions added yet.</div>
              ) : (
                pinnedConditions.map((condition, idx) => (
                  <div 
                    key={condition._id || idx} 
                    className="condition-item"
                    onMouseEnter={() => setHoveredCondition(condition._id)}
                    onMouseLeave={() => setHoveredCondition(null)}
                  >
                    <div className="condition-info">
                      <div className="condition-details">
                        <div className="condition-name">{condition.name}</div>
                        <div className="condition-date">{condition.since ? `Since ${condition.since}` : ""}</div>
                      </div>
                    </div>
                    <div className="condition-actions">
                      <div className="condition-status-badge">
                        <span className={`status-badge status-${condition.severity?.toLowerCase()}`}>
                          {condition.severity}
                        </span>
                      </div>
                      {hoveredCondition === condition._id && (
                        <button 
                          className="delete-btn"
                          onClick={() => deleteCondition(condition._id)}
                          title="Delete condition"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Medications Card */}
        <div className="health-card medications-card">
          <div className="card-header">
            <div className="card-title">
              <div className="title-icon">💊</div>
              <h3>Current Medications</h3>
            </div>
            <button 
              className="add-btn medications-add-btn"
              onClick={() => setShowMedicationModal(true)}
              type="button"
            >
              <span className="btn-icon">+</span>
              Add
            </button>
          </div>
          <div className="card-content">
            <div className="medications-list">
              {medications.length === 0 ? (
                <div className="empty-state">No medications added yet.</div>
              ) : (
                medications.map((med, idx) => (
                  <div 
                    key={med._id || idx} 
                    className="medication-item"
                    onMouseEnter={() => setHoveredMedication(med._id)}
                    onMouseLeave={() => setHoveredMedication(null)}
                  >
                    <div className="medication-info">
                      <div className="medication-details">
                        <div className="medication-name">{med.name}</div>
                        <div className="medication-dosage">{med.dosage} • {med.frequency}</div>
                        <div className="medication-date">{med.since ? `Since ${med.since}` : ""}</div>
                      </div>
                    </div>
                    <div className="medication-actions">
                      {hoveredMedication === med._id && (
                        <button 
                          className="delete-btn"
                          onClick={() => deleteMedication(med._id)}
                          title="Delete medication"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Condition Modal */}
      {showConditionModal && (
        <div className="modal-overlay" onClick={() => setShowConditionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Chronic Condition</h3>
              <button 
                className="modal-close"
                onClick={() => setShowConditionModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={addCondition} className="modal-form">
              <div className="form-group">
                <label>Condition Name</label>
                <input 
                  type="text"
                  placeholder="e.g., Diabetes, Hypertension"
                  value={conditionForm.name} 
                  onChange={e => setConditionForm({ ...conditionForm, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Severity Level</label>
                <select 
                  value={conditionForm.severity} 
                  onChange={e => setConditionForm({ ...conditionForm, severity: e.target.value })} 
                  required
                >
                  <option value="">Select severity</option>
                  <option value="mild">Mild</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                </select>
              </div>
              <div className="form-group">
                <label>Icon (Optional)</label>
                <div className="icon-selector">
                  <input 
                    type="text"
                    placeholder="Choose an emoji or leave empty"
                    value={conditionForm.icon} 
                    onChange={e => setConditionForm({ ...conditionForm, icon: e.target.value })} 
                    maxLength="2"
                  />
                  <div className="suggested-icons">
                    {['🫀', '🩺', '💊', '🌡️', '🧬', '⚕️'].map(icon => (
                      <button
                        key={icon}
                        type="button"
                        className="icon-option"
                        onClick={() => setConditionForm({ ...conditionForm, icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowConditionModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Condition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Medication Modal */}
      {showMedicationModal && (
        <div className="modal-overlay" onClick={() => setShowMedicationModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Medication</h3>
              <button 
                className="modal-close"
                onClick={() => setShowMedicationModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={addMedication} className="modal-form">
              <div className="form-group">
                <label>Medication Name</label>
                <input 
                  type="text"
                  placeholder="e.g., Metformin, Lisinopril"
                  value={medForm.name} 
                  onChange={e => setMedForm({ ...medForm, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Dosage</label>
                  <input 
                    type="text"
                    placeholder="e.g., 500mg, 10ml"
                    value={medForm.dosage} 
                    onChange={e => setMedForm({ ...medForm, dosage: e.target.value })} 
                  />
                </div>
                <div className="form-group">
                  <label>Frequency</label>
                  <select 
                    value={medForm.frequency} 
                    onChange={e => setMedForm({ ...medForm, frequency: e.target.value })}
                  >
                    <option value="">Select frequency</option>
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed">As needed</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Icon (Optional)</label>
                <div className="icon-selector">
                  <input 
                    type="text"
                    placeholder="Choose an emoji or leave empty"
                    value={medForm.icon} 
                    onChange={e => setMedForm({ ...medForm, icon: e.target.value })} 
                    maxLength="2"
                  />
                  <div className="suggested-icons">
                    {['💊', '💉', '🧪', '🩹', '🧴', '⚕️'].map(icon => (
                      <button
                        key={icon}
                        type="button"
                        className="icon-option"
                        onClick={() => setMedForm({ ...medForm, icon })}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowMedicationModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Medication
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}