import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";

export default function PatientDashboard() {

    const navigate = useNavigate();

    /* ==========================
       LOADING
    ========================== */

    const [loading, setLoading] = useState(true);

    /* ==========================
       PATIENT DATA
    ========================== */

    const [patient, setPatient] = useState(null);

    const [summary, setSummary] = useState({
        appointments: 0,
        completed: 0,
        pending: 0,
        bills: 0,
        prescriptions: 0,
        reports: 0
    });

    const [appointments, setAppointments] = useState([]);
    const [bills, setBills] = useState([]);

    const [nextAppointment, setNextAppointment] = useState(null);

    const [recentActivities, setRecentActivities] = useState([]);

    const [medicineReminders, setMedicineReminders] = useState([]);

    const [healthTips, setHealthTips] = useState([]);

    const [countdown, setCountdown] = useState("");

    /* ==========================
       GREETING
    ========================== */

    const greeting = useMemo(() => {

        const hour = new Date().getHours();

        if (hour < 12) return "Good Morning ☀️";

        if (hour < 17) return "Good Afternoon 🌤️";

        return "Good Evening 🌙";

    }, []);

    const today = useMemo(() => {

        return new Date().toLocaleDateString("en-IN", {

            weekday: "long",

            day: "numeric",

            month: "long",

            year: "numeric"

        });

    }, []);

    /* ==========================
       HEALTH SCORE
    ========================== */

    const healthScore = useMemo(() => {

        let score = 100;

        score -= summary.pending * 4;

        if (score < 65) score = 65;

        return score;

    }, [summary]);

    const patientLevel = useMemo(() => {

        if (healthScore >= 95) return "Excellent";

        if (healthScore >= 85) return "Very Good";

        if (healthScore >= 75) return "Good";

        return "Needs Attention";

    }, [healthScore]);

    const completionRate = useMemo(() => {

        if (summary.appointments === 0) return 0;

        return Math.round(

            (summary.completed / summary.appointments) * 100

        );

    }, [summary]);

    /* ==========================
       QUICK ACTIONS
    ========================== */

    const quickActions = [

        {
            icon: "📅",
            title: "Book Appointment",
            path: "/book-appointment"
        },

        {
            icon: "👨‍⚕️",
            title: "Doctors",
            path: "/patient-doctors"
        },

        {
            icon: "💊",
            title: "Prescriptions",
            path: "/patient-prescriptions"
        },

        {
            icon: "🧾",
            title: "Bills",
            path: "/patient-billing"
        },

        {
            icon: "📋",
            title: "Appointments",
            path: "/patient-appointments"
        },

        {
            icon: "👤",
            title: "Profile",
            path: "/profile"
        }

    ];

    /* ==========================
       LOAD DASHBOARD
    ========================== */

    async function loadDashboard() {

        setLoading(true);

        try {

            const [

                dashboardRes,

                prescriptionRes

            ] = await Promise.all([

                api.get("/patient-dashboard"),

                api.get("/patient/prescriptions")

            ]);

            const data = dashboardRes.data;

            const appointmentList = data.appointments || [];

            const billList = data.bills || [];

            setPatient(data.patient);

            setAppointments(appointmentList);

            setBills(billList);

            setSummary({

                appointments: appointmentList.length,

                completed: appointmentList.filter(
                    a => a.status === "Completed"
                ).length,

                pending: appointmentList.filter(
                    a =>
                        a.status === "Pending" ||
                        a.status === "Confirmed"
                ).length,

                bills: billList.length,

                prescriptions: prescriptionRes.data.length || 0,

                reports: 0

            });

            const upcoming = appointmentList

                .filter(a =>
                    a.status !== "Cancelled" &&
                    a.status !== "Completed"
                )

                .sort(

                    (a, b) =>

                        new Date(a.appointment_date) -

                        new Date(b.appointment_date)

                );

            setNextAppointment(upcoming[0] || null);

            setRecentActivities(

                appointmentList.slice(0, 6)

            );

            setMedicineReminders([

                {

                    medicine: "Vitamin D",

                    time: "09:00 AM"

                },

                {

                    medicine: "Calcium",

                    time: "09:00 PM"

                }

            ]);

            setHealthTips([

                "💧 Drink 2–3 litres of water daily.",

                "🥗 Eat fresh fruits and vegetables.",

                "🚶 Walk at least 30 minutes every day.",

                "😴 Sleep for 7–8 hours.",

                "❤️ Regular health checkups keep you healthy."

            ]);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadDashboard();

    }, []);

    /* ==========================
       APPOINTMENT COUNTDOWN
    ========================== */

    useEffect(() => {

        if (!nextAppointment) return;

        function updateCountdown() {

            const target = new Date(

                `${nextAppointment.appointment_date}T${nextAppointment.appointment_time}`

            );

            const diff = target - new Date();

            if (diff <= 0) {

                setCountdown("Appointment Time");

                return;

            }

            const days = Math.floor(diff / 86400000);

            const hours = Math.floor((diff % 86400000) / 3600000);

            const mins = Math.floor((diff % 3600000) / 60000);

            setCountdown(`${days}d ${hours}h ${mins}m`);

        }

        updateCountdown();

        const timer = setInterval(updateCountdown, 60000);

        return () => clearInterval(timer);

    }, [nextAppointment]);

    // Part 2 starts here with:
    // return (
    return (
        <DashboardLayout>

            <div className="patient-dashboard">

                {/* =========================
                        HEADER
                    ========================= */}

                <div className="patient-dashboard-header">

                    <div>

                        <h1>
                            {greeting},
                            <span className="patient-name">
                                {" "}
                                {patient?.name || "Patient"}
                            </span>
                        </h1>

                        <p>{today}</p>

                    </div>

                    <button
                        className="primary-btn"
                        onClick={() => navigate("/book-appointment")}
                    >
                        + Book Appointment
                    </button>

                </div>

                {/* =========================
                        HEALTH SCORE
                    ========================= */}

                <div className="health-score-card">

                    <div>

                        <small>Health Score</small>

                        <h2>{healthScore}%</h2>

                        <p>{patientLevel}</p>

                    </div>

                    <div className="health-circle">

                        <svg width="120" height="120">

                            <circle
                                cx="60"
                                cy="60"
                                r="48"
                                stroke="#e5e7eb"
                                strokeWidth="10"
                                fill="none"
                            />

                            <circle
                                cx="60"
                                cy="60"
                                r="48"
                                stroke="#2563eb"
                                strokeWidth="10"
                                fill="none"
                                strokeLinecap="round"
                                strokeDasharray="301"
                                strokeDashoffset={
                                    301 - (301 * healthScore) / 100
                                }
                                transform="rotate(-90 60 60)"
                            />

                        </svg>

                        <div className="health-percent">

                            {healthScore}%

                        </div>

                    </div>

                </div>

                {/* =========================
                        SUMMARY CARDS
                    ========================= */}

                <div className="dashboard-summary-grid">

                    {[
                        {
                            title: "Appointments",
                            value: summary.appointments,
                            icon: "📅",
                            color: "#2563eb"
                        },

                        {
                            title: "Completed",
                            value: summary.completed,
                            icon: "✅",
                            color: "#16a34a"
                        },

                        {
                            title: "Pending",
                            value: summary.pending,
                            icon: "⏳",
                            color: "#f59e0b"
                        },

                        {
                            title: "Bills",
                            value: summary.bills,
                            icon: "🧾",
                            color: "#dc2626"
                        },

                        {
                            title: "Prescriptions",
                            value: summary.prescriptions,
                            icon: "💊",
                            color: "#8b5cf6"
                        },

                        {
                            title: "Reports",
                            value: summary.reports,
                            icon: "📄",
                            color: "#0ea5e9"
                        }

                    ].map((card) => (

                        <div
                            key={card.title}
                            className="dashboard-card"
                        >

                            <div
                                className="dashboard-card-icon"
                                style={{
                                    background: card.color
                                }}
                            >
                                {card.icon}
                            </div>

                            <div>

                                <small>{card.title}</small>

                                <h2>{card.value}</h2>

                            </div>

                        </div>

                    ))}

                </div>

                {/* =========================
                        NEXT APPOINTMENT
                    ========================= */}

                {nextAppointment && (

                    <div className="next-appointment-card">

                        <div>

                            <h2>

                                Upcoming Appointment

                            </h2>

                            <h3>

                                Dr. {nextAppointment.doctor_name}

                            </h3>

                            <p>

                                {nextAppointment.department}

                            </p>

                            <p>

                                {nextAppointment.appointment_date}

                                {" • "}

                                {nextAppointment.appointment_time}

                            </p>

                        </div>

                        <div className="appointment-countdown">

                            <small>Starts In</small>

                            <h1>{countdown}</h1>

                        </div>

                    </div>

                )}

                {/* =========================
                        QUICK ACTIONS
                    ========================= */}

                <h2 className="section-title">

                    Quick Actions

                </h2>

                <div className="quick-action-grid">

                    {quickActions.map((item) => (

                        <div

                            key={item.title}

                            className="quick-action-card"

                            onClick={() => navigate(item.path)}

                        >

                            <div className="quick-icon">

                                {item.icon}

                            </div>

                            <h3>

                                {item.title}

                            </h3>

                        </div>

                    ))}

                </div>
                {/* =========================
                RECENT ACTIVITY
            ========================= */}

                <div className="dashboard-two-column">

                    <div className="dashboard-panel">

                        <div className="panel-header">
                            <h2>📋 Recent Activity</h2>
                        </div>

                        {recentActivities.length === 0 ? (

                            <div className="empty-panel">
                                No recent activities found.
                            </div>

                        ) : (

                            recentActivities.map((item, index) => (

                                <div
                                    key={index}
                                    className="activity-item"
                                >

                                    <div className="activity-dot"></div>

                                    <div className="activity-content">

                                        <h4>
                                            {item.doctor_name
                                                ? `Appointment with Dr. ${item.doctor_name}`
                                                : item.title}
                                        </h4>

                                        <small>
                                            {item.appointment_date || item.date}
                                        </small>

                                    </div>

                                    <span
                                        className="status-chip"
                                        style={{
                                            background:
                                                item.status === "Completed"
                                                    ? "#16a34a"
                                                    : item.status === "Cancelled"
                                                        ? "#dc2626"
                                                        : "#2563eb"
                                        }}
                                    >
                                        {item.status}
                                    </span>

                                </div>

                            ))

                        )}

                    </div>

                    <div className="dashboard-panel">

                        <div className="panel-header">
                            <h2>💊 Medicine Reminders</h2>
                        </div>

                        {medicineReminders.map((medicine, index) => (

                            <div
                                key={index}
                                className="medicine-card"
                            >

                                <div>

                                    <h4>{medicine.medicine}</h4>

                                    <small>
                                        Take on time
                                    </small>

                                </div>

                                <div className="medicine-time">
                                    {medicine.time}
                                </div>

                            </div>

                        ))}

                    </div>

                </div>

                {/* =========================
                HEALTH TIPS
            ========================= */}

                <div className="dashboard-panel">

                    <div className="panel-header">
                        <h2>❤️ Health Tips</h2>
                    </div>

                    <div className="tips-grid">

                        {healthTips.map((tip, index) => (

                            <div
                                key={index}
                                className="tip-card"
                            >
                                {tip}
                            </div>

                        ))}

                    </div>

                </div>

                {/* =========================
                APPOINTMENT PROGRESS
            ========================= */}

                <div className="dashboard-panel">

                    <div className="panel-header">
                        <h2>📈 Appointment Completion</h2>
                    </div>

                    <div className="progress-wrapper">

                        <div className="progress-bar">

                            <div
                                className="progress-fill"
                                style={{
                                    width: `${completionRate}%`
                                }}
                            ></div>

                        </div>

                        <h3>
                            {completionRate}% Completed
                        </h3>

                    </div>

                </div>



                {/* =========================
                FOOTER
            ========================= */}

                <div className="dashboard-footer">

                    <p>
                        © 2026 Hospital Management System
                    </p>

                    <small>
                        Stay Healthy • Stay Safe ❤️
                    </small>

                </div>

            </div>

        </DashboardLayout>

    );

}