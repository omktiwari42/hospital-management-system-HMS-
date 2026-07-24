import { useEffect, useState } from "react";
import api from "../services/api";
import PrescriptionSkeleton from "../components/PrescriptionSkeleton";

function PatientPrescriptions() {
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState([]);
    const [search, setSearch] = useState("");
    const totalPrescriptions = prescriptions.length;

    const activePrescriptions = prescriptions.filter(
        p => true
    ).length;

    const totalMedicines = prescriptions.reduce((total, p) => {
        if (!p.medicines) return total;
        return total + p.medicines.split(",").length;
    }, 0);

    useEffect(() => {
        loadPrescriptions();
    }, []);

    async function loadPrescriptions() {
        try {
            setLoading(true);

            const token = localStorage.getItem("token");

            const res = await api.get("/prescriptions", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setPrescriptions(res.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    const filtered = prescriptions.filter((item) => {
        return (
            item.medicines
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            item.notes
                ?.toLowerCase()
                .includes(search.toLowerCase()) ||
            String(item.doctor_id)
                .includes(search)
        );
    });

    if (loading) {
        return <PrescriptionSkeleton />;
    }

    return (
        <div className="prescription-page">

            <div className="prescription-header">

                <div>

                    <h1>💊 My Prescriptions</h1>

                    <p>
                        View all prescriptions uploaded by your doctors.
                    </p>

                </div>

                <input
                    className="prescription-search"
                    placeholder="Search medicines..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>
            <div className="prescription-stats">

                <div className="stat-card">

                    <h2>{totalPrescriptions}</h2>

                    <p>Total Prescriptions</p>

                </div>

                <div className="stat-card">

                    <h2>{activePrescriptions}</h2>

                    <p>Active</p>

                </div>

                <div className="stat-card">

                    <h2>{totalMedicines}</h2>

                    <p>Medicines</p>

                </div>

            </div>

            {filtered.length === 0 ? (

                <div className="empty-prescription">

                    <h2>No Prescriptions Found</h2>

                    <p>
                        Your prescriptions will appear here.
                    </p>

                </div>

            ) : (

                <div className="prescription-grid">

                    {filtered.map((item) => (

                        <div
                            className="prescription-card"
                            key={item.id}
                        >

                            <div className="prescription-top">

                                <div>

                                    <h2>
                                        🩺 Prescription #{item.id}
                                    </h2>

                                    <small>

                                        {item.created_at
                                            ? new Date(
                                                item.created_at
                                            ).toLocaleDateString(
                                                "en-IN"
                                            )
                                            : "Recently Added"}

                                    </small>

                                </div>
                                <span
                                    className={`status-badge ${item.status === "Completed"
                                        ? "completed"
                                        : item.status === "Expired"
                                            ? "expired"
                                            : "active"
                                        }`}
                                >
                                    {item.status || "Active"}
                                </span>

                            </div>

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
                            <div className="info-grid">

                                <div className="info-box">
                                    <strong>Prescription ID</strong>
                                    <span>#{item.id}</span>
                                </div>

                                <div className="info-box">
                                    <strong>Doctor</strong>
                                    <span>
                                        {item.doctor_name || `Doctor ${item.doctor_id}`}
                                    </span>
                                </div>

                                <div className="info-box">
                                    <strong>Duration</strong>
                                    <span>{item.duration}</span>
                                </div>

                                <div className="info-box">
                                    <strong>Date</strong>
                                    <span>
                                        {item.created_at
                                            ? new Date(item.created_at).toLocaleDateString("en-IN")
                                            : "Today"}
                                    </span>
                                </div>

                            </div>
                            <div className="medicine-section">

                                <h4>
                                    💊 Medicines
                                </h4>

                                <div className="medicine-list">

                                    {(item.medicines || "")
                                        .split(",")

                                        .map((medicine, index) => (

                                            <span
                                                key={index}
                                                className="medicine-chip"
                                            >
                                                💊 {medicine.trim()}
                                            </span>

                                        ))}

                                </div>

                            </div>

                            <div className="dosage-section">

                                <div className="dosage-box">

                                    💊 {item.dosage}

                                </div>

                                <div className="duration-box">

                                    📅 {item.duration}

                                </div>

                            </div>

                            <div className="notes-box">

                                <strong>

                                    Doctor Notes

                                </strong>

                                <p>

                                    {item.notes ||
                                        "No additional notes."}

                                </p>

                            </div>
                            <div className="followup-card">

                                <h4>
                                    📅 Follow-up
                                </h4>

                                <p>

                                    Visit your doctor after
                                    completing the medicines.

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
                                        onClick={() =>
                                            window.print()
                                        }
                                    >
                                        🖨 Print
                                    </button>

                                    <button
                                        onClick={async () => {
                                            try {
                                                const token =
                                                    sessionStorage.getItem("token") ||
                                                    localStorage.getItem("token");
                                                const response = await fetch(
                                                    `${import.meta.env.VITE_API_URL}/prescriptions/${item.id}/pdf`,
                                                    {
                                                        headers: {
                                                            Authorization: `Bearer ${token}`,
                                                        },
                                                    }
                                                );

                                                if (!response.ok) {
                                                    throw new Error("Failed to download PDF");
                                                }

                                                const blob = await response.blob();

                                                const url = window.URL.createObjectURL(blob);

                                                const a = document.createElement("a");

                                                a.href = url;

                                                a.download = `Prescription-${item.id}.pdf`;

                                                document.body.appendChild(a);

                                                a.click();

                                                a.remove();

                                                window.URL.revokeObjectURL(url);
                                            } catch (err) {
                                                console.error(err);
                                                alert("Unable to download PDF.");
                                            }
                                        }}
                                    >
                                        ⬇ Download PDF
                                    </button>

                                </div>

                            </div>

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default PatientPrescriptions;