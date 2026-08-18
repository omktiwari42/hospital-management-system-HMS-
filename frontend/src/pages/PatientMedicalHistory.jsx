import {
    useEffect,
    useMemo,
    useState,
} from "react";

import axios from "axios";

import { toast } from "react-toastify";

import {
    FaSearch,
    FaPlus,
    FaUserInjured,
    FaNotesMedical,
} from "react-icons/fa";

import MedicalHistoryCard from "../components/MedicalHistoryCard";
import MedicalHistorySkeleton from "../components/skeletons/MedicalHistorySkeleton";
import MedicalHistoryModal from "../components/MedicalHistoryModal";


/* =========================================
   API URL
========================================= */

const RAW_API =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000";

/*
 * VITE_API_URL in your deployed frontend is:
 *
 * https://hospital-backend-8pek.onrender.com/api
 *
 * So remove /api first and add it exactly once.
 */
const API = RAW_API.replace(
    /\/api\/?$/,
    ""
);


/* =========================================
   COMPONENT
========================================= */

function PatientMedicalHistory() {

    const [patients, setPatients] =
        useState([]);

    const [
        selectedPatient,
        setSelectedPatient,
    ] = useState("");

    const [history, setHistory] =
        useState([]);

    const [search, setSearch] =
        useState("");

    const [
        loadingPatients,
        setLoadingPatients,
    ] = useState(true);

    const [
        loadingHistory,
        setLoadingHistory,
    ] = useState(false);

    const [
        modalOpen,
        setModalOpen,
    ] = useState(false);

    const [
        editingHistory,
        setEditingHistory,
    ] = useState(null);


    /* =========================================
       FETCH PATIENTS
    ========================================= */

    useEffect(() => {
        fetchPatients();
    }, []);


    /* =========================================
       FETCH HISTORY WHEN PATIENT CHANGES
    ========================================= */

    useEffect(() => {

        if (selectedPatient) {

            fetchHistory(
                selectedPatient
            );

        } else {

            setHistory([]);

        }

    }, [selectedPatient]);


    /* =========================================
       GET TOKEN
    ========================================= */

    function getToken() {

        return localStorage.getItem(
            "token"
        );

    }


    /* =========================================
       FETCH PATIENTS
    ========================================= */

    async function fetchPatients() {

        try {

            setLoadingPatients(
                true
            );

            const token =
                getToken();


            if (!token) {

                toast.error(
                    "Please login again."
                );

                return;

            }


            const res =
                await axios.get(
                    `${API}/api/patients`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            setPatients(
                Array.isArray(
                    res.data
                )
                    ? res.data
                    : []
            );

        } catch (err) {

            console.error(
                "Fetch patients error:",
                err
            );

            toast.error(
                err.response?.data
                    ?.message ||
                "Unable to load patients."
            );

        } finally {

            setLoadingPatients(
                false
            );

        }

    }


    /* =========================================
       FETCH MEDICAL HISTORY
    ========================================= */

    async function fetchHistory(
        patientId
    ) {

        try {

            setLoadingHistory(
                true
            );


            const token =
                getToken();


            if (!token) {

                toast.error(
                    "Please login again."
                );

                return;

            }


            const res =
                await axios.get(
                    `${API}/api/patient-history/${patientId}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            setHistory(
                Array.isArray(
                    res.data
                )
                    ? res.data
                    : []
            );

        } catch (err) {

            console.error(
                "Fetch medical history error:",
                err
            );

            setHistory([]);

            toast.error(
                err.response?.data
                    ?.message ||
                "Unable to load medical history."
            );

        } finally {

            setLoadingHistory(
                false
            );

        }

    }


    /* =========================================
       SEARCH
    ========================================= */

    const filteredHistory =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();


            if (!query) {

                return history;

            }


            return history.filter(
                (item) => {

                    const text = [

                        item.previous_illnesses,

                        item.surgeries,

                        item.family_history,

                        item.allergies,

                        item.lifestyle,

                        item.doctor_notes,

                    ]
                        .filter(Boolean)
                        .join(" ")
                        .toLowerCase();


                    return text.includes(
                        query
                    );

                }
            );

        }, [
            history,
            search,
        ]);


    /* =========================================
       OPEN ADD MODAL
    ========================================= */

    function handleAddHistory() {

        if (!selectedPatient) {

            toast.warning(
                "Please select a patient first."
            );

            return;

        }


        setEditingHistory(
            null
        );

        setModalOpen(
            true
        );

    }


    /* =========================================
       OPEN EDIT MODAL
    ========================================= */

    function handleEditHistory(
        item
    ) {

        setEditingHistory(
            item
        );

        setModalOpen(
            true
        );

    }


    /* =========================================
       CLOSE MODAL
    ========================================= */

    function handleCloseModal() {

        setModalOpen(
            false
        );

        setEditingHistory(
            null
        );

    }


    /* =========================================
       AFTER CREATE / UPDATE
    ========================================= */

    async function handleHistorySuccess() {

        if (
            selectedPatient
        ) {

            await fetchHistory(
                selectedPatient
            );

        }

    }


    /* =========================================
       SELECT PATIENT
    ========================================= */

    function handlePatientChange(
        e
    ) {

        const patientId =
            e.target.value;


        setSelectedPatient(
            patientId
        );

        setSearch("");

    }


    /* =========================================
       UI
    ========================================= */

    return (

        <div className="medical-history-page">


            {/* =================================
                HEADER
            ================================= */}

            <div className="page-header">

                <div>

                    <h1>

                        <FaNotesMedical />

                        Patient Medical History

                    </h1>


                    <p>
                        Manage illnesses,
                        surgeries, allergies,
                        lifestyle and
                        complete patient
                        history.
                    </p>

                </div>


                <button
                    type="button"
                    className="primary-btn"
                    onClick={
                        handleAddHistory
                    }
                >

                    <FaPlus />

                    Add History

                </button>

            </div>


            {/* =================================
                TOOLBAR
            ================================= */}

            <div className="history-toolbar">


                {/* SEARCH */}

                <div className="search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search history..."
                        value={
                            search
                        }
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                        disabled={
                            !selectedPatient ||
                            loadingHistory
                        }
                    />

                </div>


                {/* PATIENT SELECT */}

                <div className="patient-select">

                    <FaUserInjured />

                    <select
                        value={
                            selectedPatient
                        }
                        onChange={
                            handlePatientChange
                        }
                        disabled={
                            loadingPatients
                        }
                    >

                        <option value="">
                            {loadingPatients
                                ? "Loading Patients..."
                                : "Select Patient"}
                        </option>


                        {patients.map(
                            (
                                patient
                            ) => (

                                <option
                                    key={
                                        patient.id
                                    }
                                    value={
                                        patient.id
                                    }
                                >

                                    {patient.name}

                                </option>

                            )
                        )}

                    </select>

                </div>

            </div>


            {/* =================================
                CURRENT PATIENT INFO
            ================================= */}

            {selectedPatient && (

                <div className="history-selected-patient">

                    <strong>
                        Selected Patient:
                    </strong>

                    <span>

                        {
                            patients.find(
                                (patient) =>
                                    String(
                                        patient.id
                                    ) ===
                                    String(
                                        selectedPatient
                                    )
                            )?.name ||
                            "Patient"
                        }

                    </span>

                </div>

            )}


            {/* =================================
                CONTENT
            ================================= */}

            {loadingPatients ||
                loadingHistory ? (

                <MedicalHistorySkeleton />

            ) : !selectedPatient ? (

                <div className="empty-history">

                    <div
                        style={{
                            fontSize:
                                "48px",
                            marginBottom:
                                "12px",
                        }}
                    >
                        🩺
                    </div>

                    <h2>
                        Select a Patient
                    </h2>

                    <p>
                        Select a patient
                        above to view
                        their medical
                        history.
                    </p>

                </div>

            ) : filteredHistory.length ===
                0 ? (

                <div className="empty-history">

                    <div
                        style={{
                            fontSize:
                                "48px",
                            marginBottom:
                                "12px",
                        }}
                    >
                        📋
                    </div>

                    <h2>
                        No Medical History Found
                    </h2>

                    <p>
                        {search
                            ? "No history matches your search."
                            : "This patient does not have any medical history yet."}
                    </p>


                    {!search && (

                        <button
                            type="button"
                            className="primary-btn"
                            onClick={
                                handleAddHistory
                            }
                        >

                            <FaPlus />

                            Add History

                        </button>

                    )}


                    {search && (

                        <button
                            type="button"
                            className="secondary-btn"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            Clear Search
                        </button>

                    )}

                </div>

            ) : (

                <div className="history-grid">

                    {filteredHistory.map(
                        (item) => (

                            <MedicalHistoryCard
                                key={
                                    item.id
                                }

                                history={
                                    item
                                }

                                onRefresh={() =>
                                    fetchHistory(
                                        selectedPatient
                                    )
                                }

                                onEdit={() =>
                                    handleEditHistory(
                                        item
                                    )
                                }

                            />

                        )
                    )}

                </div>

            )}


            {/* =================================
                MEDICAL HISTORY MODAL
            ================================= */}

            <MedicalHistoryModal

                open={
                    modalOpen
                }

                onClose={
                    handleCloseModal
                }

                onSuccess={
                    handleHistorySuccess
                }

                patientId={
                    selectedPatient
                }

                history={
                    editingHistory
                }

            />

        </div>

    );
}


export default PatientMedicalHistory;