import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    FaArrowLeft,
    FaSearch,
    FaUserMd,
    FaCalendarCheck,
    FaStar,
    FaClock,
    FaBriefcaseMedical,
    FaStethoscope,
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

    const [availability, setAvailability] =
        useState("");


    /* =========================================
       LOAD DOCTORS
    ========================================= */

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


    /* =========================================
       SPECIALIZATIONS
    ========================================= */

    const specializations =
        useMemo(() => {

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


    /* =========================================
       AVAILABILITY OPTIONS
    ========================================= */

    const availabilityOptions =
        useMemo(() => {

            return [
                ...new Set(
                    doctors
                        .map(
                            (doctor) =>
                                doctor.availability
                        )
                        .filter(Boolean)
                ),
            ].sort();

        }, [doctors]);


    /* =========================================
       FILTER DOCTORS
    ========================================= */

    const filteredDoctors =
        useMemo(() => {

            const query =
                search.trim().toLowerCase();


            return doctors.filter(
                (doctor) => {

                    const name =
                        String(
                            doctor.name || ""
                        ).toLowerCase();

                    const spec =
                        String(
                            doctor.specialization ||
                            ""
                        ).toLowerCase();

                    const experience =
                        String(
                            doctor.experience ||
                            ""
                        ).toLowerCase();


                    const matchesSearch =
                        !query ||
                        name.includes(query) ||
                        spec.includes(query) ||
                        experience.includes(query);


                    const matchesSpecialization =
                        !specialization ||
                        doctor.specialization ===
                        specialization;


                    const matchesAvailability =
                        !availability ||
                        doctor.availability ===
                        availability;


                    return (
                        matchesSearch &&
                        matchesSpecialization &&
                        matchesAvailability
                    );
                }
            );

        }, [
            doctors,
            search,
            specialization,
            availability,
        ]);


    /* =========================================
       COUNTS
    ========================================= */

    const availableCount =
        doctors.filter(
            (doctor) =>
                String(
                    doctor.availability || ""
                ).toLowerCase() ===
                "available"
        ).length;


    /* =========================================
       BOOK APPOINTMENT
    ========================================= */

    function bookAppointment(doctor) {

        navigate(
            "/book-appointment",
            {
                state: {
                    doctorId: doctor.id,
                    doctorName: doctor.name,
                },
            }
        );

    }


    /* =========================================
       CLEAR FILTERS
    ========================================= */

    function clearFilters() {

        setSearch("");
        setSpecialization("");
        setAvailability("");

    }


    /* =========================================
       STATUS
    ========================================= */

    function getAvailabilityStatus(
        doctor
    ) {

        const status =
            String(
                doctor.availability || ""
            ).toLowerCase();


        if (
            status === "available"
        ) {
            return "available";
        }


        if (
            status === "busy"
        ) {
            return "busy";
        }


        if (
            status === "on leave"
        ) {
            return "leave";
        }


        return "unknown";
    }


    /* =========================================
       LOADING
    ========================================= */

    if (loading) {

        return (
            <DoctorsSkeleton />
        );

    }


    /* =========================================
       ERROR
    ========================================= */

    if (error) {

        return (
            <div className="patient-doctors-page">

                <div className="patient-doctors-header">

                    <button
                        type="button"
                        className="doctor-back-btn"
                        onClick={() =>
                            navigate(
                                "/patient-dashboard"
                            )
                        }
                    >
                        <FaArrowLeft />
                        Back
                    </button>

                    <div className="patient-doctors-title">

                        <span className="doctor-eyebrow">
                            Healthcare Specialists
                        </span>

                        <h1>
                            Find a Doctor
                        </h1>

                        <p>
                            Connect with the right
                            specialist for your care.
                        </p>

                    </div>

                </div>


                <div className="doctor-error-state">

                    <div className="doctor-empty-icon">
                        ⚠️
                    </div>

                    <h2>
                        Unable to Load Doctors
                    </h2>

                    <p>
                        {error}
                    </p>

                    <button
                        type="button"
                        className="doctor-primary-btn"
                        onClick={
                            loadDoctors
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );

    }


    /* =========================================
       PAGE
    ========================================= */

    return (

        <div className="patient-doctors-page">


            {/* =================================
                HEADER
            ================================= */}

            <div className="patient-doctors-header">

                <button
                    type="button"
                    className="doctor-back-btn"
                    onClick={() =>
                        navigate(
                            "/patient-dashboard"
                        )
                    }
                >
                    <FaArrowLeft />
                    Back
                </button>


                <div className="patient-doctors-title">

                    <span className="doctor-eyebrow">
                        Healthcare Specialists
                    </span>

                    <h1>
                        Find a Doctor
                    </h1>

                    <p>
                        Browse trusted specialists
                        and book your consultation
                        in just a few clicks.
                    </p>

                </div>

            </div>


            {/* =================================
                SUMMARY
            ================================= */}

            <div className="doctor-summary-grid">

                <div className="doctor-summary-card">

                    <div className="doctor-summary-icon blue">
                        <FaUserMd />
                    </div>

                    <div>
                        <strong>
                            {doctors.length}
                        </strong>

                        <span>
                            Total Doctors
                        </span>
                    </div>

                </div>


                <div className="doctor-summary-card">

                    <div className="doctor-summary-icon green">
                        <FaClock />
                    </div>

                    <div>
                        <strong>
                            {availableCount}
                        </strong>

                        <span>
                            Available Now
                        </span>
                    </div>

                </div>


                <div className="doctor-summary-card">

                    <div className="doctor-summary-icon purple">
                        <FaStethoscope />
                    </div>

                    <div>
                        <strong>
                            {specializations.length}
                        </strong>

                        <span>
                            Specializations
                        </span>
                    </div>

                </div>

            </div>


            {/* =================================
                FILTER PANEL
            ================================= */}

            <div className="doctor-filter-panel">

                <div className="doctor-search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Search by doctor name, specialization or experience..."
                        value={search}
                        onChange={(e) =>
                            setSearch(
                                e.target.value
                            )
                        }
                    />

                    {search && (

                        <button
                            type="button"
                            className="doctor-clear-search"
                            onClick={() =>
                                setSearch("")
                            }
                        >
                            ×
                        </button>

                    )}

                </div>


                <select
                    className="doctor-filter-select"
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


                <select
                    className="doctor-filter-select"
                    value={availability}
                    onChange={(e) =>
                        setAvailability(
                            e.target.value
                        )
                    }
                >
                    <option value="">
                        All Availability
                    </option>

                    {availabilityOptions.map(
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


                {(search ||
                    specialization ||
                    availability) && (

                        <button
                            type="button"
                            className="doctor-clear-all"
                            onClick={
                                clearFilters
                            }
                        >
                            Clear Filters
                        </button>

                    )}

            </div>


            {/* =================================
                RESULTS BAR
            ================================= */}

            <div className="doctor-results-bar">

                <div>

                    <strong>
                        {filteredDoctors.length}
                    </strong>

                    {" "}doctor
                    {filteredDoctors.length !==
                        1
                        ? "s"
                        : ""}{" "}
                    found

                </div>


                {(specialization ||
                    availability) && (

                        <div className="doctor-active-filters">

                            {specialization && (
                                <span>
                                    {specialization}
                                </span>
                            )}

                            {availability && (
                                <span>
                                    {availability}
                                </span>
                            )}

                        </div>

                    )}

            </div>


            {/* =================================
                EMPTY
            ================================= */}

            {filteredDoctors.length ===
                0 ? (

                <div className="doctor-empty-state">

                    <div className="doctor-empty-icon">
                        🩺
                    </div>

                    <h2>
                        No Doctors Found
                    </h2>

                    <p>
                        We couldn't find a
                        doctor matching your
                        current filters.
                    </p>

                    {(search ||
                        specialization ||
                        availability) && (

                            <button
                                type="button"
                                className="doctor-secondary-btn"
                                onClick={
                                    clearFilters
                                }
                            >
                                Clear Filters
                            </button>

                        )}

                </div>

            ) : (

                /* =================================
                   GRID
                ================================= */

                <div className="patient-doctors-grid">

                    {filteredDoctors.map(
                        (doctor) => {

                            const experience =
                                Number(
                                    doctor.experience
                                ) || 0;


                            const status =
                                getAvailabilityStatus(
                                    doctor
                                );


                            const fee =
                                doctor.fees !==
                                    null &&
                                    doctor.fees !==
                                    undefined &&
                                    doctor.fees !==
                                    ""
                                    ? `₹${doctor.fees}`
                                    : "Not listed";


                            return (

                                <article
                                    className="patient-doctor-card"
                                    key={
                                        doctor.id
                                    }
                                >

                                    {/* TOP */}

                                    <div className="doctor-card-top">

                                        <div className="doctor-avatar-wrap">

                                            <div className="doctor-avatar">

                                                <FaUserMd />

                                            </div>

                                        </div>


                                        <span
                                            className={`doctor-status ${status}`}
                                        >
                                            <span className="doctor-status-dot"></span>

                                            {doctor.availability ||
                                                "Not specified"}

                                        </span>

                                    </div>


                                    {/* NAME */}

                                    <div className="doctor-card-heading">

                                        <h2>
                                            Dr.{" "}
                                            {
                                                doctor.name ||
                                                "Doctor"
                                            }
                                        </h2>

                                        <p>
                                            <FaStethoscope />

                                            {
                                                doctor.specialization ||
                                                "General Physician"
                                            }
                                        </p>

                                    </div>


                                    {/* TRUST */}

                                    <div className="doctor-trust-row">

                                        <span>
                                            <FaStar />

                                            Trusted Specialist
                                        </span>

                                    </div>


                                    {/* STATS */}

                                    <div className="doctor-stats">

                                        <div className="doctor-stat">

                                            <div className="doctor-stat-icon">
                                                <FaBriefcaseMedical />
                                            </div>

                                            <div>
                                                <strong>
                                                    {experience}
                                                </strong>

                                                <span>
                                                    Years Experience
                                                </span>
                                            </div>

                                        </div>


                                        <div className="doctor-stat">

                                            <div className="doctor-stat-icon">
                                                ₹
                                            </div>

                                            <div>
                                                <strong>
                                                    {fee}
                                                </strong>

                                                <span>
                                                    Consultation
                                                </span>
                                            </div>

                                        </div>

                                    </div>


                                    {/* CONTACT */}

                                    <div className="doctor-contact-section">

                                        {doctor.phone && (

                                            <div className="doctor-contact-item">

                                                <span>
                                                    ☎
                                                </span>

                                                <p>
                                                    {
                                                        doctor.phone
                                                    }
                                                </p>

                                            </div>

                                        )}


                                        {doctor.email && (

                                            <div className="doctor-contact-item">

                                                <span>
                                                    ✉
                                                </span>

                                                <p>
                                                    {
                                                        doctor.email
                                                    }
                                                </p>

                                            </div>

                                        )}

                                    </div>


                                    {/* ACTION */}

                                    <button
                                        type="button"
                                        className="doctor-book-btn"
                                        onClick={() =>
                                            bookAppointment(
                                                doctor
                                            )
                                        }
                                    >
                                        <FaCalendarCheck />

                                        Book Appointment

                                    </button>

                                </article>

                            );

                        }
                    )}

                </div>

            )}

        </div>

    );
}

export default PatientDoctors;