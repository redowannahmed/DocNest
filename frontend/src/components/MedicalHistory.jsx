"use client"

import { useMemo, useState } from "react"
import "../css/MedicalHistory.css"

export default function MedicalHistory({ user, medicalHistory = [], setMedicalHistory }) {
  const [expandedId, setExpandedId] = useState(null)
  const [imageModal, setImageModal] = useState({ isOpen: false, src: "", alt: "" })
  const [searchQuery, setSearchQuery] = useState("")

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
