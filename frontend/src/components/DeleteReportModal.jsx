function DeleteReportModal({
    open,
    loading,
    onCancel,
    onConfirm,
    patientName,
}) {
    if (!open) return null;

    return (
        <div className="modal-overlay">
            <div className="delete-modal">

                <div className="delete-icon">
                    ⚠️
                </div>

                <h2>Delete Medical Report</h2>

                <p>
                    Are you sure you want to delete
                    <strong> {patientName}</strong>'s
                    medical report?
                </p>

                <div className="delete-actions">
                    <button
                        className="cancel-btn"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button
                        className="delete-btn"
                        onClick={onConfirm}
                        disabled={loading}
                    >
                        {loading
                            ? "Deleting..."
                            : "Delete"}
                    </button>
                </div>

            </div>
        </div>
    );
}

export default DeleteReportModal;