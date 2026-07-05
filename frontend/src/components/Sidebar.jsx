import { useState } from "react";
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
} from "react-icons/fa";

function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  const role =
    sessionStorage.getItem("role") || "";

  return (
    <aside
      className={
        collapsed
          ? "sidebar collapsed"
          : "sidebar"
      }
    >
      <button
        className="menu-btn"
        onClick={() =>
          setCollapsed(!collapsed)
        }
      >
        <FaBars />
      </button>

      {!collapsed && (
        <h2 className="logo">
          🏥 HMS
        </h2>
      )}

      <NavLink to="/dashboard">
        <FaHome />
        {!collapsed && <span>Dashboard</span>}
      </NavLink>

      {(role === "admin" ||
        role === "reception") && (
          <NavLink to="/patients">
            <FaUserInjured />
            {!collapsed && <span>Patients</span>}
          </NavLink>
        )}

      {(role === "admin" ||
        role === "reception") && (
          <NavLink to="/appointments">
            <FaCalendarCheck />
            {!collapsed && (
              <span>Appointments</span>
            )}
          </NavLink>
        )}

      {(role === "admin" ||
        role === "doctor") && (
          <NavLink to="/doctors">
            <FaUserMd />
            {!collapsed && <span>Doctors</span>}
          </NavLink>
        )}

      {(role === "admin" ||
        role === "doctor") && (
          <NavLink to="/prescriptions">
            <FaPills />
            {!collapsed && (
              <span>Prescriptions</span>
            )}
          </NavLink>
        )}

      {(role === "admin" ||
        role === "pharmacist") && (
          <NavLink to="/pharmacy">
            <FaPills />
            {!collapsed && <span>Pharmacy</span>}
          </NavLink>
        )}

      {(role === "admin" ||
        role === "lab") && (
          <NavLink to="/laboratory">
            <FaFlask />
            {!collapsed && (
              <span>Laboratory</span>
            )}
          </NavLink>
        )}

      {role === "admin" && (
        <NavLink to="/billing">
          <FaMoneyBillWave />
          {!collapsed && <span>Billing</span>}
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