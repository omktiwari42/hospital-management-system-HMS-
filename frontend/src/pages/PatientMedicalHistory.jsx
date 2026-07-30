import "../styles/patientMedicalHistory.css";

function PatientMedicalHistory() {
    return (
        <div className="page">
            <div className="page-header">
                <h1>📋 Patient Medical History</h1>
            </div>

            <div className="card">
                <h2>Medical History</h2>
                <p>
                    View and manage each patient's medical history, previous illnesses,
                    surgeries, family history, and lifestyle information.
                </p>
            </div>
        </div>
    );
}

export default PatientMedicalHistory;