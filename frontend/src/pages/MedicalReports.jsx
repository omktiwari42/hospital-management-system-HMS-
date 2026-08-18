import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import api from "../services/api";
import ReportCard from "../components/ReportCard";
import MedicalReportsSkeleton from "../components/skeletons/MedicalReportsSkeleton";

function MedicalReports() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [patients, setPatients] = useState([]);
    const [profile, setProfile] = useState(null);

    const [search, setSearch] = useState("");

    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const [selectedPatient, setSelectedPatient] =
        useState("");

    const [selectedFile, setSelectedFile] =
        useState(null);

    const role =
        (
            sessionStorage.getItem("role") ||
            ""
        ).toLowerCase();

    const isPatient =
        role === "patient";

    const isAdminOrDoctor =
        role === "admin" ||
        role === "doctor";


    /* =========================
       LOAD PAGE
    ========================= */

    useEffect(() => {
        loadPageData();
    }, []);


    async function loadPageData() {
        try {
            setLoading(true);

            await Promise.all([
                loadProfile(),
                loadReports(),
                loadPatients(),
            ]);

        } catch (err) {
            console.error(
                "Medical reports page error:",
                err
            );
        } finally {
            setLoading(false);
        }
    }


    /* =========================
       LOAD PROFILE
    ========================= */

    async function loadProfile() {
        try {
            const res =
                await api.get("/profile");

            setProfile(
                res.data || null
            );

        } catch (err) {
            console.error(
                "Profile loading error:",
                err
            );
        }
    }


    /* =========================
       LOAD REPORTS
    ========================= */

    async function loadReports() {
        try {
            const res =
                await api.get("/reports");

            setReports(
                Array.isArray(res.data)
                    ? res.data
                    : []
            );

        } catch (err) {
            console.error(
                "Reports loading error:",
                err
            );

            toast.error(
                err.response?.data?.message ||
                "Failed to load medical reports."
            );
        }
    }


    /* =========================
       LOAD PATIENTS
    ========================= */

    async function loadPatients() {
        /*
         * Patients don't need the
         * complete patient list.
         */
        if (isPatient) {
            return;
        }

        try {
            const res =
                await api.get("/patients");

            setPatients(
                Array.isArray(res.data)
                    ? res.data
                    : []
            );

        } catch (err) {
            console.error(
                "Patients loading error:",
                err
            );

            toast.error(
                "Failed to load patients."
            );
        }
    }


    /* =========================
       PATIENT'S OWN REPORTS
    ========================= */

    const visibleReports =
        useMemo(() => {
            if (
                !isPatient ||
                !profile?.phone
            ) {
                return reports;
            }

            const patientPhone =
                String(
                    profile.phone
                ).trim();

            return reports.filter(
                (report) =>
                    String(
                        report.phone || ""
                    ).trim() ===
                    patientPhone
            );

        }, [
            reports,
            profile,
            isPatient,
        ]);


    /* =========================
       SEARCH
    ========================= */

    const filteredReports =
        useMemo(() => {

            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return visibleReports;
            }

            return visibleReports.filter(
                (report) => {

                    const patientName =
                        String(
                            report.patient_name ||
                            ""
                        ).toLowerCase();

                    const fileName =
                        String(
                            report.file ||
                            ""
                        ).toLowerCase();

                    const phone =
                        String(
                            report.phone ||
                            ""
                        ).toLowerCase();

                    return (
                        patientName.includes(
                            query
                        ) ||
                        fileName.includes(
                            query
                        ) ||
                        phone.includes(
                            query
                        )
                    );
                }
            );

        }, [
            visibleReports,
            search,
        ]);


    /* =========================
       UPLOAD VALIDATION
    ========================= */

    function handleFileChange(e) {

        const file =
            e.target.files?.[0];

        if (!file) {
            setSelectedFile(null);
            return;
        }

        const allowedTypes = [
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/jpg",
        ];

        if (
            !allowedTypes.includes(
                file.type
            )
        ) {
            toast.error(
                "Only PDF, JPG, JPEG and PNG files are allowed."
            );

            e.target.value = "";
            setSelectedFile(null);

            return;
        }

        const maxSize =
            10 * 1024 * 1024;

        if (file.size > maxSize) {
            toast.error(
                "Report must be smaller than 10 MB."
            );

            e.target.value = "";
            setSelectedFile(null);

            return;
        }

        setSelectedFile(file);
    }


    /* =========================
       UPLOAD REPORT
    ========================= */

    async function uploadReport() {

        let patientId =
            selectedPatient;

        /*
         * Patient uploads only for
         * their own patient record.
         */
        if (isPatient) {

            const ownPatient =
                patients.find(
                    (patient) =>
                        String(
                            patient.phone
                        ).trim() ===
                        String(
                            profile?.phone ||
                            ""
                        ).trim()
                );

            /*
             * If the patient list isn't
             * loaded for patient role,
             * we don't guess a patient ID.
             */
            if (!ownPatient) {
                toast.error(
                    "Your patient record could not be found."
                );

                return;
            }

            patientId =
                ownPatient.id;
        }


        if (
            !patientId ||
            !selectedFile
        ) {

            toast.error(
                "Please select a report."
            );

            return;
        }


        try {

            setUploading(true);

            const formData =
                new FormData();

            formData.append(
                "report",
                selectedFile
            );


            await api.post(
                `/upload-report/${patientId}`,
                formData,
                {
                    headers: {
                        "Content-Type":
                            "multipart/form-data",
                    },
                }
            );


            toast.success(
                "Medical report uploaded successfully."
            );


            setSelectedPatient("");

            setSelectedFile(
                null
            );


            const fileInput =
                document.getElementById(
                    "medical-report-file"
                );

            if (fileInput) {
                fileInput.value = "";
            }


            await loadReports();

        } catch (err) {

            console.error(
                "Report upload error:",
                err
            );

            toast.error(
                err.response?.data
                    ?.message ||
                "Failed to upload medical report."
            );

        } finally {

            setUploading(false);

        }
    }


    /* =========================
       STATISTICS
    ========================= */

    const pdfReports =
        visibleReports.filter(
            (report) =>
                String(
                    report.file || ""
                )
                    .toLowerCase()
                    .endsWith(".pdf")
        ).length;

    const imageReports =
        visibleReports.length -
        pdfReports;


    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return (
            <MedicalReportsSkeleton />
        );
    }


    /* =========================
       UI
    ========================= */

    return (
        <div className="page">

            {/* =========================
                HEADER
            ========================= */}

            <div className="page-header">

                <button
                    className="back-btn"
                    onClick={() =>
                        navigate(-1)
                    }
                >
                    ← Back
                </button>

                <div>
                    <h1>
                        📁 Medical Reports
                    </h1>

                    <p>
                        {isPatient
                            ? "View and manage your medical reports."
                            : "Manage uploaded patient medical reports."}
                    </p>
                </div>

            </div>


            {/* =========================
                STATISTICS
            ========================= */}

            <div className="stats-grid">

                <div className="stat-card">

                    <h3>
                        {visibleReports.length}
                    </h3>

                    <p>
                        Total Reports
                    </p>

                </div>


                <div className="stat-card">

                    <h3>
                        {pdfReports}
                    </h3>

                    <p>
                        PDF Reports
                    </p>

                </div>


                <div className="stat-card">

                    <h3>
                        {imageReports}
                    </h3>

                    <p>
                        Image Reports
                    </p>

                </div>

            </div>


            {/* =========================
                SEARCH
            ========================= */}

            <div className="card">

                <input
                    type="text"
                    placeholder={
                        isPatient
                            ? "🔍 Search your reports..."
                            : "🔍 Search patient or report..."
                    }
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

            </div>


            {/* =========================
                UPLOAD
            ========================= */}

            <div className="card upload-card">

                <h2>
                    📤 Upload Medical Report
                </h2>

                {isPatient && (
                    <p className="report-upload-info">
                        Upload a PDF, JPG, JPEG or
                        PNG medical report for your
                        patient record.
                    </p>
                )}


                <div className="upload-form">

                    {!isPatient && (

                        <select
                            value={
                                selectedPatient
                            }
                            onChange={(e) =>
                                setSelectedPatient(
                                    e.target.value
                                )
                            }
                            disabled={
                                uploading
                            }
                        >

                            <option value="">
                                Select Patient
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
                                        {
                                            patient.name
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    )}


                    <input
                        id="medical-report-file"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={
                            handleFileChange
                        }
                        disabled={
                            uploading
                        }
                    />


                    {selectedFile && (

                        <div className="selected-report-file">

                            📄{" "}
                            {selectedFile.name}

                        </div>

                    )}


                    <button
                        className="save-btn"
                        onClick={
                            uploadReport
                        }
                        disabled={
                            uploading ||
                            !selectedFile ||
                            (!isPatient &&
                                !selectedPatient)
                        }
                    >

                        {uploading
                            ? "Uploading..."
                            : "Upload Report"}

                    </button>

                </div>

            </div>


            {/* =========================
                REPORTS
            ========================= */}

            <div className="reports-grid">

                {filteredReports.length ===
                    0 ? (

                    <div className="empty-reports">

                        <div className="empty-reports-icon">
                            📁
                        </div>

                        <h2>
                            {visibleReports.length ===
                                0
                                ? "No Medical Reports"
                                : "No Reports Found"}
                        </h2>

                        <p>
                            {visibleReports.length ===
                                0
                                ? isPatient
                                    ? "Your medical reports will appear here after they are uploaded."
                                    : "Uploaded patient reports will appear here."
                                : "Try a different search term."}
                        </p>

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

                    filteredReports.map(
                        (report) => (

                            <ReportCard
                                key={
                                    report.id
                                }
                                report={
                                    report
                                }
                                onDelete={
                                    loadReports
                                }
                                canDelete={
                                    !isPatient
                                }
                            />

                        )
                    )

                )}

            </div>

        </div>
    );
}

export default MedicalReports;