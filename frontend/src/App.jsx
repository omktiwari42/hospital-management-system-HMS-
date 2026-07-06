import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

import DoctorDashboard from "./pages/DoctorDashboard";
import ReceptionDashboard from "./pages/ReceptionDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import LabDashboard from "./pages/LabDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import BookAppointment from "./pages/BookAppointment";
import PatientAppointments from "./pages/PatientAppointments"; +

  function App() {
    return (
      <div className="layout">
        <div className="content">
          <Routes>
            {/* Public Routes */}
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

            {/* Admin */}
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

            {/* Shared */}
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

            {/* Doctor */}
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

            {/* Receptionist */}
            <Route
              path="/reception-dashboard"
              element={
                <ProtectedRoute>
                  <RoleRoute roles={["receptionist"]}>
                    <ReceptionDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Pharmacist */}
            <Route
              path="/pharmacist-dashboard"
              element={
                <ProtectedRoute>
                  <RoleRoute roles={["pharmacist"]}>
                    <PharmacistDashboard />
                  </RoleRoute>
                </ProtectedRoute>
              }
            />

            {/* Lab */}
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

            {/* Patient */}
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

            {/* Patient Book Appointment */}
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