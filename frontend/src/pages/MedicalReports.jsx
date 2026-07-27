import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ReportCard from "../components/ReportCard";
import MedicalReportsSkeleton from "../components/skeletons/MedicalReportsSkeleton";

function MedicalReports() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadReports();
    }, []);

    useEffect(() => {
        const filtered = reports.filter((report) =>
            (report.patient_name || "")
                .toLowerCase()
                .includes(search.toLowerCase())
        );

        setFilteredReports(filtered);
    }, [search, reports]);

    async function loadReports() {
        try {
            setLoading(true);

            const res = await api.get("/reports");

            setReports(res.data);
            setFilteredReports(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return <MedicalReportsSkeleton />;
    }

    return (
        <div className="page">
            <div className="page-header">
                <button
                    className="back-btn"
                    onClick={() => navigate(-1)}
                >
                    ← Back
                </button>

                <h1>📁 Medical Reports</h1>
            </div>

            <div className="card">
                <input
                    type="text"
                    placeholder="🔍 Search Patient..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="reports-grid">
                {filteredReports.length === 0 ? (
                    <p>No reports found.</p>
                ) : (
                    filteredReports.map((report) => (
                        <ReportCard
                            key={report.id}
                            report={report}
                        />
                    ))
                )}
            </div>
        </div>
    );
}

export default MedicalReports;