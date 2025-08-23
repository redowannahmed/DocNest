"use client"

import { useMemo, useState } from "react"
import "../css/MedicalHistory.css"
import TestReportUpload from "./TestReportUpload"

export default function MedicalHistory({ user, medicalHistory = [], setMedicalHistory }) {
  const [expandedId, setExpandedId] = useState(null)
  const [imageModal, setImageModal] = useState({ isOpen: false, src: "", alt: "" })
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadModal, setUploadModal] = useState({ isOpen: false, visitId: null })

  // Build a searchable text blob for a visit: doctor, specialty, reason, status, and multiple date formats
  const buildVisitIndex = (visit) => {
    const doctor = (visit?.doctor || "").toString().toLowerCase()
    const specialty = (visit?.specialty || "").toString().toLowerCase()
    const reason = (visit?.reason || "").toString().toLowerCase()
    const status = (visit?.status || "").toString().toLowerCase()

    const raw = visit?.date ? String(visit.date) : ""
    let yyyy = "", mm = "", dd = "", mmm = "", mmmm = ""
    try {
      const d = visit?.date ? new Date(visit.date) : null
      if (d && !isNaN(d.getTime())) {
        yyyy = String(d.getFullYear())
        mm = String(d.getMonth() + 1).padStart(2, "0")
        dd = String(d.getDate()).padStart(2, "0")
        const monthShort = d.toLocaleString("en-US", { month: "short" }).toLowerCase() // jan
        const monthLong = d.toLocaleString("en-US", { month: "long" }).toLowerCase() // january
        mmm = monthShort
        mmmm = monthLong
      }
    } catch (_) {}

    const iso = raw.includes("T") ? raw.slice(0, 10) : (yyyy && mm && dd ? `${yyyy}-${mm}-${dd}` : "")
    const dateVariants = [
      iso,
      yyyy,
      mm,
      dd,
      mmm,
      mmmm,
      yyyy && mm && dd ? `${mm}/${dd}/${yyyy}` : "",
      yyyy && mm && dd ? `${dd}/${mm}/${yyyy}` : "",
      yyyy && mmm && dd ? `${mmm} ${dd} ${yyyy}` : "",
      yyyy && mmm && dd ? `${dd} ${mmm} ${yyyy}` : "",
      yyyy && mmmm && dd ? `${mmmm} ${dd} ${yyyy}` : "",
      yyyy && mmmm && dd ? `${dd} ${mmmm} ${yyyy}` : "",
    ]

    return [doctor, specialty, reason, status, ...dateVariants].filter(Boolean).join(" ")
  }

  const filteredVisits = useMemo(() => {
    const list = Array.isArray(medicalHistory) ? medicalHistory : []
    const q = (searchQuery || "").trim().toLowerCase()
    if (!q) return list
    const tokens = q.split(/\s+/).filter(Boolean)
    return list.filter((v) => {
      const hay = buildVisitIndex(v)
      return tokens.every((t) => hay.includes(t))
    })
  }, [medicalHistory, searchQuery])

  const formatDate = (dateString) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Function to get image URL from different data structures
  const getImageUrl = (img) => {
    if (typeof img === 'string') return img
    if (img && typeof img === 'object' && img.url) return img.url
    return "/placeholder.svg?height=100&width=100"
  }

  // Function to open image in modal
  const openImageModal = (imageUrl, altText, digitalPrescription = null) => {
    setImageModal({
      isOpen: true,
      src: imageUrl,
      alt: altText,
      digitalPrescription
    })
  }

  // Function to close image modal
  const closeImageModal = () => {
    setImageModal({ isOpen: false, src: "", alt: "", digitalPrescription: null })
  }

  // Function to open test report upload modal
  const openUploadModal = (visitId) => {
    setUploadModal({ isOpen: true, visitId })
  }

  // Function to close test report upload modal
  const closeUploadModal = () => {
    setUploadModal({ isOpen: false, visitId: null })
  }

  // Function to handle successful upload
  const handleUploadSuccess = (updatedVisit) => {
    // Update the medical history with the new test reports
    if (setMedicalHistory) {
      setMedicalHistory(prevHistory => 
        prevHistory.map(visit => 
          visit._id === updatedVisit._id ? updatedVisit : visit
        )
      )
    }
  }

  return (
    <div className="medical-history">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by doctor, date, specialty (e.g., cardiologist), or reason"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <h3 className="section-title">Medical Visits</h3>

      <div className="visits-container">
        {filteredVisits.length > 0 ? (
          filteredVisits.map((visit) => (
            <div key={visit._id} className="visit-card">
              <div className="visit-header" onClick={() => setExpandedId(expandedId === visit._id ? null : visit._id)}>
                <div className="visit-info">
                  <div className="visit-doctor">
                    {visit.doctor}
                    {visit.specialty && <span className="specialty-badge">{visit.specialty}</span>}
                    {visit.status && <span className="status-badge">{visit.status}</span>}
                  </div>
                  <div className="visit-date-reason">
                    <span>{formatDate(visit.date)}</span>
                    <span>{visit.reason}</span>
                  </div>
                </div>
                <span className={`visit-icon ${expandedId === visit._id ? "rotated" : ""}`}>▼</span>
              </div>

              {expandedId === visit._id && (
                <div className="visit-details">
                  {/* Visit Metadata */}
                  <div className="visit-metadata">
                    <div className="metadata-item">
                      <span className="metadata-label">Created by:</span>
                      <span className="metadata-value">
                        {visit.createdByRole === 'doctor' ? (
                          <span className="doctor-badge">
                            <i className="fas fa-user-md"></i>
                            Doctor
                          </span>
                        ) : (
                          <span className="patient-badge">
                            <i className="fas fa-user"></i>
                            Self-reported
                          </span>
                        )}
                      </span>
                    </div>
                    {visit.createdAt && (
                      <div className="metadata-item">
                        <span className="metadata-label">Added on:</span>
                        <span className="metadata-value">{formatDate(visit.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  {/* Notes Section */}
                  <div className="details-section">
                    <strong>
                      <i className="section-icon">📝</i>
                      Notes:
                    </strong>
                    <div className="notes-content">
                      <p>{visit.notes || "No notes available"}</p>
                    </div>
                  </div>

                  {/* Prescriptions Section */}
                  <div className="details-section">
                    <strong>
                      <i className="section-icon">💊</i>
                      Prescriptions:
                    </strong>
                    <div className="files-grid">
                      {/* Show digital prescription only for doctor-created visits */}
                      {visit.digitalPrescription && visit.createdByRole === 'doctor' && (
                        <div className="digital-prescription-card" onClick={() => openImageModal(null, 'Digital Prescription', visit.digitalPrescription)}>
                          <div className="digital-rx-icon">
                            <i className="fas fa-file-prescription"></i>
                          </div>
                          <div className="digital-rx-content">
                            <div className="digital-rx-title">Digital Prescription</div>
                            <div className="digital-rx-subtitle">
                              {(visit.digitalPrescription.medications || []).length} medication(s)
                              {visit.digitalPrescription.advice && ' • Advice included'}
                              {(visit.digitalPrescription.tests || []).length > 0 && ` • ${visit.digitalPrescription.tests.length} test(s)`}
                            </div>
                          </div>
                          <div className="digital-rx-arrow">
                            <i className="fas fa-chevron-right"></i>
                          </div>
                        </div>
                      )}
                      
                      {/* Show prescription images */}
                      {visit.prescriptionImgs?.length > 0 ? (
                        visit.prescriptionImgs.map((img, i) => {
                          const imageUrl = getImageUrl(img)
                          return (
                            <div key={i} className="file-item">
                              <img
                                src={imageUrl}
                                alt={`Prescription ${i + 1}`}
                                className="file-thumbnail"
                                onClick={() => openImageModal(imageUrl, `Prescription ${i + 1}`)}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          )
                        })
                      ) : (
                        /* Show "no prescription uploaded" only for patient-created visits or doctor visits without digital prescription */
                        (visit.createdByRole !== 'doctor' || !visit.digitalPrescription) && (
                          <p className="no-files">No prescriptions uploaded</p>
                        )
                      )}
                    </div>
                  </div>

                  {/* Test Reports Section */}
                  <div className="details-section">
                    <div className="section-header">
                      <strong>
                        <i className="section-icon">📋</i>
                        Test Reports:
                      </strong>
                      {/* Show upload button only for doctor-created visits and only if user is the patient */}
                      {visit.createdByRole === 'doctor' && user && (
                        <button 
                          className="add-test-report-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openUploadModal(visit._id);
                          }}
                          title="Add test report to this visit"
                        >
                          <i className="fas fa-plus"></i>
                          Add Test Report
                        </button>
                      )}
                    </div>
                    <div className="files-grid">
                      {visit.testReports?.length > 0 ? (
                        visit.testReports.map((img, i) => {
                          const imageUrl = getImageUrl(img)
                          return (
                            <div key={i} className="file-item">
                              <img
                                src={imageUrl}
                                alt={`Test Report ${i + 1}`}
                                className="file-thumbnail"
                                onClick={() => openImageModal(imageUrl, `Test Report ${i + 1}`)}
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          )
                        })
                      ) : (
                        <div className="no-files-container">
                          <p className="no-files">
                            {visit.createdByRole === 'doctor' 
                              ? 'No test reports uploaded yet' 
                              : 'No test reports uploaded'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="no-history">
            <p>You currently don't have any medical history.</p>
          </div>
        )}
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal}>
              ×
            </button>
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
      
      {/* Test Report Upload Modal */}
      {uploadModal.isOpen && (
        <TestReportUpload
          visitId={uploadModal.visitId}
          onUploadSuccess={handleUploadSuccess}
          onClose={closeUploadModal}
        />
      )}
    </div>
  )
}
