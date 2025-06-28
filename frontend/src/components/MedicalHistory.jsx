"use client"

import { useState } from "react"
import "../css/MedicalHistory.css"

export default function MedicalHistory({ user, medicalHistory = [], setMedicalHistory }) {
  const [expandedId, setExpandedId] = useState(null)
  const [imageModal, setImageModal] = useState({ isOpen: false, src: "", alt: "" })

  // Mock data to match the design if no real data
  const mockVisits = [
    {
      _id: "1",
      doctor: "Dr. Sarah Johnson",
      specialty: "Endocrinologist",
      status: "Completed",
      date: "2024-12-15",
      reason: "Diabetes Follow-up",
      notes: "Regular diabetes check-up. Blood sugar levels are well controlled.",
      prescriptionImgs: [],
      testReports: [],
    },
    {
      _id: "2",
      doctor: "Dr. Michael Chen",
      specialty: "Cardiologist",
      status: "Completed",
      date: "2024-11-28",
      reason: "Hypertension Review",
      notes: "Blood pressure monitoring and medication adjustment.",
      prescriptionImgs: [],
      testReports: [],
    },
    {
      _id: "3",
      doctor: "Dr. Emily Rodriguez",
      specialty: "Neurologist",
      status: "Completed",
      date: "2024-10-10",
      reason: "Migraine Management",
      notes: "Migraine frequency has decreased. Discussed trigger management.",
      prescriptionImgs: [],
      testReports: [],
    },
  ]

  const visitsToShow = medicalHistory.length > 0 ? medicalHistory : mockVisits

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
  const openImageModal = (imageUrl, altText) => {
    setImageModal({
      isOpen: true,
      src: imageUrl,
      alt: altText
    })
  }

  // Function to close image modal
  const closeImageModal = () => {
    setImageModal({ isOpen: false, src: "", alt: "" })
  }

  return (
    <div className="medical-history">
      <div className="search-container">
        <input type="text" className="search-input" placeholder="Search by tag, date, doctor..." />
      </div>

      <h3 className="section-title">Medical Visits</h3>

      <div className="visits-container">
        {visitsToShow.map((visit) => (
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
                <div className="details-section">
                  <strong>Notes:</strong>
                  <p>{visit.notes || "No notes available"}</p>
                </div>

                <div className="details-section">
                  <strong>Prescriptions:</strong>
                  <div className="files-grid">
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
                      <p className="no-files">No prescriptions uploaded</p>
                    )}
                  </div>
                </div>

                <div className="details-section">
                  <strong>Test Reports:</strong>
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
                      <p className="no-files">No test reports uploaded</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {imageModal.isOpen && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div className="image-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="image-modal-close" onClick={closeImageModal}>
              ×
            </button>
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
  )
}