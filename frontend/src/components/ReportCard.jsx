import {
    FaFilePdf,
    FaImage,
    FaDownload,
    FaEye,
    FaTrash,
} from "react-icons/fa";
import { toast } from "react-toastify";
import api from "../services/api";

function ReportCard({ report, onDelete }) {
    const isPdf = report.file?.toLowerCase().endsWith(".pdf");

    const apiUrl =
        import.meta.env.VITE_API_URL || "http://localhost:5000/api";

    const baseUrl = apiUrl.replace("/api", "");

    const fileUrl = report.file
        ? `${baseUrl}/uploads/${encodeURIComponent(report.file)}`
        : "#";

    async function deleteReport() {
        const confirmed = window.confirm(
            "Are you sure you want to delete this medical report?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/reports/${report.id}`);

            toast.success("Medical report deleted successfully.");

            if (onDelete) {
                await onDelete();
            }
        } catch (err) {
            console.error(err);

            toast.error(
                err.response?.data?.message ||
                "Failed to delete medical report."
            );
        }
    }

    return (
        <div className="report-card">
            <div className="report-header">
                <div className="report-icon">
                    {isPdf ? <FaFilePdf /> : <FaImage />}
                </div>

                <div>
                    <h3>{report.patient_name}</h3>
                    <p>{report.file || "No report uploaded"}</p>
                </div>
            </div>

            <div className="report-actions">
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-btn"
                >
                    <FaEye />
                    <span>View</span>
                </a>

                <a
                    href={fileUrl}
                    download
                    className="download-btn"
                >
                    <FaDownload />
                    <span>Download</span>
                </a>

                <button
                    type="button"
                    className="delete-btn"
                    onClick={deleteReport}
                >
                    <FaTrash />
                    <span>Delete</span>
                </button>
            </div>
        </div>
    );
}

export default ReportCard;