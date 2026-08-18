import axios from "axios";
import { toast } from "react-toastify";

import {
    FaUserMd,
    FaHeartbeat,
    FaAllergies,
    FaTrash,
    FaEdit,
    FaNotesMedical,
} from "react-icons/fa";


/* =========================================
   API URL
========================================= */

const RAW_API =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

/*
 * Prevent:
 * /api/api/patient-history/...
 */
const API = RAW_API.replace(
    /\/api\/?$/,
    ""
);


function MedicalHistoryCard({
    history,
    onRefresh,
    onEdit,
}) {

    const token =
        localStorage.getItem("token");


    /* =========================================
       DELETE
    ========================================= */

    async function handleDelete() {

        const confirmDelete =
            window.confirm(
                "Delete this medical history?\n\nThis action cannot be undone."
            );

        if (!confirmDelete) {
            return;
        }


        if (!token) {

            toast.error(
                "Your session has expired. Please login again."
            );

            return;

        }


        try {

            await axios.delete(
                `${API}/api/patient-history/${history.id}`,
                {
                    headers: {
                        Authorization:
                            `Bearer ${token}`,
                    },
                }
            );


            toast.success(
                "Medical history deleted successfully."
            );


            if (
                typeof onRefresh ===
                "function"
            ) {
                await onRefresh();
            }

        } catch (err) {

            console.error(
                "Delete medical history error:",
                err
            );


            toast.error(
                err.response?.data
                    ?.message ||
                "Unable to delete medical history."
            );

        }

    }


    /* =========================================
       EDIT
    ========================================= */

    function handleEdit() {

        if (
            typeof onEdit ===
            "function"
        ) {

            onEdit(history);

            return;

        }


        toast.info(
            "Edit action is not available."
        );

    }


    /* =========================================
       UI
    ========================================= */

    return (

        <div className="history-card">


            {/* =================================
                HEADER
            ================================= */}

            <div className="history-card-header">

                <div className="history-icon">
                    <FaNotesMedical />
                </div>


                <div className="history-actions">

                    <button
                        type="button"
                        className="edit-btn"
                        title="Edit Medical History"
                        aria-label="Edit Medical History"
                        onClick={
                            handleEdit
                        }
                    >
                        <FaEdit />
                    </button>


                    <button
                        type="button"
                        className="delete-btn"
                        title="Delete Medical History"
                        aria-label="Delete Medical History"
                        onClick={
                            handleDelete
                        }
                    >
                        <FaTrash />
                    </button>

                </div>

            </div>


            {/* =================================
                BODY
            ================================= */}

            <div className="history-body">


                {/* PREVIOUS ILLNESSES */}

                <div className="history-item">

                    <FaHeartbeat />

                    <div>

                        <h4>
                            Previous Illnesses
                        </h4>

                        <p>
                            {history.previous_illnesses ||
                                "-"}
                        </p>

                    </div>

                </div>


                {/* SURGERIES */}

                <div className="history-item">

                    <FaUserMd />

                    <div>

                        <h4>
                            Surgeries
                        </h4>

                        <p>
                            {history.surgeries ||
                                "-"}
                        </p>

                    </div>

                </div>


                {/* FAMILY HISTORY */}

                <div className="history-item">

                    <FaHeartbeat />

                    <div>

                        <h4>
                            Family History
                        </h4>

                        <p>
                            {history.family_history ||
                                "-"}
                        </p>

                    </div>

                </div>


                {/* ALLERGIES */}

                <div className="history-item">

                    <FaAllergies />

                    <div>

                        <h4>
                            Allergies
                        </h4>

                        <p>
                            {history.allergies ||
                                "-"}
                        </p>

                    </div>

                </div>


                {/* LIFESTYLE */}

                <div className="history-item">

                    <FaHeartbeat />

                    <div>

                        <h4>
                            Lifestyle
                        </h4>

                        <p>
                            {history.lifestyle ||
                                "-"}
                        </p>

                    </div>

                </div>


                {/* DOCTOR NOTES */}

                <div className="history-item">

                    <FaNotesMedical />

                    <div>

                        <h4>
                            Doctor Notes
                        </h4>

                        <p>
                            {history.doctor_notes ||
                                "-"}
                        </p>

                    </div>

                </div>

            </div>

        </div>

    );
}


export default MedicalHistoryCard;