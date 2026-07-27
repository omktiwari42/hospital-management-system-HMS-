import { FaFilePdf, FaImage, FaDownload, FaEye, FaTrash } from "react-icons/fa";

function ReportCard({ report }) {
    const isPdf = report.file?.toLowerCase().endsWith(".pdf");

    const fileUrl = `${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${report.file}`;

    return (
        <div className="report-card">
            <div className="report-header">
                <div className="report-icon">
                    {isPdf ? <FaFilePdf /> : <FaImage />}
                </div>

                <div>
                    <h3>{report.patient_name}</h3>
                    <p>{report.created_at || "Recently Uploaded"}</p>
                </div>
            </div>

            <div className="report-info">
                <p>
                    <strong>Report:</strong> {report.file}
                </p>
            </div>

            <div className="report-actions">
                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="view-btn"
                >
                    <FaEye /> View
                </a>

                <a
                    href={fileUrl}
                    download
                    className="download-btn"
                >
                    <FaDownload /> Download
                </a>

                <button
                    className="delete-btn"
                    type="button"
                >
                    <FaTrash /> Delete
                </button>
            </div>
        </div>
    );
}

export default ReportCard;