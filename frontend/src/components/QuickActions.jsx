"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../css/QuickActions.css"
import MedicalHistoryDialog from "./MedicalHistoryDialog"
import ShareAccessModal from "./ShareAccessModal"

const actions = [
  { label: "Add New Record", icon: "➕", action: "add-record" },
  { label: "Share Access", icon: "🔑", action: "share-access" },
  { label: "Doctor Blogs", icon: "📖", action: "doctor-blogs" },
]

export default function QuickActions({ onAddRecord }) {
  const [showAddRecordDialog, setShowAddRecordDialog] = useState(false)
  const [showShareAccessModal, setShowShareAccessModal] = useState(false)
  const navigate = useNavigate()

  const handleActionClick = (action) => {
    switch (action) {
      case "add-record":
        setShowAddRecordDialog(true)
        break
      case "share-access":
        setShowShareAccessModal(true)
        break
      case "doctor-blogs":
        // Navigate to doctor blogs page
        navigate("/doctor-blogs")
        break
      default:
        break
    }
  }

  const handleSaveRecord = async (recordData) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/userdata/medical-history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify({
          date: recordData.date,
          doctor: recordData.doctor,
          specialty: recordData.specialty,
          reason: recordData.reason,
          notes: recordData.notes,
          status: recordData.status,
          // Change from prescriptions to prescriptionImgs
          prescriptionImgs: recordData.prescriptionImgs,
          // Keep testReports as it matches both components
          testReports: recordData.testReports,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save medical record")
      }

      const newRecord = await response.json()

      if (onAddRecord) {
        onAddRecord(newRecord)
      }

      setShowAddRecordDialog(false)
    } catch (error) {
      console.error("Error saving medical record:", error)
      throw error
    }
  }

  return (
    <>
      <div className="quick-actions-container">
        <div className="quick-actions-grid">
          {actions.map((action, idx) => (
            <button key={idx} className="quick-action-card" onClick={() => handleActionClick(action.action)}>
              <div className="action-icon">{action.icon}</div>
              <div className="action-label">{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      <MedicalHistoryDialog
        isOpen={showAddRecordDialog}
        onClose={() => setShowAddRecordDialog(false)}
        onSave={handleSaveRecord}
      />

      <ShareAccessModal
        isOpen={showShareAccessModal}
        onClose={() => setShowShareAccessModal(false)}
      />
    </>
  )
}
