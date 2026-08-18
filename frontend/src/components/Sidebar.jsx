import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";

import {
  FaBars,
  FaHome,
  FaUserInjured,
  FaUserMd,
  FaCalendarCheck,
  FaMoneyBillWave,
  FaPills,
  FaUserCircle,
  FaPlusCircle,
  FaClipboardList,
  FaNotesMedical,
  FaFileMedical,
  FaCreditCard,
  FaBell,
  FaChevronRight,
} from "react-icons/fa";

function Sidebar() {
  /* =====================================================
     SIDEBAR STATE
  ===================================================== */

  const [collapsed, setCollapsed] =
    useState(true);

  const [role, setRole] = useState(
    sessionStorage.getItem("role") || ""
  );


  /* =====================================================
     ROLE SYNC
  ===================================================== */

  useEffect(() => {

    function syncRole() {
      setRole(
        sessionStorage.getItem("role") || ""
      );
    }

    window.addEventListener(
      "storage",
      syncRole
    );

    window.addEventListener(
      "userUpdated",
      syncRole
    );

    return () => {

      window.removeEventListener(
        "storage",
        syncRole
      );

      window.removeEventListener(
        "userUpdated",
        syncRole
      );
    };

  }, []);


  /* =====================================================
     TOGGLE
     NO AUTO CLOSE
  ===================================================== */

  function toggleSidebar() {
    setCollapsed(
      (previous) => !previous
    );
  }


  /* =====================================================
     ROLE
  ===================================================== */

  const currentRole =
    String(role || "")
      .trim()
      .toLowerCase();


  /* =====================================================
     SIDEBAR LINK
  ===================================================== */

  function SidebarLink({
    to,
    icon,
    label,
    end = false,
  }) {

    return (
      <NavLink
        to={to}
        end={end}
        title={label}
        className={({ isActive }) =>
          isActive
            ? "sidebar-link active"
            : "sidebar-link"
        }
      >

        <span className="sidebar-link-icon">
          {icon}
        </span>


        {!collapsed && (
          <>
            <span className="sidebar-link-text">
              {label}
            </span>

            <FaChevronRight
              className="sidebar-link-arrow"
            />
          </>
        )}

      </NavLink>
    );
  }


  /* =====================================================
     SIDEBAR
  ===================================================== */

  return (

    <aside
      className={
        collapsed
          ? "sidebar collapsed"
          : "sidebar expanded"
      }
    >

      {/* =================================================
                HEADER
            ================================================= */}

      <div className="sidebar-header">

        <button
          type="button"
          className="menu-btn"
          onClick={toggleSidebar}
          aria-label={
            collapsed
              ? "Open sidebar"
              : "Close sidebar"
          }
          title={
            collapsed
              ? "Open menu"
              : "Close menu"
          }
        >
          <FaBars />
        </button>

      </div>


      {/* =================================================
                ROLE
            ================================================= */}

      {!collapsed && (
        <div className="sidebar-role">

          <span className="sidebar-role-dot"></span>

          <span>
            {currentRole
              ? currentRole
                .charAt(0)
                .toUpperCase() +
              currentRole.slice(1)
              : "User"}
          </span>

        </div>
      )}


      {/* =================================================
                NAVIGATION
            ================================================= */}

      <nav className="sidebar-nav">


        {/* =================================================
                    ADMIN
                ================================================= */}

        {currentRole === "admin" && (
          <>

            <SidebarLink
              to="/dashboard"
              icon={<FaHome />}
              label="Dashboard"
              end
            />

            <SidebarLink
              to="/patients"
              icon={<FaUserInjured />}
              label="Patients"
            />

            <SidebarLink
              to="/doctors"
              icon={<FaUserMd />}
              label="Doctors"
            />

            <SidebarLink
              to="/appointments"
              icon={<FaCalendarCheck />}
              label="Appointments"
            />

            <SidebarLink
              to="/billing"
              icon={<FaMoneyBillWave />}
              label="Billing"
            />

            <SidebarLink
              to="/medical-reports"
              icon={<FaFileMedical />}
              label="Medical Reports"
            />

            <SidebarLink
              to="/patient-medical-history"
              icon={<FaNotesMedical />}
              label="Medical History"
            />

          </>
        )}


        {/* =================================================
                    DOCTOR
                ================================================= */}

        {currentRole === "doctor" && (
          <>

            <SidebarLink
              to="/doctor-dashboard"
              icon={<FaHome />}
              label="Dashboard"
              end
            />

            <SidebarLink
              to="/appointments"
              icon={<FaCalendarCheck />}
              label="Appointments"
            />

            <SidebarLink
              to="/patient-medical-history"
              icon={<FaNotesMedical />}
              label="Medical History"
            />

            <SidebarLink
              to="/medical-reports"
              icon={<FaFileMedical />}
              label="Medical Reports"
            />

          </>
        )}


        {/* =================================================
                    RECEPTIONIST
                ================================================= */}

        {currentRole === "receptionist" && (
          <>

            <SidebarLink
              to="/reception-dashboard"
              icon={<FaHome />}
              label="Dashboard"
              end
            />

            <SidebarLink
              to="/patients"
              icon={<FaUserInjured />}
              label="Patients"
            />

            <SidebarLink
              to="/appointments"
              icon={<FaCalendarCheck />}
              label="Appointments"
            />

          </>
        )}


        {/* =================================================
                    PHARMACIST
                ================================================= */}

        {currentRole === "pharmacist" && (
          <>

            <SidebarLink
              to="/pharmacist-dashboard"
              icon={<FaHome />}
              label="Dashboard"
              end
            />

            <SidebarLink
              to="/appointments"
              icon={<FaCalendarCheck />}
              label="Appointments"
            />

            <SidebarLink
              to="/payment"
              icon={<FaCreditCard />}
              label="Payments"
            />

          </>
        )}


        {/* =================================================
                    LAB
                ================================================= */}

        {currentRole === "lab" && (
          <>

            <SidebarLink
              to="/lab-dashboard"
              icon={<FaHome />}
              label="Dashboard"
              end
            />

            <SidebarLink
              to="/medical-reports"
              icon={<FaFileMedical />}
              label="Medical Reports"
            />

          </>
        )}


        {/* =================================================
                    PATIENT
                ================================================= */}

        {currentRole === "patient" && (
          <>

            <SidebarLink
              to="/patient-dashboard"
              icon={<FaHome />}
              label="Dashboard"
              end
            />

            <SidebarLink
              to="/patient-doctors"
              icon={<FaUserMd />}
              label="Find a Doctor"
            />

            <SidebarLink
              to="/book-appointment"
              icon={<FaPlusCircle />}
              label="Book Appointment"
            />

            <SidebarLink
              to="/patient-appointments"
              icon={<FaClipboardList />}
              label="My Appointments"
            />

            <SidebarLink
              to="/patient-prescriptions"
              icon={<FaPills />}
              label="Prescriptions"
            />

            <SidebarLink
              to="/patient-billing"
              icon={<FaMoneyBillWave />}
              label="Billing"
            />

          </>
        )}


        {/* =================================================
                    SHARED
                ================================================= */}

        <div className="sidebar-divider"></div>

        <SidebarLink
          to="/notifications"
          icon={<FaBell />}
          label="Notifications"
        />

        <SidebarLink
          to="/profile"
          icon={<FaUserCircle />}
          label="Profile"
        />

      </nav>

    </aside>
  );
}

export default Sidebar;