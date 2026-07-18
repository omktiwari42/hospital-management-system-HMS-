import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaBars,
  FaHome,
  FaUserInjured,
  FaUserMd,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaPills,
  FaFlask,
  FaUserCircle,
  FaPlusCircle,
  FaClipboardList,
} from "react-icons/fa";

function Sidebar() {
  // Start collapsed
  const [collapsed, setCollapsed] = useState(true);

  const [role, setRole] = useState(
    sessionStorage.getItem("role") || ""
  );

  useEffect(() => {
    function syncRole() {
      setRole(sessionStorage.getItem("role") || "");
    }

    window.addEventListener("storage", syncRole);
    window.addEventListener("userUpdated", syncRole);

    return () => {
      window.removeEventListener("storage", syncRole);
      window.removeEventListener("userUpdated", syncRole);
    };
  }, []);

  // Auto close after 3 seconds whenever opened
  useEffect(() => {
    if (!collapsed) {
      const timer = setTimeout(() => {
        setCollapsed(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [collapsed]);

  const toggleSidebar = () => {
    setCollapsed((prev) => !prev);
  };

  return (
    <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
      <button
        className="menu-btn"
        onClick={toggleSidebar}
      >
        <FaBars />
      </button>

      {!collapsed && <h2 className="logo">🏥 HMS</h2>}

      {/* Admin Dashboard */}
      {role === "admin" && (
        <NavLink to="/dashboard">
          <FaHome />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
      )}

      {/* Doctor Dashboard */}
      {role === "doctor" && (
        <NavLink to="/doctor-dashboard">
          <FaHome />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
      )}

      {/* Reception Dashboard */}
      {role === "receptionist" && (
        <NavLink to="/reception-dashboard">
          <FaHome />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
      )}

      {/* Pharmacist Dashboard */}
      {role === "pharmacist" && (
        <NavLink to="/pharmacist-dashboard">
          <FaHome />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
      )}

      {/* Lab Dashboard */}
      {role === "lab" && (
        <NavLink to="/lab-dashboard">
          <FaHome />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
      )}

      {/* Patient Dashboard */}
      {role === "patient" && (
        <NavLink to="/patient-dashboard">
          <FaHome />
          {!collapsed && <span>Dashboard</span>}
        </NavLink>
      )}

      {(role === "admin" || role === "receptionist") && (
        <NavLink to="/patients">
          <FaUserInjured />
          {!collapsed && <span>Patients</span>}
        </NavLink>
      )}

      {(role === "admin" || role === "receptionist") && (
        <NavLink to="/appointments">
          <FaCalendarCheck />
          {!collapsed && <span>Appointments</span>}
        </NavLink>
      )}

      {(role === "admin" || role === "doctor") && (
        <NavLink to="/doctors">
          <FaUserMd />
          {!collapsed && <span>Doctors</span>}
        </NavLink>
      )}

      {(role === "admin" || role === "doctor") && (
        <NavLink to="/prescriptions">
          <FaPills />
          {!collapsed && <span>Prescriptions</span>}
        </NavLink>
      )}

      {(role === "admin" || role === "pharmacist") && (
        <NavLink to="/pharmacy">
          <FaPills />
          {!collapsed && <span>Pharmacy</span>}
        </NavLink>
      )}

      {(role === "admin" || role === "lab") && (
        <NavLink to="/laboratory">
          <FaFlask />
          {!collapsed && <span>Laboratory</span>}
        </NavLink>
      )}

      {role === "admin" && (
        <NavLink to="/billing">
          <FaMoneyBillWave />
          {!collapsed && <span>Billing</span>}
        </NavLink>
      )}

      {/* Patient Menu */}
      {role === "patient" && (
        <NavLink to="/book-appointment">
          <FaPlusCircle />
          {!collapsed && <span>Book Appointment</span>}
        </NavLink>
      )}

      {role === "patient" && (
        <NavLink to="/patient-appointments">
          <FaClipboardList />
          {!collapsed && <span>My Appointments</span>}
        </NavLink>
      )}

      <NavLink to="/profile">
        <FaUserCircle />
        {!collapsed && <span>Profile</span>}
      </NavLink>
    </aside>
  );
}

export default Sidebar;