import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import PrescriptionSkeleton from "../components/PrescriptionSkeleton";
import { hmsToast } from "../utils/hmsToast";

function PatientPrescriptions() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [prescriptions, setPrescriptions] = useState([]);
    const [search, setSearch] = useState("");

    /* =========================
       LOAD PRESCRIPTIONS
    ========================= */

    useEffect(() => {
        loadPrescriptions();
    }, []);

    async function loadPrescriptions() {
        try {
            setLoading(true);
            setError("");

            const token =
                localStorage.getItem("token");

            if (!token) {
                setError(
                    "Your session has expired. Please login again."
                );
                return;
            }

            const res =
                await api.get(
                    "/prescriptions",
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            const data =
                Array.isArray(res.data)
                    ? res.data
                    : [];

            setPrescriptions(data);

        } catch (err) {
            console.error(
                "Prescription loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load prescriptions. Please try again."
            );

        } finally {
            setLoading(false);
        }
    }

    /* =========================
       STATISTICS
    ========================= */

    const totalPrescriptions =
        prescriptions.length;

    const activePrescriptions =
        prescriptions.filter((item) => {
            const status =
                String(
                    item.status || "Active"
                ).toLowerCase();

            return (
                status !== "completed" &&
                status !== "expired" &&
                status !== "cancelled"
            );
        }).length;

    const totalMedicines =
        prescriptions.reduce(
            (total, item) => {

                if (!item.medicines) {
                    return total;
                }

                const medicines =
                    String(
                        item.medicines
                    )
                        .split(",")
                        .map((medicine) =>
                            medicine.trim()
                        )
                        .filter(Boolean);

                return (
                    total +
                    medicines.length
                );
            },
            0
        );

    /* =========================
       SEARCH
    ========================= */

    const filtered =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return prescriptions;
            }

            return prescriptions.filter(
                (item) => {

                    const medicines =
                        String(
                            item.medicines ||
                            ""
                        ).toLowerCase();

                    const notes =
                        String(
                            item.notes ||
                            ""
                        ).toLowerCase();

                    const doctor =
                        String(
                            item.doctor_name ||
                            ""
                        ).toLowerCase();

                    const specialization =
                        String(
                            item.specialization ||
                            ""
                        ).toLowerCase();

                    const dosage =
                        String(
                            item.dosage ||
                            ""
                        ).toLowerCase();

                    const duration =
                        String(
                            item.duration ||
                            ""
                        ).toLowerCase();

                    const id =
                        String(
                            item.id || ""
                        );

                    return (
                        medicines.includes(
                            query
                        ) ||
                        notes.includes(
                            query
                        ) ||
                        doctor.includes(
                            query
                        ) ||
                        specialization.includes(
                            query
                        ) ||
                        dosage.includes(
                            query
                        ) ||
                        duration.includes(
                            query
                        ) ||
                        id.includes(query)
                    );
                }
            );

        }, [
            prescriptions,
            search,
        ]);

    /* =========================
       STATUS CLASS
    ========================= */

    function getStatusClass(
        status
    ) {
        const value =
            String(
                status || "Active"
            ).toLowerCase();

        if (
            value === "completed"
        ) {
            return "completed";
        }

        if (
            value === "expired"
        ) {
            return "expired";
        }

        if (
            value === "cancelled"
        ) {
            return "expired";
        }

        return "active";
    }

    /* =========================
       PDF DOWNLOAD
    ========================= */

    async function downloadPDF(
        prescriptionId
    ) {

        try {

            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {
                hmsToast.error(
                    "Session expired",
                    "Please login again."
                );
                return;
            }

            const response =
                await fetch(
                    `${import.meta.env.VITE_API_URL}/prescriptions/${prescriptionId}/pdf`,
                    {
                        method: "GET",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );

            if (!response.ok) {

                let message =
                    "Failed to download prescription PDF.";

                try {
                    const data =
                        await response.json();

                    message =
                        data.message ||
                        message;

                } catch {
                    // Response may not be JSON.
                }

                throw new Error(
                    message
                );
            }

            const blob =
                await response.blob();

            const url =
                window.URL.createObjectURL(
                    blob
                );

            const link =
                document.createElement(
                    "a"
                );

            link.href = url;

            link.download =
                `Prescription-${prescriptionId}.pdf`;

            document.body.appendChild(
                link
            );

            link.click();

            link.remove();

            window.URL.revokeObjectURL(
                url
            );

            hmsToast.success(
                "PDF downloaded",
                `Prescription #${prescriptionId} has been downloaded.`
            );

        } catch (err) {

            console.error(
                "PDF download error:",
                err
            );

            hmsToast.error(
                "Download failed",
                err.message ||
                "Unable to download prescription PDF."
            );
        }
    }

    /* =========================
       PRINT
    ========================= */

    function printPrescription() {
        window.print();
    }

    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return (
            <PrescriptionSkeleton />
        );
    }

    /* =========================
       ERROR
    ========================= */

    if (error) {

        return (
            <div className="prescription-page">

                <div className="empty-prescription">

                    <div
                        style={{
                            fontSize: "48px",
                            marginBottom: "15px",
                        }}
                    >
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Prescriptions
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        onClick={
                            loadPrescriptions
                        }
                    >
                        🔄 Try Again
                    </button>

                </div>

            </div>
        );
    }

    /* =========================
       UI
    ========================= */

    return (
        <div className="prescription-page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="prescription-header">

                <div>

                    <h1>
                        💊 My Prescriptions
                    </h1>

                    <p>
                        View prescriptions
                        uploaded by your doctors.
                    </p>

                </div>

                <div className="prescription-search-wrapper">

                    <input
                        className="prescription-search"
                        placeholder="Search medicines, doctors, notes..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                            className="prescription-search-clear"
                            aria-label="Clear search"
                        >
                            ×
                        </button>
                    )}

                </div>

            </div>


            {/* =========================
                STATISTICS
            ========================= */}

            <div className="prescription-stats">

                <div className="stat-card">

                    <h2>
                        {totalPrescriptions}
                    </h2>

                    <p>
                        Total Prescriptions
                    </p>

                </div>


                <div className="stat-card">

                    <h2>
                        {activePrescriptions}
                    </h2>

                    <p>
                        Active
                    </p>

                </div>


                <div className="stat-card">

                    <h2>
                        {totalMedicines}
                    </h2>

                    <p>
                        Medicines
                    </p>

                </div>

            </div>


            {/* =========================
                SEARCH RESULT INFO
            ========================= */}

            {search && (
                <div
                    style={{
                        marginBottom: "18px",
                        color: "#64748b",
                        fontSize: "14px",
                    }}
                >
                    Showing{" "}
                    <strong>
                        {filtered.length}
                    </strong>{" "}
                    result
                    {filtered.length !== 1
                        ? "s"
                        : ""}{" "}
                    for "
                    <strong>
                        {search}
                    </strong>"
                </div>
            )}


            {/* =========================
                EMPTY STATE
            ========================= */}

            {filtered.length === 0 ? (

                <div className="empty-prescription">

                    <div
                        style={{
                            fontSize: "52px",
                            marginBottom: "15px",
                        }}
                    >
                        {prescriptions.length === 0
                            ? "💊"
                            : "🔍"}
                    </div>

                    <h2>

                        {prescriptions.length === 0
                            ? "No Prescriptions Yet"
                            : "No Prescriptions Found"}

                    </h2>

                    <p>

                        {prescriptions.length === 0
                            ? "Your prescriptions will appear here when your doctor adds them."
                            : "Try searching with a different medicine, doctor, or keyword."}

                    </p>

                    {search && (
                        <button
                            type="button"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            Clear Search
                        </button>
                    )}

                </div>

            ) : (

                /* =========================
                   PRESCRIPTION GRID
                ========================= */

                <div className="prescription-grid">

                    {filtered.map(
                        (item) => {

                            const medicines =
                                String(
                                    item.medicines ||
                                    ""
                                )
                                    .split(",")
                                    .map(
                                        (medicine) =>
                                            medicine.trim()
                                    )
                                    .filter(
                                        Boolean
                                    );

                            const status =
                                item.status ||
                                "Active";

                            return (

                                <div
                                    className="prescription-card"
                                    key={item.id}
                                >

                                    {/* =====================
                                        TOP
                                    ===================== */}

                                    <div className="prescription-top">

                                        <div>

                                            <h2>
                                                🩺 Prescription #
                                                {item.id}
                                            </h2>

                                            <small>

                                                {item.created_at
                                                    ? new Date(
                                                        item.created_at
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day: "2-digit",
                                                            month: "short",
                                                            year: "numeric",
                                                        }
                                                    )
                                                    : "Recently Added"}

                                            </small>

                                        </div>


                                        <span
                                            className={`status-badge ${getStatusClass(
                                                status
                                            )}`}
                                        >
                                            {status}
                                        </span>

                                    </div>


                                    {/* =====================
                                        DOCTOR
                                    ===================== */}

                                    <div className="doctor-card">

                                        <div className="doctor-avatar">
                                            👨‍⚕️
                                        </div>


                                        <div>

                                            <h3>
                                                Dr.{" "}
                                                {item.doctor_name ||
                                                    `Doctor ${item.doctor_id}`}
                                            </h3>

                                            <p>
                                                {item.specialization ||
                                                    "General Physician"}
                                            </p>

                                        </div>

                                    </div>


                                    {/* =====================
                                        INFORMATION
                                    ===================== */}

                                    <div className="info-grid">

                                        <div className="info-box">

                                            <strong>
                                                Prescription ID
                                            </strong>

                                            <span>
                                                #{item.id}
                                            </span>

                                        </div>


                                        <div className="info-box">

                                            <strong>
                                                Doctor
                                            </strong>

                                            <span>
                                                {item.doctor_name ||
                                                    `Doctor ${item.doctor_id}`}
                                            </span>

                                        </div>


                                        <div className="info-box">

                                            <strong>
                                                Duration
                                            </strong>

                                            <span>
                                                {item.duration ||
                                                    "Not specified"}
                                            </span>

                                        </div>


                                        <div className="info-box">

                                            <strong>
                                                Date
                                            </strong>

                                            <span>

                                                {item.created_at
                                                    ? new Date(
                                                        item.created_at
                                                    ).toLocaleDateString(
                                                        "en-IN"
                                                    )
                                                    : "Today"}

                                            </span>

                                        </div>

                                    </div>


                                    {/* =====================
                                        MEDICINES
                                    ===================== */}

                                    <div className="medicine-section">

                                        <h4>
                                            💊 Medicines
                                        </h4>

                                        <div className="medicine-list">

                                            {medicines.length >
                                                0 ? (

                                                medicines.map(
                                                    (
                                                        medicine,
                                                        index
                                                    ) => (

                                                        <span
                                                            key={
                                                                index
                                                            }
                                                            className="medicine-chip"
                                                        >
                                                            💊{" "}
                                                            {
                                                                medicine
                                                            }
                                                        </span>

                                                    )
                                                )

                                            ) : (

                                                <span
                                                    className="medicine-chip"
                                                >
                                                    No medicines listed
                                                </span>

                                            )}

                                        </div>

                                    </div>


                                    {/* =====================
                                        DOSAGE + DURATION
                                    ===================== */}

                                    <div className="dosage-section">

                                        <div className="dosage-box">

                                            💊{" "}
                                            {item.dosage ||
                                                "Dosage not specified"}

                                        </div>


                                        <div className="duration-box">

                                            📅{" "}
                                            {item.duration ||
                                                "Duration not specified"}

                                        </div>

                                    </div>


                                    {/* =====================
                                        NOTES
                                    ===================== */}

                                    <div className="notes-box">

                                        <strong>
                                            Doctor Notes
                                        </strong>

                                        <p>

                                            {item.notes ||
                                                "No additional notes."}

                                        </p>

                                    </div>


                                    {/* =====================
                                        FOLLOW UP
                                    ===================== */}

                                    <div className="followup-card">

                                        <h4>
                                            📅 Follow-up
                                        </h4>

                                        <p>

                                            Visit your doctor
                                            after completing
                                            the medicines.

                                        </p>

                                    </div>


                                    {/* =====================
                                        MEDICINE TIMING
                                    ===================== */}

                                    <div className="prescription-footer">

                                        <div className="medicine-time">

                                            <span className="time-pill morning">
                                                🌅 Morning
                                            </span>

                                            <span className="time-pill afternoon">
                                                ☀ Afternoon
                                            </span>

                                            <span className="time-pill night">
                                                🌙 Night
                                            </span>

                                        </div>


                                        {/* =================
                                            ACTIONS
                                        ================= */}

                                        <div className="prescription-buttons">

                                            <button
                                                type="button"
                                                onClick={
                                                    printPrescription
                                                }
                                            >
                                                🖨 Print
                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    downloadPDF(
                                                        item.id
                                                    )
                                                }
                                            >
                                                ⬇ Download PDF
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            );
                        }
                    )}

                </div>

            )}

        </div>
    );
}

export default PatientPrescriptions;