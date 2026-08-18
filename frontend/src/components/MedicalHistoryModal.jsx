import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const RAW_API =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

/*
 * Your production VITE_API_URL already contains /api.
 * Normalize it so we never create /api/api/...
 */
const API = RAW_API.replace(/\/api\/?$/, "");

const EMPTY_FORM = {
    previous_illnesses: "",
    surgeries: "",
    family_history: "",
    allergies: "",
    lifestyle: "",
    doctor_notes: "",
};

function MedicalHistoryModal({
    open,
    onClose,
    onSuccess,
    patientId,
    history,
}) {
    const [form, setForm] =
        useState(EMPTY_FORM);

    const [saving, setSaving] =
        useState(false);

    /*
     * Load existing history into the form
     * without copying database-only fields
     * such as id, patient_id, created_at, etc.
     */
    useEffect(() => {
        if (history) {
            setForm({
                previous_illnesses:
                    history.previous_illnesses ||
                    "",

                surgeries:
                    history.surgeries ||
                    "",

                family_history:
                    history.family_history ||
                    "",

                allergies:
                    history.allergies ||
                    "",

                lifestyle:
                    history.lifestyle ||
                    "",

                doctor_notes:
                    history.doctor_notes ||
                    "",
            });
        } else {
            setForm({
                ...EMPTY_FORM,
            });
        }
    }, [history, open]);

    if (!open) {
        return null;
    }

    function handleChange(e) {
        const {
            name,
            value,
        } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (saving) {
            return;
        }

        const token =
            localStorage.getItem(
                "token"
            );

        if (!token) {
            toast.error(
                "Your session has expired. Please login again."
            );
            return;
        }

        if (!history && !patientId) {
            toast.error(
                "Please select a patient first."
            );
            return;
        }

        try {
            setSaving(true);

            const headers = {
                Authorization:
                    `Bearer ${token}`,
                "Content-Type":
                    "application/json",
            };

            if (history) {
                /*
                 * EDIT
                 */
                await axios.put(
                    `${API}/api/patient-history/${history.id}`,
                    form,
                    {
                        headers,
                    }
                );

                toast.success(
                    "Medical history updated successfully."
                );
            } else {
                /*
                 * CREATE
                 */
                await axios.post(
                    `${API}/api/patient-history`,
                    {
                        patient_id:
                            patientId,
                        ...form,
                    },
                    {
                        headers,
                    }
                );

                toast.success(
                    "Medical history added successfully."
                );
            }

            /*
             * Refresh parent list.
             */
            if (
                typeof onSuccess ===
                "function"
            ) {
                await onSuccess();
            }

            /*
             * Close only after successful save.
             */
            if (
                typeof onClose ===
                "function"
            ) {
                onClose();
            }
        } catch (err) {
            console.error(
                "Medical history save error:",
                err
            );

            const message =
                err.response?.data
                    ?.message ||
                "Operation failed. Please try again.";

            toast.error(message);
        } finally {
            setSaving(false);
        }
    }

    function handleClose() {
        if (saving) {
            return;
        }

        setForm({
            ...EMPTY_FORM,
        });

        if (
            typeof onClose ===
            "function"
        ) {
            onClose();
        }
    }

    return (
        <div
            className="modal-overlay"
            onMouseDown={(e) => {
                /*
                 * Close when clicking the dark
                 * overlay, but not the modal itself.
                 */
                if (
                    e.target ===
                    e.currentTarget
                ) {
                    handleClose();
                }
            }}
        >
            <div
                className="history-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="medical-history-title"
            >
                {/* HEADER */}

                <div className="history-modal-header">
                    <div>
                        <h2 id="medical-history-title">
                            {history
                                ? "Edit Medical History"
                                : "Add Medical History"}
                        </h2>

                        <p>
                            {history
                                ? "Update the patient's medical information."
                                : "Add the patient's medical history."}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="modal-close-btn"
                        onClick={handleClose}
                        disabled={saving}
                        aria-label="Close"
                    >
                        ×
                    </button>
                </div>

                {/* FORM */}

                <form
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="history-form-grid">

                        <div className="history-form-field">
                            <label>
                                Previous Illnesses
                            </label>

                            <textarea
                                name="previous_illnesses"
                                placeholder="e.g. Asthma, Diabetes, Hypertension"
                                value={
                                    form.previous_illnesses
                                }
                                onChange={
                                    handleChange
                                }
                                rows="4"
                                disabled={saving}
                            />
                        </div>

                        <div className="history-form-field">
                            <label>
                                Surgeries
                            </label>

                            <textarea
                                name="surgeries"
                                placeholder="Enter previous surgeries"
                                value={
                                    form.surgeries
                                }
                                onChange={
                                    handleChange
                                }
                                rows="4"
                                disabled={saving}
                            />
                        </div>

                        <div className="history-form-field">
                            <label>
                                Family History
                            </label>

                            <textarea
                                name="family_history"
                                placeholder="Relevant family medical history"
                                value={
                                    form.family_history
                                }
                                onChange={
                                    handleChange
                                }
                                rows="4"
                                disabled={saving}
                            />
                        </div>

                        <div className="history-form-field">
                            <label>
                                Allergies
                            </label>

                            <textarea
                                name="allergies"
                                placeholder="e.g. Penicillin, Dust, Food allergies"
                                value={
                                    form.allergies
                                }
                                onChange={
                                    handleChange
                                }
                                rows="4"
                                disabled={saving}
                            />
                        </div>

                        <div className="history-form-field">
                            <label>
                                Lifestyle
                            </label>

                            <textarea
                                name="lifestyle"
                                placeholder="Smoking, alcohol, exercise, diet, etc."
                                value={
                                    form.lifestyle
                                }
                                onChange={
                                    handleChange
                                }
                                rows="4"
                                disabled={saving}
                            />
                        </div>

                        <div className="history-form-field">
                            <label>
                                Doctor Notes
                            </label>

                            <textarea
                                name="doctor_notes"
                                placeholder="Additional observations or notes"
                                value={
                                    form.doctor_notes
                                }
                                onChange={
                                    handleChange
                                }
                                rows="4"
                                disabled={saving}
                            />
                        </div>

                    </div>

                    {/* ACTIONS */}

                    <div className="modal-actions">

                        <button
                            type="button"
                            className="cancel-btn"
                            onClick={
                                handleClose
                            }
                            disabled={saving}
                        >
                            Cancel
                        </button>

                        <button
                            type="submit"
                            className="primary-btn"
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="modal-btn-spinner"></span>
                                    {history
                                        ? "Updating..."
                                        : "Saving..."}
                                </>
                            ) : (
                                history
                                    ? "Update History"
                                    : "Save History"
                            )}
                        </button>

                    </div>
                </form>
            </div>
        </div>
    );
}

export default MedicalHistoryModal;