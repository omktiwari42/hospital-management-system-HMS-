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

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function MedicalHistoryCard({
    history,
    onRefresh,
}) {
    const token = localStorage.getItem("token");

    const handleDelete = async () => {
        const confirmDelete = window.confirm(
            "Delete this medical history?"
        );

        if (!confirmDelete) return;

        try {
            await axios.delete(
                `${API}/api/patient-history/${history.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            toast.success(
                "Medical history deleted successfully."
            );

            onRefresh();

        } catch (err) {
            console.log(err);

            toast.error(
                "Unable to delete medical history."
            );
        }
    };

    return (
        <div className="history-card">

            <div className="history-card-header">

                <div className="history-icon">
                    <FaNotesMedical />
                </div>

                <div className="history-actions">

                    <button
                        className="edit-btn"
                        title="Edit"
                    >
                        <FaEdit />
                    </button>

                    <button
                        className="delete-btn"
                        title="Delete"
                        onClick={handleDelete}
                    >
                        <FaTrash />
                    </button>

                </div>

            </div>

            <div className="history-body">

                <div className="history-item">
                    <FaHeartbeat />
                    <div>
                        <h4>Previous Illnesses</h4>
                        <p>
                            {history.previous_illnesses || "-"}
                        </p>
                    </div>
                </div>

                <div className="history-item">
                    <FaUserMd />
                    <div>
                        <h4>Surgeries</h4>
                        <p>
                            {history.surgeries || "-"}
                        </p>
                    </div>
                </div>

                <div className="history-item">
                    <FaHeartbeat />
                    <div>
                        <h4>Family History</h4>
                        <p>
                            {history.family_history || "-"}
                        </p>
                    </div>
                </div>

                <div className="history-item">
                    <FaAllergies />
                    <div>
                        <h4>Allergies</h4>
                        <p>
                            {history.allergies || "-"}
                        </p>
                    </div>
                </div>

                <div className="history-item">
                    <FaHeartbeat />
                    <div>
                        <h4>Lifestyle</h4>
                        <p>
                            {history.lifestyle || "-"}
                        </p>
                    </div>
                </div>

                <div className="history-item">
                    <FaNotesMedical />
                    <div>
                        <h4>Doctor Notes</h4>
                        <p>
                            {history.doctor_notes || "-"}
                        </p>
                    </div>
                </div>

            </div>

        </div>
    );
}

export default MedicalHistoryCard;