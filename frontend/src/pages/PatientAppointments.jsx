import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import PatientAppointmentsSkeleton from "../components/skeletons/PatientAppointmentsSkeleton";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function PatientAppointments() {

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("All");
    const [search, setSearch] = useState("");
    const [selectedAppointment, setSelectedAppointment] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    const [showInvoice, setShowInvoice] = useState(false);
    const [invoiceData, setInvoiceData] = useState(null);
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

            case "Confirmed":
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
    function getProgress(status) {

        switch (status) {

            case "Pending":
                return 25;

            case "Confirmed":
                return 50;

            case "Completed":
                return 100;

            case "Cancelled":
                return 100;

            default:
                return 10;

        }

    }
    function timelineProgress(status) {

        switch (status) {

            case "Pending":
                return 20;

            case "Confirmed":
            case "Scheduled":
                return 55;

            case "Completed":
                return 100;

            case "Cancelled":
                return 100;

            default:
                return 0;

        }

    }

    function timelineIcon(status) {

        switch (status) {

            case "Pending":
                return "🟡";

            case "Confirmed":
            case "Scheduled":
                return "🔵";

            case "Completed":
                return "🟢";

            case "Cancelled":
                return "🔴";

            default:
                return "⚪";

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
    function getRemainingDays(date) {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const appointment = new Date(date);

        appointment.setHours(0, 0, 0, 0);

        const diff = Math.ceil(
            (appointment - today) / (1000 * 60 * 60 * 24)
        );

        if (diff < 0) return "Completed";

        if (diff === 0) return "Today";

        if (diff === 1) return "Tomorrow";

        return `${diff} Days Left`;

    }

    function urgencyColor(date) {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const appointment = new Date(date);

        appointment.setHours(0, 0, 0, 0);

        const diff = Math.ceil(
            (appointment - today) / (1000 * 60 * 60 * 24)
        );

        if (diff === 0) return "#dc2626";

        if (diff <= 2) return "#f59e0b";

        return "#16a34a";

    }

    function urgencyText(date) {

        const today = new Date();

        today.setHours(0, 0, 0, 0);

        const appointment = new Date(date);

        appointment.setHours(0, 0, 0, 0);

        const diff = Math.ceil(
            (appointment - today) / (1000 * 60 * 60 * 24)
        );

        if (diff === 0) return "URGENT";

        if (diff <= 2) return "SOON";

        return "NORMAL";

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
    function downloadInvoice(item) {

        const doc = new jsPDF();
        doc.setFillColor(37, 99, 235);

        doc.rect(
            0,
            0,
            210,
            20,
            "F"
        );

        doc.setTextColor(255);

        doc.setFontSize(20);

        doc.text(
            "HOSPITAL MANAGEMENT SYSTEM",
            15,
            13
        );

        doc.setFont("helvetica");

        doc.setFontSize(22);

        doc.setTextColor(37, 99, 235);

        doc.text(
            "Hospital Management System",
            18,
            20
        );

        doc.setFontSize(13);

        doc.setTextColor(90);

        doc.text(
            "Professional Medical Invoice",
            18,
            30
        );
        doc.setFontSize(10);

        doc.text(
            "Phone : +91 9876543210",
            18,
            54
        );

        doc.text(
            "Email : support@hms.com",
            18,
            60
        );

        doc.text(
            "Website : www.hms.com",
            18,
            66
        );
        doc.text(
            "GSTIN : 09ABCDE1234F1Z5",
            18,
            48
        );
        doc.setFontSize(10);

        doc.setTextColor(120);

        doc.text(
            "City Hospital, Main Road, Lucknow, Uttar Pradesh",
            18,
            36
        );

        doc.text(
            "Email: support@hospital.com | Phone: +91-9876543210",
            18,
            42
        );

        doc.setDrawColor(37, 99, 235);

        doc.line(
            18,
            35,
            190,
            35
        );

        doc.setFontSize(11);

        doc.setTextColor(0);

        doc.text(
            `Invoice No : INV-${new Date().getFullYear()}-${item.id}`,
            18,
            60
        );
        doc.text(
            `Generated : ${new Date().toLocaleDateString("en-IN")}`,
            110,
            48
        );

        doc.text(
            `Appointment ID : ${item.id}`,
            18,
            68
        );

        doc.text(
            `Date : ${formatAppointmentDate(item.appointment_date)}`,
            18,
            76
        );

        doc.text(
            `Time : ${formatAppointmentTime(item.appointment_time)}`,
            18,
            84
        );

        doc.text(
            `Doctor : Dr. ${item.doctor_name}`,
            18,
            92
        );

        doc.text(
            `Department : ${item.department}`,
            18,
            100
        );

        doc.text(
            `Patient : ${sessionStorage.getItem("full_name")
            }`,
            18,
            108
        );
        doc.text(
            `Patient ID : ${sessionStorage.getItem("user_id") || "N/A"}`,
            110,
            108
        );
        doc.setFillColor(
            item.payment_status === "Paid"
                ? 22
                : 245,
            item.payment_status === "Paid"
                ? 163
                : 158,
            item.payment_status === "Paid"
                ? 74
                : 11
        );

        doc.roundedRect(
            140,
            98,
            45,
            10,
            3,
            3,
            "F"
        );

        doc.setTextColor(255);

        doc.setFontSize(10);

        doc.text(
            item.payment_status || "Pending",
            150,
            105
        );

        doc.setTextColor(0);
        doc.text(
            `Transaction ID : ${item.transaction_id || "N/A"
            }`,
            18,
            124
        );
        doc.text(
            `Payment Mode : ${item.payment_status === "Paid"
                ? "Online"
                : "Pending"
            }`,
            18,
            132
        );
        const consultationFee = Number(item.amount || 500);

        const hospitalCharge = 200;

        const gst = Math.round(
            (consultationFee + hospitalCharge) * 0.18
        );

        const total =
            consultationFee +
            hospitalCharge +
            gst;

        const rows = [
            [
                "Doctor Consultation",
                "1",
                `₹${consultationFee}`
            ],
            [
                "Hospital Charge",
                "1",
                `₹${hospitalCharge}`
            ],
            [
                "GST (18%)",
                "1",
                `₹${gst}`
            ]
        ];
        doc.setTextColor(240);

        doc.setFontSize(42);

        doc.text(
            "HMS",
            115,
            180,
            {
                angle: 45
            }
        );

        doc.setTextColor(0);
        autoTable(doc, {

            startY: 122,

            head: [[
                "Service",
                "Quantity",
                "Amount"
            ]],
            body: rows,


            theme: "grid",

            headStyles: {

                fillColor: [37, 99, 235]

            }

        });

        const end =
            doc.lastAutoTable.finalY + 20;
        if (item.payment_status === "Paid") {

            doc.setFontSize(40);

            doc.setTextColor(22, 163, 74);

            doc.text(
                "PAID",
                125,
                end,
                {
                    angle: 30
                }
            );

            doc.setTextColor(0);

        }

        doc.setFontSize(18);

        doc.setTextColor(22, 163, 74);

        doc.text(

            `Total : ₹${total}`,

            145,

            end

        );

        doc.setFontSize(11);

        doc.setTextColor(120);

        doc.setFontSize(10);

        doc.setTextColor(100);

        doc.text(
            "Thank you for choosing Hospital Management System.",
            18,
            end + 18
        );

        doc.text(
            "This invoice has been generated electronically.",
            18,
            end + 25
        );

        doc.text(
            "Please keep this invoice for future reference.",
            18,
            end + 32
        );

        doc.text(
            "www.hospitalmanagementsystem.com",
            18,
            end + 39
        );

        doc.text(
            "support@hospitalmanagementsystem.com",
            18,
            end + 46
        );

        doc.line(
            18,
            end + 58,
            75,
            end + 58
        );

        doc.text(
            "Doctor Signature",
            20,
            end + 66
        );

        doc.line(
            120,
            end + 58,
            185,
            end + 58
        );

        doc.text(
            "Hospital Authority",
            128,
            end + 66
        );
        doc.setDrawColor(150);

        doc.rect(

            160,

            18,

            28,

            28

        );

        doc.setFontSize(8);

        doc.text(

            "QR",

            170,

            34

        );
        doc.setDrawColor(180);

        doc.rect(
            150,
            end + 50,
            35,
            35
        );

        doc.setFontSize(9);

        doc.setTextColor(120);

        doc.text(
            "QR CODE",
            158,
            end + 70
        );

        doc.setTextColor(0);
        doc.setDrawColor(220);

        doc.line(
            15,
            285,
            195,
            285
        );

        doc.setFontSize(9);

        doc.setTextColor(120);

        doc.text(
            "Generated by Hospital Management System",
            18,
            291
        );

        doc.text(
            "© 2026 HMS. All Rights Reserved.",
            125,
            291
        );

        doc.save(

            `Invoice-${item.id}.pdf`

        );

    }
    function openInvoice(item) {

        setInvoiceData(item);

        setShowInvoice(true);

    }

    function closeInvoice() {

        setShowInvoice(false);

        setInvoiceData(null);

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

                                        {item.doctor_name
                                            ? item.doctor_name.charAt(0).toUpperCase()
                                            : "D"}

                                    </div>

                                    <div>

                                        <h2>

                                            Dr. {item.doctor_name}

                                            {getAppointmentDay(item.appointment_date) === "Today" && (

                                                <span className="today-badge">

                                                    TODAY

                                                </span>

                                            )}

                                        </h2>

                                        <p className="doctor-speciality">
                                            🏥 {item.department}
                                        </p>
                                        <div className="doctor-extra">
                                            ⭐ Hospital Specialist
                                        </div>

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
                            <div className="appointment-day" >

                                <div>

                                    ⏰ {getRemainingDays(item.appointment_date)}

                                </div>

                                <span

                                    className="urgent-badge"

                                    style={{

                                        background: urgencyColor(item.appointment_date)

                                    }}

                                >

                                    {urgencyText(item.appointment_date)}

                                </span>

                            </div>
                            <div className="appointment-progress">

                                <div className="progress-top">

                                    <span>Appointment Progress</span>

                                    <span>{getProgress(item.status)}%</span>

                                </div>

                                <div className="progress-bar">

                                    <div

                                        className="progress-fill"

                                        style={{
                                            width: `${getProgress(item.status)}%`
                                        }}

                                    ></div>

                                </div>

                            </div>



                            <div className="timeline-wrapper">

                                <div className="timeline-bar">

                                    <div
                                        className="timeline-fill"
                                        style={{
                                            width: `${timelineProgress(item.status)}%`
                                        }}
                                    ></div>

                                </div>

                                <div className="timeline-labels">

                                    <span className={
                                        timelineProgress(item.status) >= 20
                                            ? "active-step"
                                            : ""
                                    }>
                                        Booked
                                    </span>

                                    <span className={
                                        timelineProgress(item.status) >= 55
                                            ? "active-step"
                                            : ""
                                    }>
                                        Confirmed
                                    </span>

                                    <span className={
                                        timelineProgress(item.status) >= 100
                                            ? "active-step"
                                            : ""
                                    }>
                                        Completed
                                    </span>

                                </div>

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
                                                item.payment_status === "Paid" ||
                                                    item.payment_status === "Success" ||
                                                    item.payment_status === true
                                                    ? "payment-paid"
                                                    : item.payment_status === "Failed"
                                                        ? "payment-failed"
                                                        : "payment-pending"
                                            }
                                        >
                                            {item.payment_status === "Paid"
                                                ? "Paid"
                                                : item.payment_status === "Success"
                                                    ? "Paid"
                                                    : item.payment_status === true
                                                        ? "Paid"
                                                        : "Pending"}
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
                                    <div className="appointment-note">

                                        💡 Please arrive 15 minutes before your scheduled appointment.

                                    </div>

                                    <small>Reason for Visit</small>

                                    <p>
                                        {item.reason || "No reason provided"}
                                    </p>

                                </div>

                            </div>
                            <div className="appointment-footer">

                                <div>

                                    <small>Appointment</small>

                                    <h4>#{item.id}</h4>

                                </div>

                                <div>

                                    <small>Status</small>

                                    <h4>{item.status}</h4>

                                </div>

                                <div>

                                    <small>Payment</small>

                                    <h4>

                                        {item.payment_status || "Pending"}

                                    </h4>

                                </div>

                                <div>

                                    <small>Booked For</small>

                                    <h4>

                                        {formatAppointmentDate(item.appointment_date)}

                                    </h4>

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

                                            openInvoice(item);

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

                        <h2>

                            📅 Appointment Details

                        </h2>

                        <p className="modal-subtitle">

                            Everything related to this appointment.

                        </p>

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
                                <p>

                                    {formatAppointmentDate(
                                        selectedAppointment.appointment_date
                                    )}

                                </p>
                            </div>

                            <div>
                                <strong>Time</strong>
                                <p>

                                    {formatAppointmentTime(
                                        selectedAppointment.appointment_time
                                    )}

                                </p>
                            </div>

                            <div>
                                <strong>

                                    Status

                                </strong>

                                <span

                                    className="status-chip"

                                    style={{

                                        background: badge(selectedAppointment.status)

                                    }}

                                >

                                    {selectedAppointment.status}

                                </span>
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
                                <div>

                                    <strong>

                                        Remaining

                                    </strong>

                                    <p>

                                        {getRemainingDays(selectedAppointment.appointment_date)}

                                    </p>

                                </div>
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
            {showInvoice && invoiceData && (

                <div className="invoice-overlay">

                    <div className="invoice-container">

                        <button

                            className="invoice-close"

                            onClick={closeInvoice}

                        >

                            ✕

                        </button>

                        <div className="invoice-header">

                            <h1>

                                🏥 HMS Invoice

                            </h1>

                            <p>

                                Professional Hospital Management System

                            </p>

                        </div>

                        <div className="invoice-section">

                            <div>

                                <h4>Invoice No</h4>

                                <p>

                                    INV-{invoiceData.id}

                                </p>

                            </div>

                            <div>

                                <h4>Status</h4>

                                <p>

                                    {invoiceData.payment_status || "Pending"}

                                </p>

                            </div>

                            <div>

                                <h4>Date</h4>

                                <p>

                                    {formatAppointmentDate(invoiceData.appointment_date)}

                                </p>

                            </div>

                        </div>

                        <hr />

                        <div className="invoice-section">

                            <div>

                                <h4>Patient</h4>

                                <p>

                                    {sessionStorage.getItem("full_name")}

                                </p>

                            </div>

                            <div>

                                <h4>Doctor</h4>

                                <p>

                                    Dr. {invoiceData.doctor_name}

                                </p>

                            </div>

                            <div>

                                <h4>Department</h4>

                                <p>

                                    {invoiceData.department}

                                </p>

                            </div>

                        </div>

                        <hr />

                        <div className="invoice-section">

                            <div>

                                <h4>Appointment Time</h4>

                                <p>

                                    {formatAppointmentTime(invoiceData.appointment_time)}

                                </p>

                            </div>

                            <div>

                                <h4>Transaction</h4>

                                <p>

                                    {invoiceData.transaction_id || "N/A"}

                                </p>

                            </div>

                            <div>

                                <h4>Payment</h4>

                                <p>

                                    {invoiceData.payment_status || "Pending"}

                                </p>

                            </div>

                        </div>

                        <hr />

                        <table className="invoice-table">

                            <thead>

                                <tr>

                                    <th>Service</th>

                                    <th>Qty</th>

                                    <th>Amount</th>

                                </tr>

                            </thead>

                            <tbody>

                                <tr>

                                    <td>

                                        Doctor Consultation

                                    </td>

                                    <td>

                                        1

                                    </td>

                                    <td>

                                        ₹500

                                    </td>

                                </tr>

                                <tr>

                                    <td>

                                        Hospital Charges

                                    </td>

                                    <td>

                                        1

                                    </td>

                                    <td>

                                        ₹200

                                    </td>

                                </tr>

                                <tr>

                                    <td>

                                        GST

                                    </td>

                                    <td>

                                        1

                                    </td>

                                    <td>

                                        ₹126

                                    </td>

                                </tr>

                            </tbody>

                        </table>

                        <div className="invoice-total">

                            <h2>

                                Total

                            </h2>

                            <h1>

                                ₹826

                            </h1>

                        </div>

                        <div className="invoice-footer">

                            <div>

                                Doctor Signature

                            </div>

                            <div>

                                Hospital Seal

                            </div>

                        </div>

                        <div className="invoice-buttons">

                            <button

                                className="print-btn"

                                onClick={() => window.print()}

                            >

                                🖨 Print

                            </button>

                            <button

                                className="download-btn"

                                onClick={() => downloadInvoice(invoiceData)}

                            >

                                ⬇ Download PDF

                            </button>

                            <button

                                className="close-btn"

                                onClick={closeInvoice}

                            >

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </DashboardLayout>
    );
}