"use client"

import { useState } from "react"
import "../css/MedicalHistory.css"

export default function MedicalHistory({ user, medicalHistory = [], setMedicalHistory }) {
  const [form, setForm] = useState({
    date: "",
    doctor: "",
    reason: "",
    prescriptionImgs: "",
    testReports: "",
    notes: "",
  })
  const [expandedId, setExpandedId] = useState(null)
  const token = localStorage.getItem("token")

  const addVisit = async (e) => {
    e.preventDefault()
    const payload = {
      ...form,
      prescriptionImgs: form.prescriptionImgs ? form.prescriptionImgs.split(",") : [],
      testReports: form.testReports ? form.testReports.split(",") : [],
    }
    const res = await fetch("/api/userdata/medical-history", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    setMedicalHistory([...medicalHistory, data])
    setForm({ date: "", doctor: "", reason: "", prescriptionImgs: "", testReports: "", notes: "" })
  }

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
                  <span>{visit.date?.slice(0, 10) || visit.date}</span>
                  <span>{visit.reason}</span>
                </div>
              </div>
              <span className={`visit-icon ${expandedId === visit._id ? "rotated" : ""}`}>▼</span>
            </div>

            {expandedId === visit._id && (
              <div className="visit-details">
                <div className="details-section">
                  <strong>Notes:</strong>
                  <p>{visit.notes}</p>
                </div>
                <div className="details-section">
                  <strong>Prescriptions:</strong>
                  {visit.prescriptionImgs?.length > 0 ? (
                    visit.prescriptionImgs.map((img, i) => (
                      <img key={i} src={img || "/placeholder.svg"} alt="Prescription" />
                    ))
                  ) : (
                    <p>No prescriptions uploaded</p>
                  )}
                </div>
                <div className="details-section">
                  <strong>Test Reports:</strong>
                  {visit.testReports?.length > 0 ? (
                    visit.testReports.map((img, i) => <img key={i} src={img || "/placeholder.svg"} alt="Test Report" />)
                  ) : (
                    <p>No test reports uploaded</p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={addVisit} className="add-form">
        <input
          name="date"
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          required
        />
        <input
          name="doctor"
          placeholder="Doctor"
          value={form.doctor}
          onChange={(e) => setForm({ ...form, doctor: e.target.value })}
        />
        <input
          name="reason"
          placeholder="Reason"
          value={form.reason}
          onChange={(e) => setForm({ ...form, reason: e.target.value })}
        />
        <input
          name="prescriptionImgs"
          placeholder="Prescription Image URLs (comma separated)"
          value={form.prescriptionImgs}
          onChange={(e) => setForm({ ...form, prescriptionImgs: e.target.value })}
        />
        <input
          name="testReports"
          placeholder="Test Report URLs (comma separated)"
          value={form.testReports}
          onChange={(e) => setForm({ ...form, testReports: e.target.value })}
        />
        <input
          name="notes"
          placeholder="Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
        />
        <button type="submit">Add Visit</button>
      </form>
    </div>
  )
}
