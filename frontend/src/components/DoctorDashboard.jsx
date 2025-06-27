import "../css/DoctorDashboard.css";

export default function DoctorDashboard({ user }) {
  return (
    <div className="doctor-dashboard">
      <header className="doctor-header">
        <h1>Doctor Dashboard</h1>
        <p>Welcome, Dr. {user.name}</p>
      </header>

      <section className="community-forum">
        <h2>Community Forum</h2>
        <div className="forum-placeholder">
          <p>Coming Soon: Share posts, comment, and discuss with fellow doctors!</p>
        </div>
      </section>

      <section className="appointments-today">
        <h2>Today's Appointments</h2>
        <ul className="appointments-list">
          <li>Patient 1</li>
          <li>Patient 2</li>
          <li>Patient 3</li>
        </ul>
      </section>

      <section className="past-patients">
        <h2>Past Patients</h2>
        <ul className="past-patients-list">
          <li>John Doe</li>
          <li>Jane Smith</li>
          <li>Michael Johnson</li>
        </ul>
      </section>
    </div>
  );
}
