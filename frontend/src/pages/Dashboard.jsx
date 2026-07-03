import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { useEffect, useState } from "react";
import api from "../services/api";
import axios from "axios";
import { Link } from "react-router-dom";
import AppointmentChart from "../components/AppointmentChart";
import RevenueChart from "../components/RevenueChart";
import { useNavigate } from "react-router-dom";
import { FaMoon, FaSun } from "react-icons/fa";
function Dashboard() {
  const [patients, setPatients] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState(0);
  const [loading, setLoading] = useState(true);
  const [appointmentsCount, setAppointmentsCount] = useState(0);

  const [bills, setBills] = useState(0);

  const [recentAppointments, setRecentAppointments] = useState([]);

  const [recentPatients, setRecentPatients] = useState([]);

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);

      await Promise.all([
        fetchData(),
        getRecentAppointments(),
        getRecentPatients(),
      ]);

      setLoading(false);
    }

    loadDashboard();
  }, []);

  async function fetchData() {
    try {

      const patientsRes =
        await api.get("/patients");

      const doctorsRes =
        await api.get("/doctors");

      const appointmentsRes =
        await api.get("/appointments");

      const billsRes =
        await api.get("/bills");

      setPatients(
        patientsRes.data.length
      );

      setDoctors(
        doctorsRes.data.length
      );

      setAppointmentsCount(
        appointmentsRes.data.length
      );

      setBills(
        billsRes.data.length
      );
    } catch (error) {
      console.log(error);
    }

  }

  async function getRecentAppointments() {
    try {
      const token =
        sessionStorage.getItem(
          "token"
        );

      const response = await axios.get(
        "https://hospital-backend-8pek.onrender.com/api/recent-appointments",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setRecentAppointments(
        response.data
      );
    } catch (error) {
      console.log(error);
    }
  }

  async function getRecentPatients() {
    try {
      const response = await api.get("/recent-patients");
      setRecentPatients(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  const toggleDarkMode = () => {
    document.body.classList.toggle("dark-mode");
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    sessionStorage.removeItem("token");
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="page">

      <div className="dashboard-actions">
        <button
          className="dark-btn"
          onClick={toggleDarkMode}
        >
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>

        <button
          className="logout-btn"
          onClick={handleLogout}
        >
          🚪 Logout
        </button>
      </div>

      <h1>🏥 Hospital Management System</h1>

      <div className="dashboard-grid">
        <Link
          to="/patients"
          className="card patients-card"
        >
          <h2>👨‍⚕️ Patients</h2>
          <p>
            {loading ? <Skeleton width={60} height={35} /> : patients}
          </p>
        </Link>

        <Link
          to="/doctors"
          className="card doctors-card"
        >
          <h2>🩺 Doctors</h2>
          <p>
            {loading ? <Skeleton width={60} height={35} /> : doctors}
          </p>
        </Link>

        <Link
          to="/appointments"
          className="card appointments-card"
        >
          <h2>📅 Appointments</h2>
          <p>
            {loading ? <Skeleton width={60} height={35} /> : appointmentsCount}
          </p>
        </Link>

        <Link
          to="/billing"
          className="card bills-card"
        >
          <h2>💳
            Bills</h2>
          <p>
            {loading ? <Skeleton width={60} height={35} /> : bills}
          </p>
        </Link>
      </div>

      <br />

      {loading ? (
        <Skeleton height={300} />
      ) : (
        <AppointmentChart />
      )}

      <br />

      {loading ? (
        <Skeleton height={300} />
      ) : (
        <RevenueChart />
      )}

      <div className="card">

        <h2>
          📅 Recent Appointments
        </h2>

        <div className="table-container">
          <table className="patient-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td><Skeleton /></td>
                    <td><Skeleton /></td>
                    <td><Skeleton /></td>
                    <td><Skeleton /></td>
                    <td><Skeleton /></td>
                  </tr>
                ))
              ) : (
                recentAppointments.map((appointment) => (
                  <tr key={appointment.id}>
                    <td>{appointment.id}</td>
                    <td>{appointment.patient_name}</td>
                    <td>{appointment.doctor_name}</td>
                    <td>{appointment.appointment_date?.split("T")[0]}</td>
                    <td>{appointment.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <br />

      <div className="card">
        <h2>
          🧑 Recent Patients
        </h2>

        <div className="table-container">
          <table className="patient-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Blood Group</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                [...Array(5)].map((_, index) => (
                  <tr key={index}>
                    <td><Skeleton /></td>
                    <td><Skeleton /></td>
                    <td><Skeleton /></td>
                    <td><Skeleton /></td>
                  </tr>
                ))
              ) : (
                recentPatients.map((patient) => (
                  <tr key={patient.id}>
                    <td>{patient.id}</td>
                    <td>{patient.name}</td>
                    <td>{patient.phone}</td>
                    <td>{patient.blood_group}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;