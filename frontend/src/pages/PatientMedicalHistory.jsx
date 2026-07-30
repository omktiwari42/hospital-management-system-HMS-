import { useEffect, useMemo, useState } from "react";
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



const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

function PatientMedicalHistory() {
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState("");
    const [history, setHistory] = useState([]);
    const [search, setSearch] = useState("");

    const [loadingPatients, setLoadingPatients] = useState(true);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        if (selectedPatient) {
            fetchHistory(selectedPatient);
        } else {
            setHistory([]);
        }
    }, [selectedPatient]);

    const token = localStorage.getItem("token");

    const fetchPatients = async () => {
        try {
            setLoadingPatients(true);

            const res = await axios.get(
                `${API}/api/patients`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setPatients(res.data);
        } catch (err) {
            console.log(err);
            toast.error("Unable to load patients");
        } finally {
            setLoadingPatients(false);
        }
    };

    const fetchHistory = async (patientId) => {
        try {
            setLoadingHistory(true);

            const res = await axios.get(
                `${API}/api/patient-history/${patientId}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setHistory(res.data);
        } catch (err) {
            console.log(err);
            toast.error("Unable to load medical history");
        } finally {
            setLoadingHistory(false);
        }
    };

    const filteredHistory = useMemo(() => {
        return history.filter((item) => {
            const text = (
                item.previous_illnesses +
                item.surgeries +
                item.family_history +
                item.allergies +
                item.lifestyle +
                item.doctor_notes
            )
                .toLowerCase();

            return text.includes(search.toLowerCase());
        });
    }, [history, search]);

    return (
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

                <button className="primary-btn">
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
                        onChange={(e) =>
                            setSearch(e.target.value)
                        }
                    />

                </div>

                <div className="patient-select">

                    <FaUserInjured />

                    <select
                        value={selectedPatient}
                        onChange={(e) =>
                            setSelectedPatient(e.target.value)
                        }
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
                        />
                    ))}

                </div>
            )}

        </div>
    );
}

export default PatientMedicalHistory;