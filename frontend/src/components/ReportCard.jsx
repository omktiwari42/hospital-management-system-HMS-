import {
    FaFilePdf,
    FaImage,
    FaDownload,
    FaEye,
    FaTrash,
} from "react-icons/fa";

import { toast } from "react-toastify";

import api from "../services/api";


function ReportCard({
    report,
    onDelete,
    canDelete = true,
}) {

    const isPdf =
        String(
            report.file || ""
        )
            .toLowerCase()
            .endsWith(".pdf");


    /* =========================
       FILE URL
    ========================= */

    const rawApiUrl =
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000/api";

    const baseUrl =
        rawApiUrl.replace(
            /\/api\/?$/,
            ""
        );


    const fileUrl =
        report.file
            ? `${baseUrl}/uploads/${encodeURIComponent(
                report.file
            )}`
            : "#";


    /* =========================
       DELETE
    ========================= */

    async function deleteReport() {

        if (!canDelete) {
            return;
        }


        const confirmed =
            window.confirm(
                "Are you sure you want to delete this medical report?"
            );


        if (!confirmed) {
            return;
        }


        try {

            await api.delete(
                `/reports/${report.id}`
            );


            toast.success(
                "Medical report deleted successfully."
            );


            if (
                typeof onDelete ===
                "function"
            ) {
                await onDelete();
            }

        } catch (err) {

            console.error(
                "Delete report error:",
                err
            );


            toast.error(
                err.response?.data
                    ?.message ||
                "Failed to delete medical report."
            );

        }
    }


    return (
        <div className="report-card">


            {/* =========================
                HEADER
            ========================= */}

            <div className="report-header">

                <div className="report-icon">

                    {isPdf
                        ? <FaFilePdf />
                        : <FaImage />
                    }

                </div>


                <div>

                    <h3>
                        {report.patient_name ||
                            "Patient"}
                    </h3>


                    <p>
                        {report.file ||
                            "No report uploaded"}
                    </p>

                </div>

            </div>


            {/* =========================
                ACTIONS
            ========================= */}

            <div className="report-actions">

                <a
                    href={fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="view-btn"
                    aria-label="View report"
                >
                    <FaEye />
                    <span>
                        View
                    </span>
                </a>


                <a
                    href={fileUrl}
                    download
                    className="download-btn"
                    aria-label="Download report"
                >
                    <FaDownload />
                    <span>
                        Download
                    </span>
                </a>


                {canDelete && (

                    <button
                        type="button"
                        className="delete-btn"
                        onClick={
                            deleteReport
                        }
                        aria-label="Delete report"
                    >
                        <FaTrash />

                        <span>
                            Delete
                        </span>
                    </button>

                )}

            </div>

        </div>
    );
}


export default ReportCard;