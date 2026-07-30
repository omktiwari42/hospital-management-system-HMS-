return (
    <>
        <div className="medical-history-page">

            <div className="page-header">

                <div>
                    <h1>
                        <FaNotesMedical />
                        Patient Medical History
                    </h1>

                    <p>
                        Manage illnesses, surgeries, allergies,
                        lifestyle and complete patient history.
                    </p>
                </div>

                <button
                    className="primary-btn"
                    onClick={() => {
                        if (!selectedPatient) {
                            toast.warning("Please select a patient first.");
                            return;
                        }

                        setEditingHistory(null);
                        setModalOpen(true);
                    }}
                >
                    <FaPlus />
                    Add History
                </button>

            </div>

            <div className="history-toolbar">

                <div className="search-box">
                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search history..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="patient-select">

                    <FaUserInjured />

                    <select
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                    >
                        <option value="">
                            Select Patient
                        </option>

                        {patients.map((patient) => (
                            <option
                                key={patient.id}
                                value={patient.id}
                            >
                                {patient.name}
                            </option>
                        ))}
                    </select>

                </div>

            </div>

            {loadingPatients || loadingHistory ? (
                <MedicalHistorySkeleton />
            ) : filteredHistory.length === 0 ? (
                <div className="empty-history">
                    No medical history found.
                </div>
            ) : (
                <div className="history-grid">

                    {filteredHistory.map((item) => (
                        <MedicalHistoryCard
                            key={item.id}
                            history={item}
                            onRefresh={() =>
                                fetchHistory(selectedPatient)
                            }
                            onEdit={(record) => {
                                setEditingHistory(record);
                                setModalOpen(true);
                            }}
                        />
                    ))}

                </div>
            )}

        </div>

        <MedicalHistoryModal
            open={modalOpen}
            history={editingHistory}
            patientId={selectedPatient}
            onClose={() => setModalOpen(false)}
            onSuccess={() => fetchHistory(selectedPatient)}
        />
    </>
);



export default PatientMedicalHistory;