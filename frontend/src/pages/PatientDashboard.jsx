import { useEffect, useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";

export default function PatientDashboard() {
    const [patient, setPatient] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [bills, setBills] = useState([]);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const token = sessionStorage.getItem("token");

                const response = await axios.get(
                    "http://localhost:5000/api/patient-dashboard",
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                setPatient(response.data.patient);
                setAppointments(response.data.appointments);
                setBills(response.data.bills);
            } catch (error) {
                console.error(error);
            }
        };

        fetchDashboard();
    }, []);

    return (
        <DashboardLayout>
            <h1>🧑 Patient Dashboard</h1>

            {patient && (
                <div className="card">
                    <h2>My Profile</h2>
                    <p><strong>Name:</strong> {patient.name}</p>
                    <p><strong>Phone:</strong> {patient.phone}</p>
                    <p><strong>Gender:</strong> {patient.gender}</p>
                    <p><strong>Age:</strong> {patient.age}</p>
                </div>
            )}

            <div className="card">
                <h2>My Appointments</h2>

                {appointments.length === 0 ? (
                    <p>No appointments found.</p>
                ) : (
                    appointments.map((appointment) => (
                        <div key={appointment.id}>
                            <hr />
                            <p><strong>Doctor:</strong> {appointment.doctor_name}</p>
                            <p><strong>Department:</strong> {appointment.department}</p>
                            <p><strong>Date:</strong> {appointment.appointment_date}</p>
                            <p><strong>Time:</strong> {appointment.appointment_time}</p>
                            <p><strong>Status:</strong> {appointment.status}</p>
                        </div>
                    ))
                )}
            </div>

            <div className="card">
                <h2>My Bills</h2>

                {bills.length === 0 ? (
                    <p>No bills found.</p>
                ) : (
                    bills.map((bill) => (
                        <div key={bill.id}>
                            <hr />
                            <p><strong>Bill No:</strong> {bill.id}</p>
                            <p><strong>Amount:</strong> ₹{bill.amount}</p>
                            <p><strong>Status:</strong> {bill.status}</p>
                        </div>
                    ))
                )}
            </div>
        </DashboardLayout>
    );
}