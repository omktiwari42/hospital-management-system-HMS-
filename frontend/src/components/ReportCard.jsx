import {
    FaFilePdf,
    FaImage,
    FaDownload,
    FaEye,
    FaTrash,
} from "react-icons/fa";
import { toast } from "sonner";
import api from "../services/api";

function ReportCard({ report }) {
    const isPdf = report.file
        ?.toLowerCase()
        .endsWith(".pdf");

    const fileUrl = `${import.meta.env.VITE_API_URL.replace("/api", "")
        }/uploads/${report.file}`;

    async function deleteReport() {
        const confirmed = window.confirm(
            "Delete this medical report?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/reports/${report.id}`);

            toast.success(
                "Medical report deleted successfully."
            );

            window.location.reload();
        } catch (err) {
            console.error(err);

            toast.error(
                "Failed to delete report."
            );
        }
    }

    return (
        <div className="report-card">
            <div className="report-header">
                <div className="report-icon">
                    {isPdf ? (
                        <FaFilePdf />
                    ) : (
                        <FaImage />
                    )}
                </div>

                <div>
                    <h3>{report.patient_name}</h3>

                    <p>
                        {report.file}
                    </p>
                </div>
            </div>

            <div className="report-actions">
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="view-btn"
                >
                    <FaEye />
                    View
                </a>

                <a
                    href={fileUrl}
                    download
                    className="download-btn"
                >
                    <FaDownload />
                    Download
                </a>

                <button
                    className="delete-btn"
                    onClick={deleteReport}
                >
                    <FaTrash />
                    Delete
                </button>
            </div>
        </div>
    );
}

export default ReportCard;