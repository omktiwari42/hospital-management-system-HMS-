import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

function Dashboard() {
  const [patients, setPatients] = useState(0);
  const [doctors, setDoctors] = useState(0);
  const [appointments, setAppointments] = useState(0);
  const [bills, setBills] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const patientsRes = await api.get("/patients");
      const doctorsRes = await api.get("/doctors");
      const appointmentsRes = await api.get("/appointments");
      const billsRes = await api.get("/bills");

      setPatients(patientsRes.data.length);
      setDoctors(doctorsRes.data.length);
      setAppointments(appointmentsRes.data.length);
      setBills(billsRes.data.length);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="page">
      <h1>Hospital Dashboard</h1>

      <div className="dashboard-grid">
        <Link
          to="/patients"
          className="card patients-card"
        >
          <h2>👨‍⚕️ Patients</h2>
          <p>{patients}</p>
        </Link>

        <Link
          to="/doctors"
          className="card doctors-card"
        >
          <h2>🩺 Doctors</h2>
          <p>{doctors}</p>
        </Link>

        <Link
          to="/appointments"
          className="card appointments-card"
        >
          <h2>📅 Appointments</h2>
          <p>{appointments}</p>
        </Link>

        <Link
          to="/billing"
          className="card bills-card"
        >
          <h2>💳 Bills</h2>
          <p>{bills}</p>
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;