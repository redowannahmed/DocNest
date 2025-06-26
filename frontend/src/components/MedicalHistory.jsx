import { useState } from "react";
import "../css/MedicalHistory.css";

export default function MedicalHistory({ user, medicalHistory = [], setMedicalHistory }) {
  const [form, setForm] = useState({ date: "", doctor: "", reason: "", prescriptionImgs: "", testReports: "", notes: "" });
  const [expandedId, setExpandedId] = useState(null);
  const token = localStorage.getItem("token");

  const addVisit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      prescriptionImgs: form.prescriptionImgs ? form.prescriptionImgs.split(",") : [],
      testReports: form.testReports ? form.testReports.split(",") : [],
    };
    const res = await fetch("/api/userdata/medical-history", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: token },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setMedicalHistory([...medicalHistory, data]);
    setForm({ date: "", doctor: "", reason: "", prescriptionImgs: "", testReports: "", notes: "" });
  };

  return (
    <div className="medical-history">
      <div className="search-container">
        <input type="text" className="search-input" placeholder="Search by tag, date, doctor..." />
        <select className="filter-select">
          <option>All</option>
          <option>Last 7 Days</option>
        </select>
      </div>
      <h3 className="section-title">Your Medical Visits</h3>
      <div className="visits-container">
        {medicalHistory.map((visit) => (
          <div key={visit._id} className="visit-card">
            <div className="visit-header" onClick={() => setExpandedId(expandedId === visit._id ? null : visit._id)}>
              <div>
                <div className="visit-date">{visit.date?.slice(0, 10)}</div>
                <div className="visit-meta">{visit.doctor} — {visit.reason}</div>
              </div>
              <span className={`visit-icon ${expandedId === visit._id ? "rotated" : ""}`}>▼</span>
            </div>
            {expandedId === visit._id && (
              <div className="visit-details">
                <div className="details-section">
                  <strong>Notes:</strong> {visit.notes}
                </div>
                <div className="details-section">
                  <strong>Prescriptions:</strong>
                  {visit.prescriptionImgs?.map((img, i) => (
                    <img key={i} src={img} alt="Prescription" style={{ width: 80 }} />
                  ))}
                </div>
                <div className="details-section">
                  <strong>Test Reports:</strong>
                  {visit.testReports?.map((img, i) => (
                    <img key={i} src={img} alt="Test Report" style={{ width: 80 }} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={addVisit} className="add-form">
        <input name="date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
        <input name="doctor" placeholder="Doctor" value={form.doctor} onChange={e => setForm({ ...form, doctor: e.target.value })} />
        <input name="reason" placeholder="Reason" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} />
        <input name="prescriptionImgs" placeholder="Prescription Image URLs (comma separated)" value={form.prescriptionImgs} onChange={e => setForm({ ...form, prescriptionImgs: e.target.value })} />
        <input name="testReports" placeholder="Test Report URLs (comma separated)" value={form.testReports} onChange={e => setForm({ ...form, testReports: e.target.value })} />
        <input name="notes" placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
        <button type="submit">Add Visit</button>
      </form>
    </div>
  );
}
