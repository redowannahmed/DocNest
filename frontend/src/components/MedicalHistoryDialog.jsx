"use client"

import { useState } from "react"
import FileUpload from "./FileUpload"
import "../css/MedicalHistoryDialog.css"

export default function MedicalHistoryDialog({ isOpen, onClose, onSave, editingVisit = null }) {
  const [formData, setFormData] = useState({
    date: editingVisit?.date?.slice(0, 10) || "",
    doctor: editingVisit?.doctor || "",
    specialty: editingVisit?.specialty || "",
    reason: editingVisit?.reason || "",
    notes: editingVisit?.notes || "",
    status: editingVisit?.status || "Completed",
    prescriptions: editingVisit?.prescriptions || [],
    testReports: editingVisit?.testReports || [],
  })

  const [activeTab, setActiveTab] = useState("basic")
  const [saving, setSaving] = useState(false)

  const specialties = [
    "General Practice",
    "Cardiology",
    "Dermatology",
    "Endocrinology",
    "Gastroenterology",
    "Neurology",
    "Oncology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Other",
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePrescriptionUpload = (files) => {
    setFormData((prev) => ({
      ...prev,
      prescriptions: [...prev.prescriptions, ...files],
    }))
  }

  const handleTestReportUpload = (files) => {
    setFormData((prev) => ({
      ...prev,
      testReports: [...prev.testReports, ...files],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await onSave(formData)
      onClose()
    } catch (error) {
      console.error("Error saving visit:", error)
      alert("Error saving visit: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="dialog-overlay" onClick={onClose}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>{editingVisit ? "Edit Medical Visit" : "Add New Medical Visit"}</h2>
          <button className="dialog-close" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="dialog-tabs">
          <button
            className={`tab-button ${activeTab === "basic" ? "active" : ""}`}
            onClick={() => setActiveTab("basic")}
          >
            📋 Basic Info
          </button>
          <button
            className={`tab-button ${activeTab === "prescriptions" ? "active" : ""}`}
            onClick={() => setActiveTab("prescriptions")}
          >
            💊 Prescriptions
          </button>
          <button
            className={`tab-button ${activeTab === "reports" ? "active" : ""}`}
            onClick={() => setActiveTab("reports")}
          >
            📊 Test Reports
          </button>
        </div>

        <form onSubmit={handleSubmit} className="dialog-form">
          {activeTab === "basic" && (
            <div className="tab-content">
              <div className="form-row">
                <div className="form-group">
                  <label>Visit Date *</label>
                  <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select name="status" value={formData.status} onChange={handleInputChange}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Doctor Name *</label>
                  <input
                    type="text"
                    name="doctor"
                    value={formData.doctor}
                    onChange={handleInputChange}
                    placeholder="Dr. John Smith"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Specialty</label>
                  <select name="specialty" value={formData.specialty} onChange={handleInputChange}>
                    <option value="">Select specialty</option>
                    {specialties.map((specialty) => (
                      <option key={specialty} value={specialty}>
                        {specialty}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Reason for Visit *</label>
                <input
                  type="text"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  placeholder="Annual checkup, follow-up, etc."
                  required
                />
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes about the visit..."
                  rows="4"
                />
              </div>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="tab-content">
              <div className="upload-section">
                <h3>Upload Prescription Images</h3>
                <p className="upload-description">
                  Upload clear photos of your prescriptions. Make sure all text is readable.
                </p>
                <FileUpload
                  uploadType="prescription"
                  onFilesUploaded={handlePrescriptionUpload}
                  label="Upload Prescription Images"
                  maxFiles={5}
                />
              </div>
            </div>
          )}

          {activeTab === "reports" && (
            <div className="tab-content">
              <div className="upload-section">
                <h3>Upload Test Report Images</h3>
                <p className="upload-description">Upload photos of your test reports, lab results, X-rays, etc.</p>
                <FileUpload
                  uploadType="test-report"
                  onFilesUploaded={handleTestReportUpload}
                  label="Upload Test Report Images"
                  maxFiles={5}
                />
              </div>
            </div>
          )}

          <div className="dialog-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? "Saving..." : editingVisit ? "Update Visit" : "Save Visit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
