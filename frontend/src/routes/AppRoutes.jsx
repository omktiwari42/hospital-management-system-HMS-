import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Patients from "../pages/Patients";
import Doctors from "../pages/Doctors";
import Appointments from "../pages/Appointments";
import Billing from "../pages/Billing";
import Profile from "../pages/Profile";
import Prescriptions from "../pages/Prescriptions";
import Payment from "../pages/Payment";
import DoctorDashboard from "./pages/DoctorDashboard";
import ReceptionDashboard from "./pages/ReceptionDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import PharmacistDashboard from "./pages/PharmacistDashboard";
import LabDashboard from "./pages/LabDashboard";

function AppRoutes() {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/patients" element={<Patients />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/prescriptions" element={<Prescriptions />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />

            <Route
                path="/reception-dashboard"
                element={<ReceptionDashboard />}
            />

            <Route
                path="/pharmacist-dashboard"
                element={<PharmacistDashboard />}
            />

            <Route
                path="/lab-dashboard"
                element={<LabDashboard />}
            />

            <Route
                path="/patient-dashboard"
                element={<PatientDashboard />}
            />
        </Routes>
    );
}

export default AppRoutes;