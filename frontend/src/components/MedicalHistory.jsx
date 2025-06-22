import { useState } from "react";
import "../css/MedicalHistory.css";

const dummyVisits = [
  {
    id: 1,
    date: "2025-06-01",
    doctor: "Dr. Asif Rahman",
    reason: "Follow-up Checkup",
    prescriptionImgs: ["https://via.placeholder.com/150"],
    testReports: ["https://via.placeholder.com/150"],
    notes: "Continue medication as before. Next visit in 3 months."
  }
];

export default function MedicalHistory() {
  const [expandedId, setExpandedId] = useState(null);
  return (
    <div className="medical-history">
      <div className="search-container">
        <input
          type="text"
          className="search-input"
          placeholder="Search by tag, date, doctor..."
        />
        <select className="filter-select">
          <option>All</option>
          <option>Last 7 Days</option>
        </select>
      </div>
      <h3 className="section-title">
        <i className="fa fa-calendar"></i> Your Medical Visits
      </h3>
      <div className="visits-container">
        {dummyVisits.map((visit) => (
          <div
            key={visit.id}
            className="visit-card"
          >
            <div
              className="visit-header"
              onClick={() =>
                setExpandedId(expandedId === visit.id ? null : visit.id)
              }
            >
              <div>
                <div className="visit-date">📆 {visit.date}</div>
                <div className="visit-meta">
                  👨‍⚕️ {visit.doctor} — 📝 {visit.reason}
                </div>
              </div>
              <i className="fa fa-chevron-down visit-icon"></i>
            </div>
            {expandedId === visit.id && (
              <div className="visit-details">
                <div className="details-section">
                  <div className="section-title">Prescriptions</div>
                  <div className="images-container">
                    {visit.prescriptionImgs.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="prescription"
                        className="prescription-image"
                      />
                    ))}
                  </div>
                </div>
                <div className="details-section">
                  <div className="section-title">Test Reports</div>
                  <div className="images-container">
                    {visit.testReports.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt="report"
                        className="report-image"
                      />
                    ))}
                  </div>
                </div>
                <div className="details-section">
                  <div className="section-title">Doctor Notes</div>
                  <blockquote className="doctor-notes">
                    {visit.notes}
                  </blockquote>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}