import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaArrowRight,
    FaCalendarCheck,
    FaCheckCircle,
    FaClock,
    FaFileInvoiceDollar,
    FaFileMedical,
    FaFilePrescription,
    FaHeartbeat,
    FaTint,
    FaUserCircle,
    FaUserMd,
    FaWalking,
    FaBed,
} from "react-icons/fa";

import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import PatientDashboardSkeleton from "../components/skeletons/PatientDashboardSkeleton";


export default function PatientDashboard() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [patient, setPatient] = useState(null);

    const [patientName, setPatientName] = useState(
        sessionStorage.getItem("full_name") || ""
    );

    const [summary, setSummary] = useState({
        appointments: 0,
        completed: 0,
        pending: 0,
        bills: 0,
        prescriptions: 0,
        reports: 0,
    });

    const [appointments, setAppointments] = useState([]);
    const [bills, setBills] = useState([]);
    const [nextAppointment, setNextAppointment] = useState(null);
    const [recentActivities, setRecentActivities] = useState([]);
    const [medicineReminders, setMedicineReminders] = useState([]);
    const [healthTips, setHealthTips] = useState([]);
    const [countdown, setCountdown] = useState("");


    /* =====================================================
       GREETING
    ===================================================== */

    const greeting = useMemo(() => {

        const hour = new Date().getHours();

        if (hour < 12) {
            return "Good Morning";
        }

        if (hour < 17) {
            return "Good Afternoon";
        }

        return "Good Evening";

    }, []);


    const today = useMemo(() => {

        return new Date().toLocaleDateString(
            "en-IN",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
            }
        );

    }, []);


    /* =====================================================
       HEALTH SCORE
    ===================================================== */

    const healthScore = useMemo(() => {

        let score = 100;

        score -= summary.pending * 4;

        if (score < 65) {
            score = 65;
        }

        return score;

    }, [summary]);


    const patientLevel = useMemo(() => {

        if (healthScore >= 95) {
            return "Excellent";
        }

        if (healthScore >= 85) {
            return "Very Good";
        }

        if (healthScore >= 75) {
            return "Good";
        }

        return "Needs Attention";

    }, [healthScore]);


    const completionRate = useMemo(() => {

        if (summary.appointments === 0) {
            return 0;
        }

        return Math.round(
            (summary.completed / summary.appointments) * 100
        );

    }, [summary]);


    /* =====================================================
       QUICK ACTIONS
    ===================================================== */

    const quickActions = [
        {
            icon: <FaCalendarCheck />,
            title: "Book Appointment",
            description: "Schedule a consultation",
            path: "/book-appointment",
        },
        {
            icon: <FaUserMd />,
            title: "Find a Doctor",
            description: "Browse specialists",
            path: "/patient-doctors",
        },
        {
            icon: <FaFilePrescription />,
            title: "Prescriptions",
            description: "View your medicines",
            path: "/patient-prescriptions",
        },
        {
            icon: <FaFileInvoiceDollar />,
            title: "My Bills",
            description: "View payments",
            path: "/patient-billing",
        },
        {
            icon: <FaClock />,
            title: "Appointments",
            description: "Track appointments",
            path: "/patient-appointments",
        },
        {
            icon: <FaUserCircle />,
            title: "Profile",
            description: "Manage your profile",
            path: "/profile",
        },
    ];


    /* =====================================================
       FORMAT APPOINTMENT TIME
    ===================================================== */

    function formatAppointmentTime(value) {

        if (!value) {
            return "Time not specified";
        }

        const text =
            String(value).trim();

        /*
         * Already formatted:
         * 2:00 AM
         * 02:00 PM
         */
        if (
            /AM|PM/i.test(text)
        ) {
            return text;
        }

        /*
         * HH:mm
         * HH:mm:ss
         */
        const match =
            text.match(
                /^(\d{1,2}):(\d{2})(?::\d{2})?$/
            );

        if (!match) {
            return text;
        }

        let hours =
            Number(match[1]);

        const minutes =
            match[2];

        if (
            Number.isNaN(hours) ||
            hours < 0 ||
            hours > 23
        ) {
            return text;
        }

        const suffix =
            hours >= 12
                ? "PM"
                : "AM";

        hours =
            hours % 12 || 12;

        return `${hours}:${minutes} ${suffix}`;
    }


    /* =====================================================
       PARSE APPOINTMENT DATE + TIME
    ===================================================== */

    function parseAppointmentDateTime(
        appointment
    ) {

        if (!appointment) {
            return null;
        }

        const rawDate =
            appointment.appointment_date;

        const rawTime =
            appointment.appointment_time;


        if (!rawDate) {
            return null;
        }


        const dateText =
            String(rawDate).trim();


        /*
         * API may return:
         *
         * 2026-08-19T00:00:00.000Z
         * 2026-08-19
         */

        const dateMatch =
            dateText.match(
                /^(\d{4})-(\d{2})-(\d{2})/
            );


        if (!dateMatch) {
            return null;
        }


        const year =
            Number(dateMatch[1]);

        const month =
            Number(dateMatch[2]) - 1;

        const day =
            Number(dateMatch[3]);


        if (
            !Number.isFinite(year) ||
            !Number.isFinite(month) ||
            !Number.isFinite(day)
        ) {
            return null;
        }


        let hours = 0;
        let minutes = 0;


        if (rawTime) {

            const timeText =
                String(rawTime)
                    .trim()
                    .toUpperCase();


            /*
             * Supports:
             *
             * 02:00
             * 02:00:00
             * 2:00 AM
             * 2:00 PM
             */

            const timeMatch =
                timeText.match(
                    /^(\d{1,2}):(\d{2})(?::\d{2})?\s*(AM|PM)?$/
                );


            if (timeMatch) {

                hours =
                    Number(
                        timeMatch[1]
                    );

                minutes =
                    Number(
                        timeMatch[2]
                    );


                const meridiem =
                    timeMatch[3];


                if (
                    meridiem === "PM" &&
                    hours < 12
                ) {
                    hours += 12;
                }


                if (
                    meridiem === "AM" &&
                    hours === 12
                ) {
                    hours = 0;
                }

            }

        }


        const target =
            new Date(
                year,
                month,
                day,
                hours,
                minutes,
                0,
                0
            );


        if (
            Number.isNaN(
                target.getTime()
            )
        ) {
            return null;
        }


        return target;
    }


    /* =====================================================
       LOAD DASHBOARD
    ===================================================== */

    async function loadDashboard() {

        setLoading(true);

        try {

            const dashboardRes =
                await api.get(
                    "/patient-dashboard"
                );

            const data =
                dashboardRes.data || {};


            const appointmentList =
                Array.isArray(
                    data.appointments
                )
                    ? data.appointments
                    : [];


            const billList =
                Array.isArray(
                    data.bills
                )
                    ? data.bills
                    : [];


            setPatient(
                data.patient || null
            );


            const updatedName =
                sessionStorage.getItem(
                    "full_name"
                );


            const resolvedName =
                updatedName ||
                data.patient?.full_name ||
                data.patient?.name ||
                "Patient";


            setPatientName(
                resolvedName
            );


            sessionStorage.setItem(
                "full_name",
                resolvedName
            );


            setAppointments(
                appointmentList
            );

            setBills(
                billList
            );


            /* ---------------------------------------------
               PRESCRIPTIONS
            --------------------------------------------- */

            let prescriptionList = [];

            try {

                const prescriptionRes =
                    await api.get(
                        "/prescriptions"
                    );


                prescriptionList =
                    Array.isArray(
                        prescriptionRes.data
                    )
                        ? prescriptionRes.data
                        : [];

            } catch (error) {

                const message =
                    String(
                        error?.message || ""
                    ).toLowerCase();


                const aborted =
                    error?.code ===
                    "ERR_CANCELED" ||
                    error?.name ===
                    "CanceledError" ||
                    message.includes(
                        "aborted"
                    ) ||
                    message.includes(
                        "canceled"
                    );


                if (!aborted) {

                    console.error(
                        "Prescription loading error:",
                        error
                    );

                }

            }


            /* ---------------------------------------------
               SUMMARY
            --------------------------------------------- */

            setSummary({

                appointments:
                    appointmentList.length,

                completed:
                    appointmentList.filter(
                        (appointment) =>
                            appointment.status ===
                            "Completed"
                    ).length,

                pending:
                    appointmentList.filter(
                        (appointment) =>
                            appointment.status ===
                            "Pending" ||
                            appointment.status ===
                            "Confirmed"
                    ).length,

                bills:
                    billList.length,

                prescriptions:
                    prescriptionList.length,

                reports:
                    0,

            });


            /* ---------------------------------------------
               NEXT APPOINTMENT
            --------------------------------------------- */

            const upcoming =
                [...appointmentList]
                    .filter(
                        (appointment) =>
                            appointment.status !==
                            "Cancelled" &&
                            appointment.status !==
                            "Completed"
                    )
                    .sort(
                        (a, b) => {

                            const first =
                                parseAppointmentDateTime(
                                    a
                                );

                            const second =
                                parseAppointmentDateTime(
                                    b
                                );


                            if (
                                !first &&
                                !second
                            ) {
                                return 0;
                            }


                            if (!first) {
                                return 1;
                            }


                            if (!second) {
                                return -1;
                            }


                            return (
                                first.getTime() -
                                second.getTime()
                            );
                        }
                    );


            setNextAppointment(
                upcoming[0] || null
            );


            /* ---------------------------------------------
               RECENT ACTIVITY
            --------------------------------------------- */

            setRecentActivities(
                appointmentList.slice(0, 6)
            );


            /* ---------------------------------------------
               MEDICINES
            --------------------------------------------- */

            setMedicineReminders([
                {
                    medicine:
                        "Vitamin D",
                    time:
                        "09:00 AM",
                },
                {
                    medicine:
                        "Calcium",
                    time:
                        "09:00 PM",
                },
            ]);


            /* ---------------------------------------------
               HEALTH TIPS
            --------------------------------------------- */

            setHealthTips([
                {
                    icon:
                        <FaTint />,
                    title:
                        "Stay Hydrated",
                    text:
                        "Drink 2–3 litres of water daily.",
                },
                {
                    icon:
                        <FaHeartbeat />,
                    title:
                        "Eat Healthy",
                    text:
                        "Eat fresh fruits and vegetables.",
                },
                {
                    icon:
                        <FaWalking />,
                    title:
                        "Stay Active",
                    text:
                        "Walk at least 30 minutes every day.",
                },
                {
                    icon:
                        <FaBed />,
                    title:
                        "Sleep Well",
                    text:
                        "Sleep for 7–8 hours every night.",
                },
            ]);

        } catch (error) {

            const message =
                String(
                    error?.message || ""
                ).toLowerCase();


            const aborted =
                error?.code ===
                "ERR_CANCELED" ||
                error?.name ===
                "CanceledError" ||
                message.includes(
                    "request aborted"
                ) ||
                message.includes(
                    "aborted"
                ) ||
                message.includes(
                    "canceled"
                );


            if (!aborted) {

                console.error(
                    "Patient dashboard error:",
                    error
                );

            }

        } finally {

            setLoading(false);

        }

    }


    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    useEffect(() => {

        loadDashboard();


        function handleUserUpdated() {

            setPatientName(
                sessionStorage.getItem(
                    "full_name"
                ) || ""
            );


            loadDashboard();

        }


        window.addEventListener(
            "userUpdated",
            handleUserUpdated
        );


        return () => {

            window.removeEventListener(
                "userUpdated",
                handleUserUpdated
            );

        };

    }, []);


    /* =====================================================
       COUNTDOWN
    ===================================================== */

    useEffect(() => {

        if (!nextAppointment) {

            setCountdown("");

            return;

        }


        function updateCountdown() {

            const target =
                parseAppointmentDateTime(
                    nextAppointment
                );


            if (!target) {

                setCountdown("--");

                return;

            }


            const difference =
                target.getTime() -
                Date.now();


            if (
                difference <= 0
            ) {

                setCountdown(
                    "Started"
                );

                return;

            }


            const totalMinutes =
                Math.floor(
                    difference /
                    (1000 * 60)
                );


            const days =
                Math.floor(
                    totalMinutes /
                    (60 * 24)
                );


            const hours =
                Math.floor(
                    (
                        totalMinutes %
                        (60 * 24)
                    ) / 60
                );


            const minutes =
                totalMinutes %
                60;


            if (days > 0) {

                setCountdown(
                    `${days}d ${hours}h`
                );

            } else if (hours > 0) {

                setCountdown(
                    `${hours}h ${minutes}m`
                );

            } else {

                setCountdown(
                    `${minutes}m`
                );

            }

        }


        updateCountdown();


        const timer =
            setInterval(
                updateCountdown,
                60000
            );


        return () => {

            clearInterval(timer);

        };

    }, [nextAppointment]);


    /* =====================================================
       LOADING
    ===================================================== */

    if (loading) {

        return (
            <DashboardLayout>

                <PatientDashboardSkeleton />

            </DashboardLayout>
        );

    }


    /* =====================================================
       UI
    ===================================================== */

    return (

        <DashboardLayout>

            <div className="patient-dashboard">


                {/* =================================================
                    WELCOME
                ================================================= */}

                <section className="patient-welcome-card">

                    <div className="patient-welcome-content">

                        <span className="patient-welcome-label">
                            Patient Portal
                        </span>


                        <h1>

                            {greeting},{" "}

                            <strong>
                                {patientName ||
                                    patient?.full_name ||
                                    patient?.name ||
                                    "Patient"}
                            </strong>

                        </h1>


                        <p>
                            {today}
                        </p>


                        <span className="patient-welcome-helper">
                            Manage your appointments,
                            prescriptions and healthcare
                            in one place.
                        </span>

                    </div>


                    <button
                        type="button"
                        className="patient-welcome-action"

                        onClick={() =>
                            navigate(
                                "/patient-doctors"
                            )
                        }
                    >

                        <FaUserMd />

                        Find a Doctor

                        <FaArrowRight />

                    </button>

                </section>


                {/* =================================================
                    HEALTH SCORE
                ================================================= */}

                <section className="patient-health-card">

                    <div className="patient-health-info">

                        <span>
                            Health Score
                        </span>


                        <strong>
                            {healthScore}%
                        </strong>


                        <small>
                            {patientLevel}
                        </small>


                        <p>
                            Based on your current
                            appointment activity.
                        </p>

                    </div>


                    <div className="patient-health-circle">

                        <svg
                            viewBox="0 0 120 120"
                            aria-hidden="true"
                        >

                            <circle
                                cx="60"
                                cy="60"
                                r="48"
                                className="health-track"
                            />


                            <circle
                                cx="60"
                                cy="60"
                                r="48"
                                className="health-progress"

                                strokeDasharray="301"

                                strokeDashoffset={
                                    301 -
                                    (
                                        301 *
                                        healthScore
                                    ) /
                                    100
                                }
                            />

                        </svg>


                        <div>
                            {healthScore}%
                        </div>

                    </div>

                </section>


                {/* =================================================
                    SUMMARY CARDS
                ================================================= */}

                <section className="patient-summary-grid">

                    {[
                        {
                            title:
                                "Appointments",
                            value:
                                summary.appointments,
                            icon:
                                <FaCalendarCheck />,
                            type:
                                "blue",
                            path:
                                "/patient-appointments",
                        },
                        {
                            title:
                                "Completed",
                            value:
                                summary.completed,
                            icon:
                                <FaCheckCircle />,
                            type:
                                "green",
                        },
                        {
                            title:
                                "Pending",
                            value:
                                summary.pending,
                            icon:
                                <FaClock />,
                            type:
                                "orange",
                        },
                        {
                            title:
                                "Bills",
                            value:
                                summary.bills,
                            icon:
                                <FaFileInvoiceDollar />,
                            type:
                                "red",
                            path:
                                "/patient-billing",
                        },
                        {
                            title:
                                "Prescriptions",
                            value:
                                summary.prescriptions,
                            icon:
                                <FaFilePrescription />,
                            type:
                                "purple",
                            path:
                                "/patient-prescriptions",
                        },
                        {
                            title:
                                "Reports",
                            value:
                                summary.reports,
                            icon:
                                <FaFileMedical />,
                            type:
                                "cyan",
                        },
                    ].map(
                        (card) => (

                            <button
                                type="button"
                                key={
                                    card.title
                                }
                                className="patient-summary-card"

                                onClick={() => {

                                    if (
                                        card.path
                                    ) {

                                        navigate(
                                            card.path
                                        );

                                    }

                                }}
                            >

                                <span
                                    className={`patient-summary-icon ${card.type}`}
                                >
                                    {card.icon}
                                </span>


                                <span className="patient-summary-copy">

                                    <small>
                                        {card.title}
                                    </small>


                                    <strong>
                                        {card.value}
                                    </strong>

                                </span>

                            </button>

                        )
                    )}

                </section>


                {/* =================================================
                    NEXT APPOINTMENT
                ================================================= */}

                {
                    nextAppointment ? (

                        <section className="patient-next-appointment">

                            <div className="next-appointment-main">

                                <span className="section-kicker">
                                    Upcoming Appointment
                                </span>


                                <h2>
                                    Dr.{" "}
                                    {
                                        nextAppointment
                                            .doctor_name ||
                                        "Doctor"
                                    }
                                </h2>


                                <p className="next-appointment-department">
                                    {
                                        nextAppointment
                                            .department ||
                                        "Medical Consultation"
                                    }
                                </p>


                                <div className="next-appointment-details">

                                    <span>
                                        <FaCalendarCheck />

                                        {
                                            nextAppointment
                                                .appointment_date
                                        }
                                    </span>


                                    <span>
                                        <FaClock />

                                        {
                                            formatAppointmentTime(
                                                nextAppointment
                                                    .appointment_time
                                            )
                                        }
                                    </span>

                                </div>

                            </div>


                            <div className="next-appointment-side">

                                <span>
                                    Starts In
                                </span>


                                <strong>
                                    {
                                        countdown ||
                                        "--"
                                    }
                                </strong>


                                <button
                                    type="button"

                                    onClick={() =>
                                        navigate(
                                            "/patient-appointments"
                                        )
                                    }
                                >

                                    View Appointment

                                    <FaArrowRight />

                                </button>

                            </div>

                        </section>

                    ) : (

                        <section className="patient-next-appointment empty">

                            <div>

                                <span className="section-kicker">
                                    Your Schedule
                                </span>


                                <h2>
                                    No Upcoming Appointment
                                </h2>


                                <p>
                                    Book your next consultation
                                    with a specialist.
                                </p>

                            </div>


                            <button
                                type="button"

                                onClick={() =>
                                    navigate(
                                        "/patient-doctors"
                                    )
                                }
                            >

                                Find a Doctor

                                <FaArrowRight />

                            </button>

                        </section>

                    )
                }


                {/* =================================================
                    QUICK ACTIONS
                ================================================= */}

                <section>

                    <div className="patient-section-heading">

                        <div>

                            <span>
                                Shortcuts
                            </span>


                            <h2>
                                Quick Actions
                            </h2>

                        </div>

                    </div>


                    <div className="patient-quick-actions">

                        {
                            quickActions.map(
                                (item) => (

                                    <button
                                        type="button"

                                        className="patient-quick-action"

                                        key={
                                            item.title
                                        }

                                        onClick={() =>
                                            navigate(
                                                item.path
                                            )
                                        }
                                    >

                                        <span className="quick-action-icon">

                                            {
                                                item.icon
                                            }

                                        </span>


                                        <span className="quick-action-copy">

                                            <strong>
                                                {
                                                    item.title
                                                }
                                            </strong>


                                            <small>
                                                {
                                                    item.description
                                                }
                                            </small>

                                        </span>


                                        <FaArrowRight
                                            className="quick-action-arrow"
                                        />

                                    </button>

                                )
                            )
                        }

                    </div>

                </section>


                {/* =================================================
                    RECENT ACTIVITY + MEDICINES
                ================================================= */}

                <section className="patient-dashboard-columns">


                    {/* RECENT ACTIVITY */}

                    <div className="patient-panel">

                        <div className="patient-panel-header">

                            <div>

                                <span>
                                    Timeline
                                </span>


                                <h2>
                                    Recent Activity
                                </h2>

                            </div>


                            <button
                                type="button"

                                onClick={() =>
                                    navigate(
                                        "/patient-appointments"
                                    )
                                }
                            >

                                View All

                                <FaArrowRight />

                            </button>

                        </div>


                        {
                            recentActivities.length ===
                                0 ? (

                                <div className="patient-empty-panel">

                                    <FaCalendarCheck />


                                    <strong>
                                        No Recent Activity
                                    </strong>


                                    <span>
                                        Your appointment activity
                                        will appear here.
                                    </span>

                                </div>

                            ) : (

                                <div className="patient-activity-list">

                                    {
                                        recentActivities.map(
                                            (
                                                item,
                                                index
                                            ) => (

                                                <div
                                                    className="patient-activity-item"

                                                    key={
                                                        item.id ||
                                                        index
                                                    }
                                                >

                                                    <span className="activity-icon">

                                                        <FaCalendarCheck />

                                                    </span>


                                                    <div>

                                                        <strong>

                                                            {
                                                                item.doctor_name
                                                                    ? `Appointment with Dr. ${item.doctor_name}`
                                                                    : item.title ||
                                                                    "Appointment"
                                                            }

                                                        </strong>


                                                        <small>

                                                            {
                                                                item.appointment_date ||
                                                                item.date ||
                                                                "Recently"
                                                            }

                                                        </small>

                                                    </div>


                                                    <span
                                                        className={`activity-status ${String(
                                                            item.status ||
                                                            ""
                                                        ).toLowerCase()}`}
                                                    >

                                                        {
                                                            item.status ||
                                                            "Pending"
                                                        }

                                                    </span>

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                            )
                        }

                    </div>


                    {/* MEDICINES */}

                    <div className="patient-panel">

                        <div className="patient-panel-header">

                            <div>

                                <span>
                                    Medication
                                </span>


                                <h2>
                                    Medicine Reminders
                                </h2>

                            </div>


                            <button
                                type="button"

                                onClick={() =>
                                    navigate(
                                        "/patient-prescriptions"
                                    )
                                }
                            >

                                Prescriptions

                                <FaArrowRight />

                            </button>

                        </div>


                        {
                            medicineReminders.length ===
                                0 ? (

                                <div className="patient-empty-panel">

                                    <FaFilePrescription />


                                    <strong>
                                        No Medicine Reminders
                                    </strong>


                                    <span>
                                        Your medicine schedule
                                        will appear here.
                                    </span>

                                </div>

                            ) : (

                                <div className="patient-medicine-list">

                                    {
                                        medicineReminders.map(
                                            (
                                                medicine,
                                                index
                                            ) => (

                                                <div
                                                    className="patient-medicine-item"

                                                    key={
                                                        index
                                                    }
                                                >

                                                    <span className="medicine-icon">

                                                        <FaFilePrescription />

                                                    </span>


                                                    <div>

                                                        <strong>
                                                            {
                                                                medicine.medicine
                                                            }
                                                        </strong>


                                                        <small>
                                                            Take on time
                                                        </small>

                                                    </div>


                                                    <span className="medicine-time">

                                                        {
                                                            medicine.time
                                                        }

                                                    </span>

                                                </div>

                                            )
                                        )
                                    }

                                </div>

                            )
                        }

                    </div>

                </section>


                {/* =================================================
                    HEALTH TIPS
                ================================================= */}

                <section className="patient-panel">

                    <div className="patient-panel-header">

                        <div>

                            <span>
                                Wellness
                            </span>


                            <h2>
                                Health Tips
                            </h2>

                        </div>

                    </div>


                    <div className="patient-health-tips">

                        {
                            healthTips.map(
                                (
                                    tip,
                                    index
                                ) => (

                                    <div
                                        className="patient-health-tip"

                                        key={
                                            index
                                        }
                                    >

                                        <span>
                                            {
                                                tip.icon
                                            }
                                        </span>


                                        <div>

                                            <strong>
                                                {
                                                    tip.title
                                                }
                                            </strong>


                                            <p>
                                                {
                                                    tip.text
                                                }
                                            </p>

                                        </div>

                                    </div>

                                )
                            )
                        }

                    </div>

                </section>


                {/* =================================================
                    APPOINTMENT PROGRESS
                ================================================= */}

                <section className="patient-panel patient-progress-panel">

                    <div className="patient-panel-header">

                        <div>

                            <span>
                                Progress
                            </span>


                            <h2>
                                Appointment Completion
                            </h2>

                        </div>


                        <strong className="progress-percentage">
                            {completionRate}%
                        </strong>

                    </div>


                    <div className="patient-progress-track">

                        <div
                            className="patient-progress-fill"

                            style={{
                                width:
                                    `${completionRate}%`,
                            }}
                        />

                    </div>


                    <div className="patient-progress-labels">

                        <span>
                            {
                                summary.completed
                            }{" "}
                            completed
                        </span>


                        <span>
                            {
                                summary.appointments
                            }{" "}
                            total
                        </span>

                    </div>

                </section>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <footer className="patient-dashboard-footer">

                    <strong>
                        Hospital Management System
                    </strong>


                    <span>
                        Stay Healthy • Stay Safe ❤️
                    </span>

                </footer>

            </div>

        </DashboardLayout>
    );
}