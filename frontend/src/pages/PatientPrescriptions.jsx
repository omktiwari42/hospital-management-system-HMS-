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
            item.medicines?.toLowerCase().includes(search.toLowerCase()) ||
            item.notes?.toLowerCase().includes(search.toLowerCase())
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
                    <p>View medicines prescribed by your doctors.</p>
                </div>

                <input
                    className="prescription-search"
                    placeholder="Search medicine..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {filtered.length === 0 ? (
                <div className="empty-prescription">
                    <h2>No Prescriptions Found</h2>
                    <p>Your prescriptions will appear here.</p>
                </div>
            ) : (
                <div className="prescription-grid">

                    {filtered.map((item) => (
                        <div
                            className="prescription-card"
                            key={item.id}
                        >
                            <div className="prescription-top">
                                <h2>Prescription #{item.id}</h2>

                                <span className="status-badge">
                                    Active
                                </span>
                            </div>

                            <div className="prescription-row">
                                <strong>Doctor ID</strong>
                                <span>{item.doctor_id}</span>
                            </div>

                            <div className="prescription-row">
                                <strong>Medicines</strong>
                                <span>{item.medicines}</span>
                            </div>

                            <div className="prescription-row">
                                <strong>Dosage</strong>
                                <span>{item.dosage}</span>
                            </div>

                            <div className="prescription-row">
                                <strong>Duration</strong>
                                <span>{item.duration}</span>
                            </div>

                            <div className="notes-box">
                                <strong>Doctor Notes</strong>
                                <p>{item.notes}</p>
                            </div>

                            <div className="prescription-buttons">
                                <button>
                                    Preview PDF
                                </button>

                                <button>
                                    Download PDF
                                </button>
                            </div>

                        </div>
                    ))}

                </div>
            )}

        </div>
    );
}

export default PatientPrescriptions;