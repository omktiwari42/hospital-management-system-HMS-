import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import "./styles/pro-toast.css";

import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";
import Notifications from "./pages/Notifications";

import MedicalReports from "./pages/MedicalReports";
import PatientMedicalHistory from "./pages/PatientMedicalHistory";
import PatientPrescriptions from "./pages/PatientPrescriptions";
import PatientBilling from "./pages/PatientBilling";
import PatientDashboard from "./pages/PatientDashboard";
import PatientAppointments from "./pages/PatientAppointments";
import PatientDoctors from "./pages/PatientDoctors";
import BookAppointment from "./pages/BookAppointment";

import DoctorDashboard from "./pages/DoctorDashboard";
import ReceptionDashboard from "./pages/ReceptionDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import LabDashboard from "./pages/LabDashboard";


function App() {
  return (
    <div className="layout">

      <div className="content">

        <Routes>

          {/* =========================
                        PUBLIC
                    ========================= */}

          <Route
            path="/"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />


          {/* =========================
                        ADMIN / DOCTOR
                    ========================= */}

          <Route
            path="/patient-medical-history"
            element={
              <ProtectedRoute>
                <RoleRoute
                  roles={[
                    "admin",
                    "doctor",
                  ]}
                >
                  <PatientMedicalHistory />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["admin"]}>
                  <Dashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/medical-reports"
            element={
              <ProtectedRoute>
                <RoleRoute
                  roles={[
                    "admin",
                    "doctor",
                  ]}
                >
                  <MedicalReports />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["admin"]}>
                  <Patients />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctors"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["admin"]}>
                  <Doctors />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/billing"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["admin"]}>
                  <Billing />
                </RoleRoute>
              </ProtectedRoute>
            }
          />


          {/* =========================
                        SHARED
                    ========================= */}

          <Route
            path="/appointments"
            element={
              <ProtectedRoute>
                <Appointments />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />


          {/* =========================
                        DOCTOR
                    ========================= */}

          <Route
            path="/doctor-dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["doctor"]}>
                  <DoctorDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />


          {/* =========================
                        RECEPTIONIST
                    ========================= */}

          <Route
            path="/reception-dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute
                  roles={[
                    "receptionist",
                  ]}
                >
                  <ReceptionDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />


          {/* =========================
                        PHARMACIST
                    ========================= */}

          <Route
            path="/pharmacist-dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute
                  roles={[
                    "pharmacist",
                  ]}
                >
                  <PharmacistDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />


          {/* =========================
                        LAB
                    ========================= */}

          <Route
            path="/lab-dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["lab"]}>
                  <LabDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />


          {/* =========================
                        PATIENT
                    ========================= */}

          <Route
            path="/patient-dashboard"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["patient"]}>
                  <PatientDashboard />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient-doctors"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["patient"]}>
                  <PatientDoctors />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient-prescriptions"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["patient"]}>
                  <PatientPrescriptions />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient-billing"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["patient"]}>
                  <PatientBilling />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/book-appointment"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["patient"]}>
                  <BookAppointment />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient-appointments"
            element={
              <ProtectedRoute>
                <RoleRoute roles={["patient"]}>
                  <PatientAppointments />
                </RoleRoute>
              </ProtectedRoute>
            }
          />

        </Routes>

      </div>


      {/* =========================
                TOAST
            ========================= */}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        theme="colored"
      />

    </div>
  );
}

export default App;