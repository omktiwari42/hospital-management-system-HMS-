import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    FaArrowLeft,
    FaSearch,
    FaUserMd,
} from "react-icons/fa";

import api from "../services/api";
import DoctorsSkeleton from "../components/skeletons/DoctorsSkeleton";

function PatientDoctors() {
    const navigate = useNavigate();

    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [specialization, setSpecialization] =
        useState("");

    useEffect(() => {
        loadDoctors();
    }, []);

    async function loadDoctors() {
        try {
            setLoading(true);
            setError("");

            const response =
                await api.get("/doctors");

            const data =
                Array.isArray(response.data)
                    ? response.data
                    : [];

            setDoctors(data);
        } catch (err) {
            console.error(
                "Patient doctors error:",
                err
            );

            setError(
                err.response?.data?.message ||
                "Unable to load doctors."
            );
        } finally {
            setLoading(false);
        }
    }

    const specializations = useMemo(() => {
        return [
            ...new Set(
                doctors
                    .map(
                        (doctor) =>
                            doctor.specialization
                    )
                    .filter(Boolean)
            ),
        ].sort();
    }, [doctors]);

    const filteredDoctors = useMemo(() => {
        const query =
            search.trim().toLowerCase();

        return doctors.filter((doctor) => {
            const doctorName =
                String(
                    doctor.name || ""
                ).toLowerCase();

            const doctorSpecialization =
                String(
                    doctor.specialization || ""
                ).toLowerCase();

            const doctorExperience =
                String(
                    doctor.experience || ""
                ).toLowerCase();

            const matchesSearch =
                !query ||
                doctorName.includes(query) ||
                doctorSpecialization.includes(
                    query
                ) ||
                doctorExperience.includes(query);

            const matchesSpecialization =
                !specialization ||
                doctor.specialization ===
                specialization;

            return (
                matchesSearch &&
                matchesSpecialization
            );
        });
    }, [
        doctors,
        search,
        specialization,
    ]);

    function bookAppointment(doctor) {
        navigate(
            "/book-appointment",
            {
                state: {
                    doctorName: doctor.name,
                    doctorId: doctor.id,
                },
            }
        );
    }

    if (loading) {
        return <DoctorsSkeleton />;
    }

    if (error) {
        return (
            <div className="patient-doctors-page">
                <div className="patient-doctors-header">

                    <button
                        className="back-btn"
                        onClick={() =>
                            navigate(
                                "/patient-dashboard"
                            )
                        }
                    >
                        <FaArrowLeft />
                        Back
                    </button>

                    <div>
                        <h1>
                            Find a Doctor
                        </h1>

                        <p>
                            Browse available doctors
                            and specialties.
                        </p>
                    </div>

                </div>

                <div className="patient-doctors-empty">

                    <div className="empty-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Doctors
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        className="primary-btn"
                        onClick={
                            loadDoctors
                        }
                    >
                        🔄 Try Again
                    </button>

                </div>
            </div>
        );
    }

    return (
        <div className="patient-doctors-page">

            <div className="patient-doctors-header">

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate(
                            "/patient-dashboard"
                        )
                    }
                >
                    <FaArrowLeft />
                    Back
                </button>

                <div>
                    <h1>
                        Find a Doctor
                    </h1>

                    <p>
                        Find the right doctor for
                        your healthcare needs.
                    </p>
                </div>

            </div>

            <div className="patient-doctors-filters">

                <div className="doctor-search">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search doctor or specialization..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                </div>

                <select
                    value={specialization}
                    onChange={(e) =>
                        setSpecialization(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        All Specializations
                    </option>

                    {specializations.map(
                        (item) => (
                            <option
                                key={item}
                                value={item}
                            >
                                {item}
                            </option>
                        )
                    )}
                </select>

            </div>

            <div className="doctor-results-info">
                Showing{" "}
                <strong>
                    {filteredDoctors.length}
                </strong>{" "}
                doctor
                {filteredDoctors.length !== 1
                    ? "s"
                    : ""}
            </div>

            {filteredDoctors.length === 0 ? (
                <div className="patient-doctors-empty">

                    <div className="empty-icon">
                        🩺
                    </div>

                    <h2>
                        No Doctors Found
                    </h2>

                    <p>
                        Try another doctor name
                        or specialization.
                    </p>

                    {(search ||
                        specialization) && (
                            <button
                                className="secondary-btn"
                                onClick={() => {
                                    setSearch("");
                                    setSpecialization("");
                                }}
                            >
                                Clear Filters
                            </button>
                        )}

                </div>
            ) : (
                <div className="patient-doctors-grid">

                    {filteredDoctors.map(
                        (doctor) => {

                            const experience =
                                Number(
                                    doctor.experience
                                ) || 0;

                            const isAvailable =
                                String(
                                    doctor.availability ||
                                    ""
                                ).toLowerCase() ===
                                "available";

                            return (
                                <div
                                    className="patient-doctor-card"
                                    key={doctor.id}
                                >

                                    <div className="patient-doctor-top">

                                        <div className="patient-doctor-avatar">
                                            <FaUserMd />
                                        </div>

                                        <span
                                            className={`doctor-availability ${isAvailable
                                                    ? "available"
                                                    : "unavailable"
                                                }`}
                                        >
                                            {doctor.availability ||
                                                "Not specified"}
                                        </span>

                                    </div>

                                    <div className="patient-doctor-info">

                                        <h2>
                                            Dr.{" "}
                                            {doctor.name ||
                                                "Doctor"}
                                        </h2>

                                        <p className="doctor-specialization">
                                            {doctor.specialization ||
                                                "General Physician"}
                                        </p>

                                    </div>

                                    <div className="patient-doctor-stats">

                                        <div>
                                            <strong>
                                                {experience}
                                            </strong>

                                            <span>
                                                Years
                                            </span>
                                        </div>

                                        <div>
                                            <strong>
                                                ₹
                                                {doctor.fees ??
                                                    "—"}
                                            </strong>

                                            <span>
                                                Consultation
                                            </span>
                                        </div>

                                    </div>

                                    <div className="patient-doctor-contact">

                                        {doctor.email && (
                                            <div>
                                                ✉{" "}
                                                {doctor.email}
                                            </div>
                                        )}

                                        {doctor.phone && (
                                            <div>
                                                ☎{" "}
                                                {doctor.phone}
                                            </div>
                                        )}

                                    </div>

                                    <button
                                        type="button"
                                        className="book-doctor-btn"
                                        onClick={() =>
                                            bookAppointment(
                                                doctor
                                            )
                                        }
                                    >
                                        Book Appointment
                                    </button>

                                </div>
                            );
                        }
                    )}

                </div>
            )}

        </div>
    );
}

export default PatientDoctors;