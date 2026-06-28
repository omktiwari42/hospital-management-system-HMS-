import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const token = sessionStorage.getItem("token");

  if (!token || location.pathname === "/login") {
    return null;
  }

  return (
    <div className="sidebar">
      <h2 className="logo">🏥 HMS</h2>

      <Link to="/dashboard">📊 Dashboard</Link>
      <Link to="/patients">👨‍⚕️ Patients</Link>
      <Link to="/doctors">🩺 Doctors</Link>
      <Link to="/appointments">📅 Appointments</Link>
      <Link to="/prescriptions">💊 Prescriptions</Link>
      <Link to="/billing">💳 Billing</Link>
      <Link to="/profile">👤 Profile</Link>
    </div>
  );
}

export default Sidebar;