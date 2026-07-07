import { useEffect, useState } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";

export default function PatientAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadAppointments();
    }, []);
    async function cancelAppointment(id) {

        if (!window.confirm("Cancel this appointment?")) return;

        try {

            await api.put(`/patient/cancel-appointment/${id}`);

            alert("Appointment Cancelled");

            loadAppointments();

        } catch (err) {

            alert("Unable to cancel appointment.");

        }

    }

    async function loadAppointments() {
        setLoading(true);

        try {
            const res = await api.get("/patient/appointments");

            console.log(res.data);

            if (Array.isArray(res.data)) {
                setAppointments(res.data);
            } else {
                setAppointments(res.data.appointments || []);
            }

        } catch (err) {
            console.error(err);
            setAppointments([]);
        } finally {
            setLoading(false);
        }
    }
    function badge(status) {

        switch (status) {

            case "Pending":
                return "#f59e0b";

            case "Scheduled":
                return "#2563eb";

            case "Completed":
                return "#16a34a";

            case "Cancelled":
                return "#dc2626";

            default:
                return "#6b7280";
        }
    }

    return (
        <DashboardLayout>

            <div className="patient-appointments">

                <h1>My Appointments</h1>

                {loading ? (

                    <h3>Loading...</h3>

                ) : appointments.length === 0 ? (

                    <h3>No appointments found.</h3>

                ) : (

                    appointments.map((item) => (

                        <div
                            key={item.id}
                            className="appointment-card"
                        >

                            <h2>{item.doctor_name}</h2>

                            <p>
                                Department :
                                {" "}
                                {item.department}
                            </p>

                            <p>
                                Date :
                                {" "}
                                {item.appointment_date}
                            </p>

                            <p>
                                Time :
                                {" "}
                                {item.appointment_time}
                            </p>

                            <span
                                style={{
                                    background: badge(item.status),
                                    color: "#fff",
                                    padding: "6px 12px",
                                    borderRadius: "20px"
                                }}
                            >
                                {item.status}
                            </span>
                            <div className="appointment-actions">

                                {item.status !== "Cancelled" &&
                                    item.status !== "Completed" && (

                                        <button
                                            className="cancel-btn"
                                            onClick={() => cancelAppointment(item.id)}
                                        >
                                            ❌ Cancel Appointment
                                        </button>

                                    )}

                            </div>

                        </div>

                    ))

                )}

            </div>

        </DashboardLayout>
    );
}