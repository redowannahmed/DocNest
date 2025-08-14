import { useState } from 'react';
import '../css/PatientProfileView.css';

export default function PatientProfileView({ 
  patient, 
  medicalHistory, 
  pinnedConditions, 
  medications, 
  accessExpiresAt,
  hiddenVisitCount,
  onClose 
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [imageModal, setImageModal] = useState({ isOpen: false, src: '', alt: '' });

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

  const openImageModal = (src, alt) => {
    setImageModal({ isOpen: true, src, alt });
  };

  const closeImageModal = () => {
    setImageModal({ isOpen: false, src: '', alt: '' });
  };

  return (
    <div className="patient-profile-overlay">
      <div className="patient-profile-container">
        <div className="patient-profile-header">
          <div className="patient-info">
            <h2>{patient.name}'s Medical Profile</h2>
            <p className="patient-details">
              {patient.age && `${patient.age} years old`}
              {patient.gender && ` • ${patient.gender}`}
              {patient.location && ` • ${patient.location}`}
            </p>
          </div>
          <div className="access-info">
            <div className="access-timer">
              <span className="timer-label">Access expires in:</span>
              <span className="timer-value">{getRemainingTime()}</span>
            </div>
            <button className="close-btn" onClick={onClose}>×</button>
          </div>
        </div>

        {hiddenVisitCount > 0 && (
          <div className="privacy-notice">
            <span className="privacy-icon">🔒</span>
            {hiddenVisitCount} medical visit{hiddenVisitCount > 1 ? 's' : ''} hidden by patient
          </div>
        )}

        <div className="profile-tabs">
          <button 
            className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📋 Overview
          </button>
          <button 
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            🩺 Medical History ({medicalHistory.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'conditions' ? 'active' : ''}`}
            onClick={() => setActiveTab('conditions')}
          >
            🩹 Chronic Conditions ({pinnedConditions.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'medications' ? 'active' : ''}`}
            onClick={() => setActiveTab('medications')}
          >
            💊 Medications ({medications.length})
          </button>
        </div>

        <div className="profile-content">
          {activeTab === 'overview' && (
            <div className="overview-tab">
              <div className="overview-grid">
                <div className="overview-card">
                  <h3>Recent Medical History</h3>
                  {medicalHistory.slice(0, 3).map(visit => (
                    <div key={visit._id} className="recent-visit">
                      <div className="visit-header">
                        <span className="visit-date">{formatDate(visit.date)}</span>
                        <span className="visit-doctor">Dr. {visit.doctor}</span>
                      </div>
                      <div className="visit-reason">{visit.reason}</div>
                    </div>
                  ))}
                  {medicalHistory.length === 0 && (
                    <p className="no-data">No medical history available</p>
                  )}
                </div>

                <div className="overview-card">
                  <h3>Chronic Conditions</h3>
                  {pinnedConditions.slice(0, 5).map(condition => (
                    <div key={condition._id} className="condition-item">
                      <span className="condition-name">{condition.condition}</span>
                      <span className="condition-date">Since {formatDate(condition.diagnosisDate)}</span>
                    </div>
                  ))}
                  {pinnedConditions.length === 0 && (
                    <p className="no-data">No chronic conditions recorded</p>
                  )}
                </div>

                <div className="overview-card">
                  <h3>Current Medications</h3>
                  {medications.slice(0, 5).map(med => (
                    <div key={med._id} className="medication-item">
                      <span className="med-name">{med.medication}</span>
                      <span className="med-dosage">{med.dosage}</span>
                    </div>
                  ))}
                  {medications.length === 0 && (
                    <p className="no-data">No medications recorded</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="history-tab">
              {medicalHistory.length === 0 ? (
                <div className="no-data-large">
                  <p>No medical history available</p>
                </div>
              ) : (
                medicalHistory.map(visit => (
                  <div key={visit._id} className="visit-card">
                    <div className="visit-card-header">
                      <div className="visit-main-info">
                        <h4>{formatDate(visit.date)} - Dr. {visit.doctor}</h4>
                        <p className="visit-reason">{visit.reason}</p>
                      </div>
                      <div className="visit-badges">
                        {visit.specialty && (
                          <span className="specialty-badge">{visit.specialty}</span>
                        )}
                        <span className={`status-badge status-${visit.status?.toLowerCase()}`}>
                          {visit.status}
                        </span>
                      </div>
                    </div>

                    {visit.notes && (
                      <div className="visit-notes">
                        <strong>Notes:</strong>
                        <p>{visit.notes}</p>
                      </div>
                    )}

                    <div className="visit-attachments">
                      {visit.prescriptionImgs?.length > 0 && (
                        <div className="attachment-section">
                          <h5>Prescriptions ({visit.prescriptionImgs.length})</h5>
                          <div className="files-grid">
                            {visit.prescriptionImgs.map((img, index) => (
                              <div key={index} className="file-thumbnail">
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

                      {visit.testReports?.length > 0 && (
                        <div className="attachment-section">
                          <h5>Test Reports ({visit.testReports.length})</h5>
                          <div className="files-grid">
                            {visit.testReports.map((img, index) => (
                              <div key={index} className="file-thumbnail">
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
                ))
              )}
            </div>
          )}

          {activeTab === 'conditions' && (
            <div className="conditions-tab">
              {pinnedConditions.length === 0 ? (
                <div className="no-data-large">
                  <p>No chronic conditions recorded</p>
                </div>
              ) : (
                <div className="conditions-grid">
                  {pinnedConditions.map(condition => (
                    <div key={condition._id} className="condition-card">
                      <div className="condition-header">
                        <h4>{condition.condition}</h4>
                        <span className="condition-date">
                          Diagnosed: {formatDate(condition.diagnosisDate)}
                        </span>
                      </div>
                      
                      {condition.doctorName && (
                        <p className="condition-doctor">
                          <strong>Doctor:</strong> Dr. {condition.doctorName}
                        </p>
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
            <div className="medications-tab">
              {medications.length === 0 ? (
                <div className="no-data-large">
                  <p>No medications recorded</p>
                </div>
              ) : (
                <div className="medications-grid">
                  {medications.map(med => (
                    <div key={med._id} className="medication-card">
                      <div className="medication-header">
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

        {/* Image Modal */}
        {imageModal.isOpen && (
          <div className="image-modal-overlay" onClick={closeImageModal}>
            <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="image-modal-close" onClick={closeImageModal}>×</button>
              <img
                src={imageModal.src}
                alt={imageModal.alt}
                className="image-modal-img"
              />
              <p className="image-modal-caption">{imageModal.alt}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
