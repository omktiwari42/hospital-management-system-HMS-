import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import PatientAppointmentsSkeleton from "../components/skeletons/PatientAppointmentsSkeleton";

export default function PatientAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const navigate = useNavigate();

    const totalAppointments = appointments.length;

    const upcomingAppointments = appointments.filter(
        (a) => a.status === "Pending" || a.status === "Confirmed"
    ).length;

    const completedAppointments = appointments.filter(
        (a) => a.status === "Completed"
    ).length;

    const cancelledAppointments = appointments.filter(
        (a) => a.status === "Cancelled"
    ).length;

    const filteredAppointments = appointments.filter((item) => {

        const matchesSearch =
            item.doctor_name?.toLowerCase().includes(search.toLowerCase()) ||
            item.department?.toLowerCase().includes(search.toLowerCase());

        const matchesFilter =
            filter === "All" || item.status === filter;

        return matchesSearch && matchesFilter;

    });

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
    function getAppointmentDay(date) {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const appointment = new Date(date);

        appointment.setHours(0, 0, 0, 0);

        const diff = Math.ceil(
            (appointment - today) /
            (1000 * 60 * 60 * 24)
        );

        if (diff === 0) return "Today";

        if (diff === 1) return "Tomorrow";

        if (diff > 1) return `${diff} Days Left`;

        return "Completed";
    }
    function formatAppointmentDate(date) {
        return new Date(date).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    }

    function formatAppointmentTime(time) {
        const [hour, minute] = time.split(":");

        return new Date(
            2000,
            0,
            1,
            Number(hour),
            Number(minute)
        ).toLocaleTimeString("en-IN", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
        });
    }
    function downloadCalendar(item) {

        const start = new Date(
            `${item.appointment_date}T${item.appointment_time}`
        );

        const end = new Date(start.getTime() + 30 * 60000);

        function formatICS(date) {
            return date
                .toISOString()
                .replace(/[-:]/g, "")
                .split(".")[0] + "Z";
        }

        const ics = `BEGIN:VCALENDAR
    VERSION:2.0
    BEGIN:VEVENT
    SUMMARY:Hospital Appointment
    DESCRIPTION:Appointment with Dr. ${item.doctor_name}
    LOCATION:Hospital
    DTSTART:${formatICS(start)}
    DTEND:${formatICS(end)}
    END:VEVENT
    END:VCALENDAR`;

        const blob = new Blob([ics], {
            type: "text/calendar;charset=utf-8",
        });

        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");

        link.href = url;

        link.download = `Appointment-${item.id}.ics`;

        link.click();

        URL.revokeObjectURL(url);
    }

    async function shareAppointment(item) {

        const text = `Hospital Appointment
    
    Doctor: ${item.doctor_name}
    
    Department: ${item.department}
    
    Date: ${formatAppointmentDate(item.appointment_date)}
    
    Time: ${formatAppointmentTime(item.appointment_time)}
    
    Status: ${item.status}`;

        if (navigator.share) {

            await navigator.share({
                title: "Hospital Appointment",
                text,
            });

        } else {

            navigator.clipboard.writeText(text);

            alert("Appointment copied to clipboard.");

        }

    }

    return (
        <DashboardLayout>

            <div className="patient-appointments">

                <div className="appointment-header">

                    <div>

                        <h1>📅 My Appointments</h1>

                        <p>
                            View and manage all your hospital appointments.
                        </p>

                    </div>

                    <input
                        className="appointment-search"
                        type="text"
                        placeholder="🔍 Search doctor or department..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                </div>

                <div className="appointment-summary">

                    <div className="summary-card">
                        <h4>Total</h4>
                        <h2>{totalAppointments}</h2>
                    </div>

                    <div className="summary-card pending">
                        <h4>Upcoming</h4>
                        <h2>{upcomingAppointments}</h2>
                    </div>

                    <div className="summary-card completed">
                        <h4>Completed</h4>
                        <h2>{completedAppointments}</h2>
                    </div>

                    <div className="summary-card cancelled">
                        <h4>Cancelled</h4>
                        <h2>{cancelledAppointments}</h2>
                    </div>

                </div>
                <div className="filter-bar">

                    <button
                        className={filter === "All" ? "active-filter" : ""}
                        onClick={() => setFilter("All")}
                    >
                        All
                    </button>

                    <button
                        className={filter === "Pending" ? "active-filter" : ""}
                        onClick={() => setFilter("Pending")}
                    >
                        Pending
                    </button>

                    <button
                        className={filter === "Confirmed" ? "active-filter" : ""}
                        onClick={() => setFilter("Confirmed")}
                    >
                        Confirmed
                    </button>

                    <button
                        className={filter === "Completed" ? "active-filter" : ""}
                        onClick={() => setFilter("Completed")}
                    >
                        Completed
                    </button>

                    <button
                        className={filter === "Cancelled" ? "active-filter" : ""}
                        onClick={() => setFilter("Cancelled")}
                    >
                        Cancelled
                    </button>

                </div>
                {loading ? (
                    <PatientAppointmentsSkeleton />
                ) : appointments.length === 0 ? (

                    <div className="empty-state">
                        <h1>📅</h1>
                        <h2>No Appointments Yet</h2>
                        <p>Book your first appointment to see it here.</p>
                    </div>

                ) : (

                    filteredAppointments.map((item) => (

                        <div
                            key={item.id}
                            className="appointment-card premium-card"
                        >

                            <div className="appointment-header">

                                <div className="doctor-section">

                                    <div className="doctor-avatar">
                                        👨‍⚕️
                                    </div>

                                    <div>

                                        <h2>Dr. {item.doctor_name}</h2>

                                        <p className="doctor-speciality">
                                            🏥 {item.department}
                                        </p>

                                        <small className="appointment-id">
                                            Appointment #{item.id}
                                        </small>

                                    </div>

                                </div>

                                <div className="appointment-right">

                                    <span
                                        className="status-chip"
                                        style={{
                                            background: badge(item.status)
                                        }}
                                    >
                                        {item.status}
                                    </span>

                                </div>

                            </div>
                            <div className="appointment-day">

                                ⏰ {getAppointmentDay(item.appointment_date)}

                            </div>

                            <div className="appointment-body">

                                <div className="info-card">

                                    <small>Appointment ID</small>

                                    <h4>

                                        #{item.id}

                                        <button
                                            className="copy-btn"
                                            onClick={() => {
                                                navigator.clipboard.writeText(item.id.toString());
                                                alert("Appointment ID copied.");
                                            }}
                                        >
                                            📋
                                        </button>

                                    </h4>

                                </div>

                                <div className="info-card">

                                    <small>Date</small>

                                    <h4>{formatAppointmentDate(item.appointment_date)}</h4>

                                </div>

                                <div className="info-card">

                                    <small>Time</small>

                                    <h4>{formatAppointmentTime(item.appointment_time)}</h4>

                                </div>
                                <div className="info-card">

                                    <small>Status</small>

                                    <h4>{item.status}</h4>

                                </div>

                                <div className="info-card">

                                    <small>Payment</small>

                                    <h4>

                                        <span
                                            className={
                                                item.payment_status === "Paid"
                                                    ? "payment-paid"
                                                    : item.payment_status === "Failed"
                                                        ? "payment-failed"
                                                        : "payment-pending"
                                            }
                                        >
                                            {item.payment_status || "Pending"}
                                        </span>

                                    </h4>

                                </div>

                                <div className="info-card">

                                    <small>Transaction</small>

                                    <h4>

                                        {item.transaction_id || "N/A"}

                                    </h4>

                                </div>
                                <div className="reason-card">

                                    <small>Reason for Visit</small>

                                    <p>
                                        {item.reason || "No reason provided"}
                                    </p>

                                </div>

                            </div>

                            <div className="appointment-actions">

                                <button
                                    className="view-btn"
                                    onClick={() => {
                                        setSelectedAppointment(item);
                                        setShowDetails(true);
                                    }}
                                >
                                    👁 View Details
                                </button>

                                {item.payment_status === "Paid" && (

                                    <button

                                        className="invoice-btn"

                                        onClick={() => {

                                            alert("Invoice Module Coming Next");

                                        }}

                                    >

                                        📄 Invoice

                                    </button>

                                )}

                                {item.status === "Cancelled" && (

                                    <button

                                        className="rebook-btn"

                                        onClick={() =>

                                            navigate("/book-appointment")

                                        }

                                    >

                                        🔄 Rebook

                                    </button>

                                )}
                                <button
                                    className="calendar-btn"
                                    onClick={() => downloadCalendar(item)}
                                >
                                    📅 Calendar
                                </button>

                                <button
                                    className="share-btn"
                                    onClick={() => shareAppointment(item)}
                                >
                                    📤 Share
                                </button>

                                {item.status !== "Cancelled" &&
                                    item.status !== "Completed" && (

                                        <button

                                            className="cancel-btn"

                                            onClick={() =>
                                                cancelAppointment(item.id)
                                            }

                                        >

                                            ❌ Cancel

                                        </button>

                                    )}

                            </div>

                        </div>

                    ))

                )}

            </div>
            {showDetails && selectedAppointment && (

                <div className="appointment-modal-overlay">

                    <div className="appointment-modal">

                        <button
                            className="close-modal"
                            onClick={() => setShowDetails(false)}
                        >
                            ✖
                        </button>

                        <h2>Appointment Details</h2>

                        <div className="modal-grid">

                            <div>
                                <strong>Doctor</strong>
                                <p>{selectedAppointment.doctor_name}</p>
                            </div>

                            <div>
                                <strong>Department</strong>
                                <p>{selectedAppointment.department}</p>
                            </div>

                            <div>
                                <strong>Date</strong>
                                <p>{selectedAppointment.appointment_date}</p>
                            </div>

                            <div>
                                <strong>Time</strong>
                                <p>{selectedAppointment.appointment_time}</p>
                            </div>

                            <div>
                                <strong>Status</strong>
                                <p>{selectedAppointment.status}</p>
                            </div>

                            <div>
                                <strong>Payment</strong>
                                <p>{selectedAppointment.payment_status || "Pending"}</p>
                            </div>

                            <div>
                                <strong>Transaction</strong>
                                <p>{selectedAppointment.transaction_id || "N/A"}</p>
                            </div>

                            <div>
                                <strong>Appointment ID</strong>
                                <p>#{selectedAppointment.id}</p>
                            </div>

                        </div>

                        <button
                            className="close-btn"
                            onClick={() => setShowDetails(false)}
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}

        </DashboardLayout>
    );
}