import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ReportCard from "../components/ReportCard";
import MedicalReportsSkeleton from "../components/skeletons/MedicalReportsSkeleton";

function MedicalReports() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [filteredReports, setFilteredReports] = useState([]);
    const [patients, setPatients] = useState([]);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [selectedPatient, setSelectedPatient] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        loadReports();
        loadPatients();
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

    async function loadPatients() {
        try {
            const res = await api.get("/patients");
            setPatients(res.data);
        } catch (err) {
            console.error(err);
        }
    }

    async function uploadReport() {
        if (!selectedPatient || !selectedFile) {
            alert("Please select a patient and a report.");
            return;
        }

        try {
            setUploading(true);

            const formData = new FormData();

            formData.append("report", selectedFile);

            await api.post(
                `/upload-report/${selectedPatient}`,
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert("Report uploaded successfully.");

            setSelectedPatient("");
            setSelectedFile(null);

            loadReports();
        } catch (err) {
            console.error(err);
            alert("Upload failed.");
        } finally {
            setUploading(false);
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

            <div className="card">
                <h2>Upload Medical Report</h2>

                <select
                    value={selectedPatient}
                    onChange={(e) =>
                        setSelectedPatient(e.target.value)
                    }
                >
                    <option value="">
                        Select Patient
                    </option>

                    {patients.map((patient) => (
                        <option
                            key={patient.id}
                            value={patient.id}
                        >
                            {patient.name}
                        </option>
                    ))}
                </select>

                <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) =>
                        setSelectedFile(e.target.files[0])
                    }
                />

                <button
                    className="save-btn"
                    onClick={uploadReport}
                    disabled={uploading}
                >
                    {uploading
                        ? "Uploading..."
                        : "Upload Report"}
                </button>
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