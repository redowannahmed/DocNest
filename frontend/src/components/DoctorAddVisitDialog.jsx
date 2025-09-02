"use client"

import { useState } from "react"
import { X, Save, Calendar } from "lucide-react"

export default function DoctorAddVisitDialog({ isOpen, onClose, accessCode, onSaved }) {
  const [visitData, setVisitData] = useState({
    date: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  })
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate API call to add visit
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Call the onSaved callback with the new visit data
      onSaved({
        ...visitData,
        id: Date.now(),
        accessCode,
      })

      // Reset form
      setVisitData({
        date: "",
        diagnosis: "",
        treatment: "",
        notes: "",
      })
    } catch (error) {
      console.error("Error adding visit:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card rounded-xl border border-border max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-accent" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-foreground">Add Medical Visit</h3>
                <p className="text-sm text-muted-foreground">Access Code: {accessCode}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label htmlFor="visit-date" className="block text-sm font-medium text-foreground mb-2">
              Visit Date
            </label>
            <input
              id="visit-date"
              type="date"
              value={visitData.date}
              onChange={(e) => setVisitData({ ...visitData, date: e.target.value })}
              required
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          <div>
            <label htmlFor="diagnosis" className="block text-sm font-medium text-foreground mb-2">
              Diagnosis
            </label>
            <input
              id="diagnosis"
              type="text"
              placeholder="Enter diagnosis..."
              value={visitData.diagnosis}
              onChange={(e) => setVisitData({ ...visitData, diagnosis: e.target.value })}
              required
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          <div>
            <label htmlFor="treatment" className="block text-sm font-medium text-foreground mb-2">
              Treatment
            </label>
            <input
              id="treatment"
              type="text"
              placeholder="Enter treatment plan..."
              value={visitData.treatment}
              onChange={(e) => setVisitData({ ...visitData, treatment: e.target.value })}
              required
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-foreground mb-2">
              Additional Notes
            </label>
            <textarea
              id="notes"
              placeholder="Enter any additional notes..."
              value={visitData.notes}
              onChange={(e) => setVisitData({ ...visitData, notes: e.target.value })}
              rows="4"
              className="w-full px-4 py-3 bg-input border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Adding Visit...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Add Visit
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
