import {
  Link,
  useLocation,
} from "react-router-dom";

function Sidebar() {
  const location =
    useLocation();

  const token =
    localStorage.getItem(
      "token"
    );

  if (
    !token ||
    location.pathname ===
    "/login"
  ) {
    return null;
  }

  return (
    <div>
      <h2>🏥 HMS</h2>

      <ul>
        <li>
          <Link to="/dashboard">
            📊 Dashboard
          </Link>
        </li>

        <li>
          <Link to="/patients">
            👨‍⚕️ Patients
          </Link>
        </li>

        <li>
          <Link to="/doctors">
            🩺 Doctors
          </Link>
        </li>

        <li>
          <Link to="/appointments">
            📅 Appointments
          </Link>
        </li>

        <li>
          <Link to="/billing">
            💳 Billing
          </Link>
        </li>

        <li>
          <Link to="/profile">
            👤 Profile
          </Link>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;