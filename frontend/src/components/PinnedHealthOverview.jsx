import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import FileUpload from "./FileUpload";
import "../css/PinnedHealthOverview.css";
import sessionManager from "../utils/SessionManager";

export default function PinnedHealthOverview({ user, pinnedConditions = [], setPinnedConditions, medications = [], setMedications }) {
  const [conditionForm, setConditionForm] = useState({ name: "", severity: "" });
  const [medForm, setMedForm] = useState({ name: "", dosage: "", frequency: "" });
  const [showConditionModal, setShowConditionModal] = useState(false);
  const [showMedicationModal, setShowMedicationModal] = useState(false);
  const [hoveredCondition, setHoveredCondition] = useState(null);
  const [hoveredMedication, setHoveredMedication] = useState(null);
  
  // File upload states
  const [conditionPrescriptionFiles, setConditionPrescriptionFiles] = useState([]);
  const [medicationPrescriptionFiles, setMedicationPrescriptionFiles] = useState([]);
  
  // Image viewing states
  const [viewingImage, setViewingImage] = useState(null);
  const [imageViewerOpen, setImageViewerOpen] = useState(false);

  // Helper functions to handle modal close and reset
  const closeConditionModal = () => {
    setShowConditionModal(false);
    setConditionForm({ name: "", severity: "" });
    setConditionPrescriptionFiles([]);
  };

  const closeMedicationModal = () => {
    setShowMedicationModal(false);
    setMedForm({ name: "", dosage: "", frequency: "" });
    setMedicationPrescriptionFiles([]);
  };

  // Image viewing functions
  const viewPrescriptionImage = (imageUrl, type, itemName) => {
    setViewingImage({
      url: imageUrl,
      type: type,
      itemName: itemName
    });
    setImageViewerOpen(true);
  };

  const closeImageViewer = () => {
    setViewingImage(null);
    setImageViewerOpen(false);
  };

  const token = sessionManager.getToken();

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
    
    // Validate prescription upload
    if (!conditionPrescriptionFiles || conditionPrescriptionFiles.length === 0) {
      alert("Please upload a prescription image before adding the condition.");
      return;
    }

    const prescriptionImg = conditionPrescriptionFiles[0]; // Take the first uploaded file
    
    const conditionData = {
      ...conditionForm,
      prescriptionImg: {
        url: prescriptionImg.url,
        publicId: prescriptionImg.publicId
      }
    };

    try {
      const res = await fetch("/api/userdata/pinned-conditions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(conditionData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add condition");
      }
      
      const data = await res.json();
      setPinnedConditions([...pinnedConditions, data]);
      setConditionForm({ name: "", severity: "" });
      setConditionPrescriptionFiles([]);
      setShowConditionModal(false);
    } catch (error) {
      console.error("Error adding condition:", error);
      alert("Failed to add condition: " + error.message);
    }
  };

  const addMedication = async (e) => {
    e.preventDefault();
    
    // Validate prescription upload
    if (!medicationPrescriptionFiles || medicationPrescriptionFiles.length === 0) {
      alert("Please upload a prescription image before adding the medication.");
      return;
    }

    const prescriptionImg = medicationPrescriptionFiles[0]; // Take the first uploaded file
    
    const medicationData = {
      ...medForm,
      prescriptionImg: {
        url: prescriptionImg.url,
        publicId: prescriptionImg.publicId
      }
    };

    try {
      const res = await fetch("/api/userdata/medications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(medicationData),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add medication");
      }
      
      const data = await res.json();
      setMedications([...medications, data]);
      setMedForm({ name: "", dosage: "", frequency: "" });
      setMedicationPrescriptionFiles([]);
      setShowMedicationModal(false);
    } catch (error) {
      console.error("Error adding medication:", error);
      alert("Failed to add medication: " + error.message);
    }
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
                        <div className="condition-name">
                          {condition.name}
                          {condition.prescriptionImg && (
                            <button 
                              className="prescription-indicator clickable" 
                              title="View prescription"
                              onClick={() => viewPrescriptionImage(
                                condition.prescriptionImg.url, 
                                'Chronic Condition', 
                                condition.name
                              )}
                            >
                              📋
                            </button>
                          )}
                        </div>
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
                        <>
                          {condition.prescriptionImg && (
                            <button 
                              className="view-prescription-btn"
                              onClick={() => viewPrescriptionImage(
                                condition.prescriptionImg.url, 
                                'Chronic Condition', 
                                condition.name
                              )}
                              title="View prescription"
                            >
                              👁️
                            </button>
                          )}
                          <button 
                            className="delete-btn"
                            onClick={() => deleteCondition(condition._id)}
                            title="Delete condition"
                          >
                            🗑️
                          </button>
                        </>
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
                        <div className="medication-name">
                          {med.name}
                          {med.prescriptionImg && (
                            <button 
                              className="prescription-indicator clickable" 
                              title="View prescription"
                              onClick={() => viewPrescriptionImage(
                                med.prescriptionImg.url, 
                                'Medication', 
                                med.name
                              )}
                            >
                              📋
                            </button>
                          )}
                        </div>
                        <div className="medication-dosage">{med.dosage} • {med.frequency}</div>
                        <div className="medication-date">{med.since ? `Since ${med.since}` : ""}</div>
                      </div>
                    </div>
                    <div className="medication-actions">
                      {hoveredMedication === med._id && (
                        <>
                          {med.prescriptionImg && (
                            <button 
                              className="view-prescription-btn"
                              onClick={() => viewPrescriptionImage(
                                med.prescriptionImg.url, 
                                'Medication', 
                                med.name
                              )}
                              title="View prescription"
                            >
                              👁️
                            </button>
                          )}
                          <button 
                            className="delete-btn"
                            onClick={() => deleteMedication(med._id)}
                            title="Delete medication"
                          >
                            🗑️
                          </button>
                        </>
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
      {showConditionModal && createPortal(
        <div className="modal-overlay" onClick={closeConditionModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Chronic Condition</h3>
              <button 
                className="modal-close"
                onClick={closeConditionModal}
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
                <label>Prescription Image *</label>
                <FileUpload
                  onFilesUploaded={setConditionPrescriptionFiles}
                  uploadType="prescription"
                  maxFiles={1}
                  label="Upload Prescription Image"
                  accept="image/jpeg,image/jpg,image/png"
                  initialFiles={conditionPrescriptionFiles}
                />
                <p className="upload-requirement">
                  * Prescription image is required to add a chronic condition
                </p>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={closeConditionModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Condition
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Medication Modal */}
      {showMedicationModal && createPortal(
        <div className="modal-overlay" onClick={closeMedicationModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Medication</h3>
              <button 
                className="modal-close"
                onClick={closeMedicationModal}
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
                <label>Prescription Image *</label>
                <FileUpload
                  onFilesUploaded={setMedicationPrescriptionFiles}
                  uploadType="prescription"
                  maxFiles={1}
                  label="Upload Prescription Image"
                  accept="image/jpeg,image/jpg,image/png"
                  initialFiles={medicationPrescriptionFiles}
                />
                <p className="upload-requirement">
                  * Prescription image is required to add a medication
                </p>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={closeMedicationModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Add Medication
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* Image Viewer Modal */}
      {imageViewerOpen && viewingImage && createPortal(
        <div className="modal-overlay image-viewer-overlay" onClick={closeImageViewer}>
          <div className="image-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="image-viewer-header">
              <h3>Prescription for {viewingImage.itemName}</h3>
              <span className="image-type-badge">{viewingImage.type}</span>
              <button 
                className="modal-close"
                onClick={closeImageViewer}
              >
                ×
              </button>
            </div>
            <div className="image-viewer-content">
              <img 
                src={viewingImage.url} 
                alt={`Prescription for ${viewingImage.itemName}`}
                className="prescription-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.parentNode.innerHTML = '<p class="image-error">Failed to load image</p>';
                }}
              />
            </div>
            <div className="image-viewer-actions">
              <button 
                className="btn-secondary"
                onClick={() => window.open(viewingImage.url, '_blank')}
              >
                Open in New Tab
              </button>
              <button 
                className="btn-primary"
                onClick={closeImageViewer}
              >
                Close
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}