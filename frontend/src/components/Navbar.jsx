import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import {
  FaBars,
  FaMoon,
  FaSun,
  FaTachometerAlt,
  FaUserInjured,
  FaUserMd,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaUserCircle,
} from "react-icons/fa";

function Navbar() {
  const navigate = useNavigate();

  const [open, setOpen] = useState(true);

  const [darkMode, setDarkMode] =
    useState(false);

  const location = useLocation();

  const token =
    sessionStorage.getItem("token");

  if (
    !token ||
    location.pathname === "/" ||
    location.pathname === "/login"
  ) {
    return null;
  }

  console.log("Navbar Rendering");

  function logout() {
    sessionStorage.removeItem("token");
    navigate("/login");
  }

  function toggleDarkMode() {
    setDarkMode(!darkMode);

    document.body.classList.toggle(
      "dark-mode"
    );
  }

  return (
    <div
      className={
        open
          ? "sidebar"
          : "sidebar collapsed"
      }
    >
      <button
        className="menu-btn"
        onClick={() =>
          setOpen(!open)
        }
      >
        <FaBars />
      </button>

      {open && (
        <>
          <h2 className="logo">
            🏥 HMS
          </h2>

          <Link
            to="/dashboard"
            className={
              location.pathname === "/dashboard"
                ? "active-link"
                : ""
            }
          >
            <FaTachometerAlt />
            Dashboard
          </Link>

          <Link
            to="/patients"
            className={
              location.pathname ===
                "/patients"
                ? "active-link"
                : ""
            }
          >
            <FaUserInjured />
            {open && <span>Patients</span>}
          </Link>

          <Link
            to="/doctors"
            className={
              location.pathname ===
                "/doctors"
                ? "active-link"
                : ""
            }
          >
            <FaUserMd />
            Doctors
          </Link>

          <Link
            to="/appointments"
            className={
              location.pathname ===
                "/appointments"
                ? "active-link"
                : ""
            }
          >
            <FaCalendarCheck />
            Appointments
          </Link>

          {/* NEW PRESCRIPTIONS MENU */}
          <Link
            to="/prescriptions"
            className={
              location.pathname ===
                "/prescriptions"
                ? "active-link"
                : ""
            }
          >
            💊 Prescriptions
          </Link>

          <Link
            to="/billing"
            className={
              location.pathname ===
                "/billing"
                ? "active-link"
                : ""
            }
          >
            <FaMoneyBillWave />
            Billing
          </Link>

          <Link
            to="/profile"
            className={
              location.pathname ===
                "/profile"
                ? "active-link"
                : ""
            }
          >
            <FaUserCircle />
            Profile
          </Link>

          <button
            className="theme-btn"
            onClick={
              toggleDarkMode
            }
          >
            {darkMode ? (
              <FaSun />
            ) : (
              <FaMoon />
            )}

            {darkMode
              ? " Light Mode"
              : " Dark Mode"}
          </button>

          <button
            className="logout-btn"
            onClick={logout}
          >
            Logout
          </button>
        </>
      )}
    </div>
  );
}

export default Navbar;