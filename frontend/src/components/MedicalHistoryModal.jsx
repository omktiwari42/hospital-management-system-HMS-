import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function MedicalHistoryModal({
    open,
    onClose,
    onSuccess,
    patientId,
    history,
}) {
    const token = localStorage.getItem("token");

    const [form, setForm] = useState({
        previous_illnesses: "",
        surgeries: "",
        family_history: "",
        allergies: "",
        lifestyle: "",
        doctor_notes: "",
    });

    useEffect(() => {
        if (history) {
            setForm(history);
        } else {
            setForm({
                previous_illnesses: "",
                surgeries: "",
                family_history: "",
                allergies: "",
                lifestyle: "",
                doctor_notes: "",
            });
        }
    }, [history]);

    if (!open) return null;

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            if (history) {
                await axios.put(
                    `${API}/api/patient-history/${history.id}`,
                    form,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                toast.success("Medical history updated.");
            } else {
                await axios.post(
                    `${API}/api/patient-history`,
                    {
                        patient_id: patientId,
                        ...form,
                    },
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                toast.success("Medical history added.");
            }

            onSuccess();
            onClose();

        } catch (err) {
            console.log(err);
            toast.error("Operation failed.");
        }
    };

    return (
        <div className="modal-overlay">
            <div className="history-modal">

                <h2>
                    {history
                        ? "Edit Medical History"
                        : "Add Medical History"}
                </h2>

                <form onSubmit={handleSubmit}>

                    <textarea
                        name="previous_illnesses"
                        placeholder="Previous Illnesses"
                        value={form.previous_illnesses}
                        onChange={handleChange}
                    />

                    <textarea
                        name="surgeries"
                        placeholder="Surgeries"
                        value={form.surgeries}
                        onChange={handleChange}
                    />

                    <textarea
                        name="family_history"
                        placeholder="Family History"
                        value={form.family_history}
                        onChange={handleChange}
                    />

                    <textarea
                        name="allergies"
                        placeholder="Allergies"
                        value={form.allergies}
                        onChange={handleChange}
                    />

                    <textarea
                        name="lifestyle"
                        placeholder="Lifestyle"
                        value={form.lifestyle}
                        onChange={handleChange}
                    />

                    <textarea
                        name="doctor_notes"
                        placeholder="Doctor Notes"
                        value={form.doctor_notes}
                        onChange={handleChange}
                    />

                    <div className="modal-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-btn"
                        >
                            {history ? "Update" : "Save"}
                        </button>

                    </div>

                </form>

            </div>
        </div>
    );
}

export default MedicalHistoryModal;