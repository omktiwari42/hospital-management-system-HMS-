import { useEffect, useState } from "react";
import api from "../services/api";
import PrescriptionSkeleton from "../components/PrescriptionSkeleton";
import { hmsToast } from "../utils/hmsToast";

function PatientPrescriptions() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [prescriptions, setPrescriptions] = useState([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        loadPrescriptions();
    }, []);

    async function loadPrescriptions() {
        try {
            setLoading(true);
            setError("");

            const token = sessionStorage.getItem("token");

            if (!token) {
                setError(
                    "Your session has expired. Please login again."
                );
                setLoading(false);
                return;
            }

            const response = await api.get(
                "/prescriptions",
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );

            if (Array.isArray(response.data)) {
                setPrescriptions(response.data);
            } else {
                setPrescriptions([]);
            }

        } catch (err) {
            console.error(
                "Prescription loading error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load prescriptions."
            );

        } finally {
            setLoading(false);
        }
    }

    const totalPrescriptions =
        prescriptions.length;

    const activePrescriptions =
        prescriptions.filter((item) => {
            const status = String(
                item.status || "Active"
            ).toLowerCase();

            if (status === "completed") {
                return false;
            }

            if (status === "expired") {
                return false;
            }

            if (status === "cancelled") {
                return false;
            }

            return true;
        }).length;

    const totalMedicines =
        prescriptions.reduce(
            (total, item) => {
                if (!item.medicines) {
                    return total;
                }

                const medicines = String(
                    item.medicines
                )
                    .split(",")
                    .map((medicine) =>
                        medicine.trim()
                    )
                    .filter(
                        (medicine) =>
                            medicine.length > 0
                    );

                return (
                    total +
                    medicines.length
                );
            },
            0
        );

    const searchText =
        search.trim().toLowerCase();

    const filteredPrescriptions =
        prescriptions.filter((item) => {
            if (!searchText) {
                return true;
            }

            const medicineText =
                String(
                    item.medicines || ""
                ).toLowerCase();

            const doctorText =
                String(
                    item.doctor_name || ""
                ).toLowerCase();

            const specializationText =
                String(
                    item.specialization || ""
                ).toLowerCase();

            const dosageText =
                String(
                    item.dosage || ""
                ).toLowerCase();

            const durationText =
                String(
                    item.duration || ""
                ).toLowerCase();

            const notesText =
                String(
                    item.notes || ""
                ).toLowerCase();

            const idText =
                String(
                    item.id || ""
                ).toLowerCase();

            return (
                medicineText.includes(
                    searchText
                ) ||
                doctorText.includes(
                    searchText
                ) ||
                specializationText.includes(
                    searchText
                ) ||
                dosageText.includes(
                    searchText
                ) ||
                durationText.includes(
                    searchText
                ) ||
                notesText.includes(
                    searchText
                ) ||
                idText.includes(
                    searchText
                )
            );
        });

    function getStatusClass(status) {
        const value =
            String(
                status || "Active"
            ).toLowerCase();

        if (value === "completed") {
            return "completed";
        }

        if (
            value === "expired" ||
            value === "cancelled"
        ) {
            return "expired";
        }

        return "active";
    }

    function printPrescription() {
        window.print();
    }

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
                throw new Error(
                    "Unable to download prescription PDF."
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
                `Prescription #${prescriptionId} downloaded successfully.`
            );

        } catch (err) {
            console.error(
                "PDF download error:",
                err
            );

            hmsToast.error(
                "Download failed",
                err.message ||
                "Unable to download PDF."
            );
        }
    }

    if (loading) {
        return (
            <PrescriptionSkeleton />
        );
    }

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

    return (
        <div className="prescription-page">

            <div className="prescription-header">

                <div>
                    <h1>
                        💊 My Prescriptions
                    </h1>

                    <p>
                        View all prescriptions
                        uploaded by your doctors.
                    </p>
                </div>

                <div className="prescription-search-wrapper">

                    <input
                        className="prescription-search"
                        type="text"
                        placeholder="Search medicines..."
                        value={search}
                        onChange={(e) => {
                            setSearch(
                                e.target.value
                            );
                        }}
                    />

                    {search && (
                        <button
                            type="button"
                            className="prescription-search-clear"
                            onClick={() => {
                                setSearch("");
                            }}
                        >
                            ×
                        </button>
                    )}

                </div>

            </div>


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


            {search && (
                <div
                    style={{
                        marginBottom:
                            "18px",
                        color:
                            "#64748b",
                        fontSize:
                            "14px",
                    }}
                >
                    Showing{" "}
                    <strong>
                        {
                            filteredPrescriptions.length
                        }
                    </strong>{" "}
                    result
                    {filteredPrescriptions.length !==
                        1
                        ? "s"
                        : ""}{" "}
                    for{" "}
                    <strong>
                        "{search}"
                    </strong>
                </div>
            )}


            {filteredPrescriptions.length ===
                0 ? (

                <div className="empty-prescription">

                    <div
                        style={{
                            fontSize: "50px",
                            marginBottom:
                                "15px",
                        }}
                    >
                        {prescriptions.length ===
                            0
                            ? "💊"
                            : "🔍"}
                    </div>

                    <h2>
                        {prescriptions.length ===
                            0
                            ? "No Prescriptions Yet"
                            : "No Prescriptions Found"}
                    </h2>

                    <p>
                        {prescriptions.length ===
                            0
                            ? "Your prescriptions will appear here when your doctor adds them."
                            : "Try another medicine, doctor, or keyword."}
                    </p>

                    {search && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearch("");
                            }}
                        >
                            Clear Search
                        </button>
                    )}

                </div>

            ) : (

                <div className="prescription-grid">

                    {filteredPrescriptions.map(
                        (item) => {

                            const medicines =
                                String(
                                    item.medicines ||
                                    ""
                                )
                                    .split(",")
                                    .map(
                                        (
                                            medicine
                                        ) =>
                                            medicine.trim()
                                    )
                                    .filter(
                                        (
                                            medicine
                                        ) =>
                                            medicine.length >
                                            0
                                    );

                            const status =
                                item.status ||
                                "Active";

                            return (
                                <div
                                    className="prescription-card"
                                    key={
                                        item.id
                                    }
                                >

                                    <div className="prescription-top">

                                        <div>

                                            <h2>
                                                🩺
                                                Prescription
                                                #
                                                {
                                                    item.id
                                                }
                                            </h2>

                                            <small>
                                                {item.created_at
                                                    ? new Date(
                                                        item.created_at
                                                    ).toLocaleDateString(
                                                        "en-IN",
                                                        {
                                                            day:
                                                                "2-digit",
                                                            month:
                                                                "short",
                                                            year:
                                                                "numeric",
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
                                            {
                                                status
                                            }
                                        </span>

                                    </div>


                                    <div className="doctor-card">

                                        <div className="doctor-avatar">
                                            👨‍⚕️
                                        </div>

                                        <div>

                                            <h3>
                                                Dr.{" "}
                                                {
                                                    item.doctor_name ||
                                                    `Doctor ${item.doctor_id}`
                                                }
                                            </h3>

                                            <p>
                                                {
                                                    item.specialization ||
                                                    "General Physician"
                                                }
                                            </p>

                                        </div>

                                    </div>


                                    <div className="info-grid">

                                        <div className="info-box">

                                            <strong>
                                                Prescription ID
                                            </strong>

                                            <span>
                                                #
                                                {
                                                    item.id
                                                }
                                            </span>

                                        </div>


                                        <div className="info-box">

                                            <strong>
                                                Doctor
                                            </strong>

                                            <span>
                                                {
                                                    item.doctor_name ||
                                                    `Doctor ${item.doctor_id}`
                                                }
                                            </span>

                                        </div>


                                        <div className="info-box">

                                            <strong>
                                                Duration
                                            </strong>

                                            <span>
                                                {
                                                    item.duration ||
                                                    "Not specified"
                                                }
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


                                    <div className="medicine-section">

                                        <h4>
                                            💊
                                            Medicines
                                        </h4>

                                        <div className="medicine-list">

                                            {medicines.length >
                                                0 ? (

                                                medicines.map(
                                                    (
                                                        medicine,
                                                        index
                                                    ) => {

                                                        return (
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
                                                        );
                                                    }
                                                )

                                            ) : (

                                                <span className="medicine-chip">
                                                    No medicines
                                                    listed
                                                </span>

                                            )}

                                        </div>

                                    </div>


                                    <div className="dosage-section">

                                        <div className="dosage-box">

                                            💊{" "}
                                            {
                                                item.dosage ||
                                                "Dosage not specified"
                                            }

                                        </div>


                                        <div className="duration-box">

                                            📅{" "}
                                            {
                                                item.duration ||
                                                "Duration not specified"
                                            }

                                        </div>

                                    </div>


                                    <div className="notes-box">

                                        <strong>
                                            Doctor Notes
                                        </strong>

                                        <p>
                                            {
                                                item.notes ||
                                                "No additional notes."
                                            }
                                        </p>

                                    </div>


                                    <div className="followup-card">

                                        <h4>
                                            📅
                                            Follow-up
                                        </h4>

                                        <p>
                                            Visit your
                                            doctor
                                            after
                                            completing
                                            the
                                            medicines.
                                        </p>

                                    </div>


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
                                                onClick={() => {
                                                    downloadPDF(
                                                        item.id
                                                    );
                                                }}
                                            >
                                                ⬇
                                                Download
                                                PDF
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