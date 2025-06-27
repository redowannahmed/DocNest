import React, { useEffect, useState } from "react";

export default function DoctorDashboard() {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [history, setHistory] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("/api/doctor/patients", { headers: { Authorization: token } })
      .then(res => res.json())
      .then(setPatients);
  }, []);

  const loadHistory = (id) => {
    setSelectedPatient(id);
    fetch(`/api/doctor/history/${id}`, { headers: { Authorization: token } })
      .then(res => res.json())
      .then(setHistory);
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h2>Doctor Dashboard</h2>
      <div style={{ display: "flex", gap: "2rem" }}>
        <div>
          <h3>Patients</h3>
          {patients.map((p) => (
            <div key={p._id} onClick={() => loadHistory(p._id)} style={{ cursor: "pointer", marginBottom: "0.5rem" }}>
              {p.name} ({p.email})
            </div>
          ))}
        </div>
        <div>
          {selectedPatient && (
            <>
              <h3>Medical History</h3>
              {history.map((visit) => (
                <div key={visit._id}>
                  <strong>{visit.date?.slice(0, 10)}</strong> - {visit.reason}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
