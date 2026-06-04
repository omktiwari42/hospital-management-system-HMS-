import { useEffect, useState } from "react";
import api from "../services/api";
import axios from "axios";
import { Link } from "react-router-dom";
import AppointmentChart from "../components/AppointmentChart";
import RevenueChart from "../components/RevenueChart";

function Dashboard() {
  const [patients, setPatients] =
    useState(0);

  const [doctors, setDoctors] =
    useState(0);

  const [appointmentsCount, setAppointmentsCount] =
    useState(0);

  const [bills, setBills] =
    useState(0);

  const [recentAppointments, setRecentAppointments] =
    useState([]);

  const [recentPatients, setRecentPatients] =
    useState([]);

  useEffect(() => {
    fetchData();
    getRecentAppointments();
    getRecentPatients();
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
        localStorage.getItem(
          "token"
        );

      const response =
        await axios.get(
          "http://localhost:5000/api/recent-appointments",
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
      const response =
        await api.get(
          "/recent-patients"
        );

      setRecentPatients(
        response.data
      );
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="page">
      <h1>🏥 Hospital Management System</h1>

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
          <p>{appointmentsCount}</p>
        </Link>

        <Link
          to="/billing"
          className="card bills-card"
        >
          <h2>💳 Bills</h2>
          <p>{bills}</p>
        </Link>
      </div>

      <br />

      <AppointmentChart />
      <br />
      <RevenueChart>
        <br />
      </RevenueChart>

      <div className="card">

        <h2>
          📅 Recent Appointments
        </h2>

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
            {recentAppointments.map(
              (appointment) => (
                <tr
                  key={
                    appointment.id
                  }
                >
                  <td>
                    {
                      appointment.id
                    }
                  </td>

                  <td>
                    {
                      appointment.patient_name
                    }
                  </td>

                  <td>
                    {
                      appointment.doctor_name
                    }
                  </td>

                  <td>
                    {appointment.appointment_date?.split(
                      "T"
                    )[0]}
                  </td>

                  <td>
                    {
                      appointment.status
                    }
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      <br />

      <div className="card">
        <h2>
          🧑 Recent Patients
        </h2>

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
            {recentPatients.map(
              (patient) => (
                <tr
                  key={patient.id}
                >
                  <td>
                    {patient.id}
                  </td>

                  <td>
                    {patient.name}
                  </td>

                  <td>
                    {patient.phone}
                  </td>

                  <td>
                    {
                      patient.blood_group
                    }
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Dashboard;