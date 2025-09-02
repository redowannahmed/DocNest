import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/PatientProfileFullPage.css';

export default function PatientProfileFullPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { patientData } = location.state || {};

  const [activeTab, setActiveTab] = useState('overview');
  const [expandedVisitId, setExpandedVisitId] = useState(null);
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '', alt: '', digitalPrescription: null });

  useEffect(() => {
    // If no patient data, redirect back to doctor dashboard
    if (!patientData) {
      navigate('/doctor');
    }
  }, [patientData, navigate]);

  if (!patientData) {
    return <div>Loading...</div>;
  }

  const { patient, medicalHistory, pinnedConditions, medications, accessExpiresAt, hiddenVisitCount } = patientData;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRemainingTime = () => {
    const now = new Date();
    const expiry = new Date(accessExpiresAt);
    const diffMs = expiry.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    if (diffMinutes <= 0) return 'Expired';
    if (diffMinutes < 60) return `${diffMinutes} min`;
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getImageUrl = (img) => {
    if (typeof img === 'string') return img;
    return img?.url || '';
  };

  const openImageModal = (src, alt, digitalPrescription = null) => {
    setImageModal({ isOpen: true, src, alt, digitalPrescription });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, src: '', alt: '', digitalPrescription: null });
  };

  const toggleVisitExpansion = (visitId) => {
    setExpandedVisitId(expandedVisitId === visitId ? null : visitId);
  };

  const handleAddVisit = () => {
    // Navigate back to doctor dashboard with add visit flag
    navigate('/doctor', { state: { showAddVisit: true, accessCode: patientData.accessCode } });
  };

  const handleBack = () => {
    navigate('/doctor');
  };

  return (
    <div className="patient-profile-fullpage">
      {/* Header */}
      <div className="fullpage-header">
        <button className="back-btn" onClick={handleBack}>
          <i className="fas fa-arrow-left"></i>
        </button>
        
        <div className="patient-info-header">
          <div className="avatar-circle">
            {patient.name?.charAt(0)?.toUpperCase() || 'P'}
          </div>
          <div className="patient-details-header">
            <h1>{patient.name}'s Medical Profile</h1>
            <p className="patient-meta">
              {patient.age && `${patient.age} years old`}
              {patient.gender && ` • ${patient.gender}`}
              {patient.location && ` • ${patient.location}`}
            </p>
          </div>
        </div>

        <div className="header-actions">
          <div className="access-timer-header">
            <span className="timer-label">Access expires in:</span>
            <span className="timer-value">{getRemainingTime()}</span>
          </div>
          <button className="add-visit-btn-header" onClick={handleAddVisit}>
            <i className="fas fa-plus"></i>
            Add Visit
          </button>
        </div>
      </div>

      {/* Privacy Notice */}
      {hiddenVisitCount > 0 && (
        <div className="privacy-notice-fullpage">
          <i className="fas fa-lock"></i>
          {hiddenVisitCount} medical visit{hiddenVisitCount > 1 ? 's' : ''} hidden by patient
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="tabs-navigation">
        <button 
          className={`tab-nav-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <i className="fas fa-clipboard-list"></i>
          Overview
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <i className="fas fa-history"></i>
          Medical History ({medicalHistory.length})
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'conditions' ? 'active' : ''}`}
          onClick={() => setActiveTab('conditions')}
        >
          <i className="fas fa-heartbeat"></i>
          Conditions ({pinnedConditions.length})
        </button>
        <button 
          className={`tab-nav-btn ${activeTab === 'medications' ? 'active' : ''}`}
          onClick={() => setActiveTab('medications')}
        >
          <i className="fas fa-pills"></i>
          Medications ({medications.length})
        </button>
      </div>

      {/* Content Area */}
      <div className="fullpage-content">
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="overview-cards-grid">
              {/* Recent Medical Visits */}
              <div className="overview-card">
                <div className="card-header">
                  <h3>Recent Medical Visits</h3>
                  <i className="fas fa-stethoscope"></i>
                </div>
                <div className="card-content">
                  {medicalHistory.slice(0, 3).map(visit => (
                    <div key={visit._id} className="recent-visit-item">
                      <div className="visit-date-overview">{formatDate(visit.date)}</div>
                      <div className="visit-info-overview">
                        <div className="visit-doctor-overview">Dr. {visit.doctor}</div>
                        <div className="visit-specialty-overview">{visit.specialty}</div>
                        <div className="visit-reason-overview">{visit.reason}</div>
                      </div>
                      <div className={`visit-status-overview status-${visit.status?.toLowerCase()}`}>
                        {visit.status}
                      </div>
                    </div>
                  ))}
                  {medicalHistory.length === 0 && (
                    <p className="no-data-overview">No medical history available</p>
                  )}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div className="overview-card">
                <div className="card-header">
                  <h3>Chronic Conditions</h3>
                  <i className="fas fa-heartbeat"></i>
                </div>
                <div className="card-content">
                  {pinnedConditions.slice(0, 5).map(condition => (
                    <div key={condition._id} className="condition-overview-item">
                      <div className="condition-name-overview">{condition.condition}</div>
                      <div className="condition-date-overview">Since {formatDate(condition.diagnosisDate)}</div>
                    </div>
                  ))}
                  {pinnedConditions.length === 0 && (
                    <div className="empty-state">
                      <i className="fas fa-heart"></i>
                      <p>No chronic conditions recorded</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Medications */}
              <div className="overview-card">
                <div className="card-header">
                  <h3>Current Medications</h3>
                  <i className="fas fa-pills"></i>
                </div>
                <div className="card-content">
                  {medications.slice(0, 5).map(med => (
                    <div key={med._id} className="medication-overview-item">
                      <div className="med-name-overview">{med.medication}</div>
                      <div className="med-details-overview">
                        <span className="med-dosage-overview">{med.dosage}</span>
                        <span className="med-frequency-overview">{med.frequency}</span>
                      </div>
                    </div>
                  ))}
                  {medications.length === 0 && (
                    <div className="empty-state">
                      <i className="fas fa-pills"></i>
                      <p>No medications recorded</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="history-section">
            <div className="medical-history-header">
              <h2>Complete record of medical visits and treatments</h2>
            </div>
            
            {medicalHistory.length === 0 ? (
              <div className="empty-state-large">
                <i className="fas fa-calendar-times"></i>
                <h3>No medical history available</h3>
                <p>Medical visits will appear here once they are added.</p>
              </div>
            ) : (
              <div className="medical-visits-list">
                {medicalHistory.map(visit => (
                  <div key={visit._id} className="medical-visit-card">
                    <div className="visit-header-expandable" onClick={() => toggleVisitExpansion(visit._id)}>
                      <div className="visit-main-details">
                        <div className="visit-specialty-badge">{visit.specialty}</div>
                        <div className="visit-status-badge">{visit.status || 'COMPLETED'}</div>
                      </div>
                      
                      <div className="visit-center-info">
                        <h4>Dr. {visit.doctor}</h4>
                        <p className="visit-condition">{visit.reason}</p>
                      </div>
                      
                      <div className="visit-date-main">{formatDate(visit.date)}</div>
                      
                      <div className="expand-icon">
                        <i className={`fas fa-chevron-${expandedVisitId === visit._id ? 'up' : 'down'}`}></i>
                      </div>
                    </div>

                    {expandedVisitId === visit._id && (
                      <div className="visit-expanded-content">
                        {visit.notes && (
                          <div className="visit-notes-section">
                            <h5>Notes</h5>
                            <p>{visit.notes}</p>
                          </div>
                        )}

                        <div className="visit-attachments-grid">
                          {/* Digital Prescription */}
                          {visit.digitalPrescription && (
                            <div className="attachment-card">
                              <div className="attachment-header">
                                <i className="fas fa-file-prescription"></i>
                                <h5>Digital Prescription</h5>
                              </div>
                              <div className="digital-prescription-preview" onClick={() => openImageModal(null, 'Digital Prescription', visit.digitalPrescription)}>
                                <div className="prescription-summary">
                                  <span>{(visit.digitalPrescription.medications || []).length} medication(s)</span>
                                  {visit.digitalPrescription.advice && <span>• Advice included</span>}
                                  {(visit.digitalPrescription.tests || []).length > 0 && <span>• {visit.digitalPrescription.tests.length} test(s)</span>}
                                </div>
                                <i className="fas fa-eye"></i>
                              </div>
                            </div>
                          )}

                          {/* Prescription Images */}
                          {visit.prescriptionImgs?.length > 0 && (
                            <div className="attachment-card">
                              <div className="attachment-header">
                                <i className="fas fa-images"></i>
                                <h5>Prescriptions ({visit.prescriptionImgs.length})</h5>
                              </div>
                              <div className="files-preview-grid">
                                {visit.prescriptionImgs.map((img, index) => (
                                  <div key={index} className="file-preview-item">
                                    <img
                                      src={getImageUrl(img)}
                                      alt={`Prescription ${index + 1}`}
                                      onClick={() => openImageModal(getImageUrl(img), `Prescription ${index + 1}`)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Test Reports */}
                          {visit.testReports?.length > 0 && (
                            <div className="attachment-card">
                              <div className="attachment-header">
                                <i className="fas fa-clipboard-list"></i>
                                <h5>Test Reports ({visit.testReports.length})</h5>
                              </div>
                              <div className="files-preview-grid">
                                {visit.testReports.map((img, index) => (
                                  <div key={index} className="file-preview-item">
                                    <img
                                      src={getImageUrl(img)}
                                      alt={`Test Report ${index + 1}`}
                                      onClick={() => openImageModal(getImageUrl(img), `Test Report ${index + 1}`)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'conditions' && (
          <div className="conditions-section">
            {pinnedConditions.length === 0 ? (
              <div className="empty-state-large">
                <i className="fas fa-heartbeat"></i>
                <h3>No chronic conditions recorded</h3>
                <p>Chronic conditions will be listed here when added to the patient's profile.</p>
              </div>
            ) : (
              <div className="conditions-grid">
                {pinnedConditions.map(condition => (
                  <div key={condition._id} className="condition-card-fullpage">
                    <div className="condition-card-header">
                      <h4>{condition.condition}</h4>
                      <span className="diagnosis-date">Diagnosed: {formatDate(condition.diagnosisDate)}</span>
                    </div>
                    
                    {condition.doctorName && (
                      <div className="condition-doctor">
                        <strong>Doctor:</strong> Dr. {condition.doctorName}
                      </div>
                    )}
                    
                    {condition.notes && (
                      <div className="condition-notes">
                        <strong>Notes:</strong>
                        <p>{condition.notes}</p>
                      </div>
                    )}

                    {condition.prescriptionImg && (
                      <div className="condition-prescription">
                        <strong>Prescription:</strong>
                        <div className="prescription-thumbnail">
                          <img
                            src={getImageUrl(condition.prescriptionImg)}
                            alt="Prescription"
                            onClick={() => openImageModal(
                              getImageUrl(condition.prescriptionImg), 
                              `${condition.condition} Prescription`
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'medications' && (
          <div className="medications-section">
            {medications.length === 0 ? (
              <div className="empty-state-large">
                <i className="fas fa-pills"></i>
                <h3>No medications recorded</h3>
                <p>Current medications will be displayed here when added to the patient's profile.</p>
              </div>
            ) : (
              <div className="medications-grid">
                {medications.map(med => (
                  <div key={med._id} className="medication-card-fullpage">
                    <div className="medication-card-header">
                      <h4>{med.medication}</h4>
                      <span className="medication-dosage">{med.dosage}</span>
                    </div>
                    
                    <div className="medication-schedule">
                      <strong>Schedule:</strong> {med.frequency}
                    </div>
                    
                    <div className="medication-duration">
                      <strong>Duration:</strong> {med.duration}
                    </div>

                    {med.notes && (
                      <div className="medication-notes">
                        <strong>Notes:</strong>
                        <p>{med.notes}</p>
                      </div>
                    )}

                    {med.prescriptionImg && (
                      <div className="medication-prescription">
                        <strong>Prescription:</strong>
                        <div className="prescription-thumbnail">
                          <img
                            src={getImageUrl(med.prescriptionImg)}
                            alt="Prescription"
                            onClick={() => openImageModal(
                              getImageUrl(med.prescriptionImg), 
                              `${med.medication} Prescription`
                            )}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal - Same digital prescription preview as in MedicalHistory */}
      {imageModal.isOpen && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal}>×</button>
            {imageModal.digitalPrescription ? (
              <div className="rx-preview">
                <div className="rx-header">
                  <div className="rx-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM19 19H5V5H19V19Z" fill="currentColor"/>
                      <path d="M14 17H7V15H14V17ZM17 13H7V11H17V13ZM17 9H7V7H17V9Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <h3>Digital Prescription</h3>
                </div>

                <div className="rx-content">
                  {(imageModal.digitalPrescription.medications || []).length > 0 && (
                    <div className="rx-section">
                      <h4>💊 Prescribed Medications</h4>
                      <div className="medications-grid">
                        {imageModal.digitalPrescription.medications.map((med, i) => (
                          <div key={i} className="med-card">
                            <div className="med-name">{med.name}</div>
                            {med.dosage && <div className="med-dosage">{med.dosage}</div>}
                            <div className="med-info">
                              {med.frequency && <span>📅 {med.frequency}</span>}
                              {med.duration && <span>⏱️ {med.duration}</span>}
                            </div>
                            {med.notes && <div className="med-notes">{med.notes}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {imageModal.digitalPrescription.advice && (
                    <div className="rx-section">
                      <h4>🩺 Doctor's Advice</h4>
                      <div className="advice-card">
                        {imageModal.digitalPrescription.advice}
                      </div>
                    </div>
                  )}

                  {(imageModal.digitalPrescription.tests || []).length > 0 && (
                    <div className="rx-section">
                      <h4>🔬 Recommended Tests</h4>
                      <div className="tests-grid">
                        {imageModal.digitalPrescription.tests.map((test, i) => (
                          <div key={i} className="test-card">{test}</div>
                        ))}
                      </div>
                    </div>
                  )}

                  {imageModal.digitalPrescription.followUpDate && (
                    <div className="rx-section">
                      <h4>📅 Follow-up</h4>
                      <div className="followup-card">
                        {formatDate(imageModal.digitalPrescription.followUpDate)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <img
                  src={imageModal.src}
                  alt={imageModal.alt}
                  className="image-modal-img"
                />
                <p className="image-modal-caption">{imageModal.alt}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
