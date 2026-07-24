import { useEffect, useState } from "react";
import api from "../services/api";
import PrescriptionSkeleton from "../components/PrescriptionSkeleton";

function PatientPrescriptions() {
    const [loading, setLoading] = useState(true);
    const [prescriptions, setPrescriptions] = useState([]);
    const [search, setSearch] = useState("");

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

                                <span className="status-badge">
                                    Active
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

                            <div className="medicine-section">

                                <h4>
                                    💊 Medicines
                                </h4>

                                <div className="medicine-chip">

                                    {item.medicines}

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
                                        onClick={() => {
                                            const blob = new Blob(
                                                [
                                                    `
Prescription #${item.id}

Doctor : ${item.doctor_name || item.doctor_id}

Medicines :
${item.medicines}

Dosage :
${item.dosage}

Duration :
${item.duration}

Notes :
${item.notes}
`
                                                ],
                                                {
                                                    type: "text/plain"
                                                }
                                            );

                                            const url =
                                                URL.createObjectURL(blob);

                                            const a =
                                                document.createElement("a");

                                            a.href = url;

                                            a.download =
                                                `Prescription-${item.id}.txt`;

                                            a.click();

                                            URL.revokeObjectURL(url);

                                        }}
                                    >
                                        ⬇ Download
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