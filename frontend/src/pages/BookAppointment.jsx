import {
    useState,
    useEffect,
} from "react";

import {
    useNavigate,
    useLocation,
} from "react-router-dom";

import api from "../services/api";

import DashboardLayout from "../layouts/DashboardLayout";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import BookAppointmentSkeleton from "../components/skeletons/BookAppointmentSkeleton";


export default function BookAppointment() {

    const navigate = useNavigate();
    const location = useLocation();


    /* =========================
       STATE
    ========================= */

    const [loading, setLoading] =
        useState(true);

    const [booking, setBooking] =
        useState(false);

    const [showAppointmentPopup, setShowAppointmentPopup] =
        useState(false);

    const [popupMessage, setPopupMessage] =
        useState("");

    const [paymentSuccess, setPaymentSuccess] =
        useState(false);

    const [paymentMessage, setPaymentMessage] =
        useState("");

    const [profile, setProfile] =
        useState({});

    const [doctors, setDoctors] =
        useState([]);

    const [selectedDoctor, setSelectedDoctor] =
        useState(null);

    const [appointmentDateTime, setAppointmentDateTime] =
        useState(new Date());

    const [form, setForm] = useState({
        doctor_name: "",
        department: "",
        reason: "",
    });


    /* =========================
       LOAD DATA
    ========================= */

    useEffect(() => {
        loadData();
    }, []);


    async function loadData() {

        try {

            setLoading(true);

            const [
                profileRes,
                doctorsRes,
            ] = await Promise.all([
                api.get("/profile"),
                api.get("/doctors"),
            ]);

            const profileData =
                profileRes.data || {};

            const doctorsData =
                Array.isArray(doctorsRes.data)
                    ? doctorsRes.data
                    : [];

            setProfile(profileData);
            setDoctors(doctorsData);


            /* =========================
               RESTORE SELECTED DOCTOR
            ========================= */

            const passedDoctorId =
                location.state?.doctorId;

            const passedDoctorName =
                location.state?.doctorName;


            if (
                passedDoctorId ||
                passedDoctorName
            ) {

                const doctor =
                    doctorsData.find((item) => {

                        const byId =
                            passedDoctorId &&
                            String(item.id) ===
                            String(passedDoctorId);

                        const byName =
                            passedDoctorName &&
                            item.name ===
                            passedDoctorName;

                        return (
                            byId ||
                            byName
                        );
                    });


                if (doctor) {

                    selectDoctor(
                        doctor
                    );
                }
            }

        } catch (error) {

            console.error(
                "Book appointment load error:",
                error
            );

        } finally {

            setLoading(false);

        }
    }


    /* =========================
       SELECT DOCTOR
    ========================= */

    function selectDoctor(doctor) {

        setSelectedDoctor(
            doctor || null
        );

        setForm((prev) => ({
            ...prev,

            doctor_name:
                doctor?.name || "",

            department:
                doctor?.specialization || "",
        }));
    }


    function handleDoctorChange(e) {

        const doctor =
            doctors.find(
                (item) =>
                    item.name ===
                    e.target.value
            );

        selectDoctor(
            doctor
        );
    }


    /* =========================
       FORM CHANGE
    ========================= */

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


    /* =========================
       GO BACK TO DOCTORS
    ========================= */

    function goBackToDoctors() {

        /*
         * Direct route first.
         * This does not depend on browser
         * history.
         */
        navigate(
            "/patient-doctors"
        );
    }


    /* =========================
       CLEAR
    ========================= */

    function clearForm() {

        setSelectedDoctor(null);

        setForm({
            doctor_name: "",
            department: "",
            reason: "",
        });

        setAppointmentDateTime(
            new Date()
        );
    }


    /* =========================
       BOOK APPOINTMENT
    ========================= */

    async function bookAppointment(e) {

        e.preventDefault();

        if (booking) {
            return;
        }


        if (!form.doctor_name) {

            alert(
                "Please select a doctor."
            );

            return;
        }


        if (!form.reason.trim()) {

            alert(
                "Please enter the reason for your appointment."
            );

            return;
        }


        if (
            !appointmentDateTime ||
            Number.isNaN(
                appointmentDateTime.getTime()
            )
        ) {

            alert(
                "Please select a valid date and time."
            );

            return;
        }


        if (
            appointmentDateTime <=
            new Date()
        ) {

            alert(
                "Please select a future appointment time."
            );

            return;
        }


        if (
            typeof window.Razorpay !==
            "function"
        ) {

            alert(
                "Razorpay Checkout could not be loaded. Please refresh and try again."
            );

            return;
        }


        try {

            setBooking(true);


            /* =========================
               DATE
            ========================= */

            const appointment_date =
                appointmentDateTime
                    .toISOString()
                    .split("T")[0];


            /* =========================
               TIME
            ========================= */

            const appointment_time =
                appointmentDateTime.toLocaleTimeString(
                    "en-US",
                    {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                    }
                );


            /* =========================
               CREATE APPOINTMENT
            ========================= */

            const response =
                await api.post(
                    "/patient/book-appointment",
                    {
                        doctor_name:
                            form.doctor_name,

                        department:
                            form.department,

                        appointment_date,

                        appointment_time,

                        reason:
                            form.reason.trim(),
                    }
                );


            /* =========================
               CREATE RAZORPAY ORDER
            ========================= */

            const order =
                await api.post(
                    "/create-order",
                    {
                        amount:
                            response.data.amount,
                    }
                );


            /* =========================
               RAZORPAY
            ========================= */

            const options = {

                key:
                    import.meta.env
                        .VITE_RAZORPAY_KEY_ID,

                amount:
                    order.data.amount,

                currency:
                    order.data.currency,

                name:
                    "Hospital Management System",

                description:
                    "Doctor Consultation",

                order_id:
                    order.data.id,


                handler:
                    async function (
                        payment
                    ) {

                        try {

                            const verify =
                                await api.post(
                                    "/verify-payment",
                                    {
                                        razorpay_order_id:
                                            payment.razorpay_order_id,

                                        razorpay_payment_id:
                                            payment.razorpay_payment_id,

                                        razorpay_signature:
                                            payment.razorpay_signature,

                                        billId:
                                            response.data.billId,
                                    }
                                );


                            setPaymentMessage(
                                "Appointment Booked Successfully!"
                            );

                            setPaymentSuccess(
                                true
                            );

                            setBooking(
                                false
                            );


                            if (
                                verify.data
                                    ?.invoiceUrl
                            ) {

                                window.open(
                                    verify.data.invoiceUrl,
                                    "_blank"
                                );
                            }


                            setTimeout(() => {

                                window.location.replace(
                                    "/patient-appointments"
                                );

                            }, 1500);

                        } catch (error) {

                            console.error(
                                "Payment verification error:",
                                error
                            );

                            setBooking(false);

                            alert(
                                error.response
                                    ?.data
                                    ?.message ||
                                "Payment verification failed."
                            );
                        }
                    },


                prefill: {

                    name:
                        profile.full_name ||
                        profile.name ||
                        "",

                    contact:
                        profile.phone ||
                        "",

                    email:
                        profile.email ||
                        "",
                },


                theme: {
                    color:
                        "#2563eb",
                },


                modal: {

                    ondismiss: () => {

                        setBooking(false);

                    },
                },
            };


            const razorpay =
                new window.Razorpay(
                    options
                );


            razorpay.on(
                "payment.failed",
                (paymentError) => {

                    console.error(
                        "Payment failed:",
                        paymentError
                    );

                    setBooking(false);

                    alert(
                        paymentError
                            ?.error
                            ?.description ||
                        "Payment failed. Please try again."
                    );
                }
            );


            razorpay.open();

        } catch (error) {

            console.error(
                "Booking error:",
                error
            );


            if (
                error.response?.status === 400 &&
                error.response?.data?.message
            ) {

                setPopupMessage(
                    error.response.data.message
                );

                setShowAppointmentPopup(
                    true
                );

            } else {

                alert(
                    error.response
                        ?.data
                        ?.message ||
                    "Failed to book appointment."
                );
            }

            setBooking(false);
        }
    }


    /* =========================
       LOADING
    ========================= */

    if (loading) {
        return (
            <BookAppointmentSkeleton />
        );
    }


    /* =========================
       UI
    ========================= */

    return (

        <DashboardLayout>

            <div className="book-appointment-page">

                {/* HEADER */}

                <div className="book-appointment-header">

                    <div>

                        <span className="booking-eyebrow">
                            Patient Care
                        </span>

                        <h1>
                            📅 Book Appointment
                        </h1>

                        <p>
                            Schedule a consultation
                            with your preferred doctor.
                        </p>

                    </div>


                    <button
                        type="button"
                        className="booking-back-btn"
                        onClick={
                            goBackToDoctors
                        }
                    >
                        ← Back to Doctors
                    </button>

                </div>


                {/* SELECTED DOCTOR */}

                {selectedDoctor && (

                    <div className="selected-doctor-banner">

                        <div className="selected-doctor-icon">
                            🩺
                        </div>

                        <div className="selected-doctor-info">

                            <span>
                                Selected Doctor
                            </span>

                            <strong>
                                Dr.{" "}
                                {selectedDoctor.name}
                            </strong>

                            <small>
                                {
                                    selectedDoctor.specialization
                                }
                            </small>

                        </div>

                        <div className="selected-doctor-meta">

                            <div>
                                <span>
                                    Fee
                                </span>

                                <strong>
                                    ₹
                                    {
                                        selectedDoctor.fees ??
                                        "—"
                                    }
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Experience
                                </span>

                                <strong>
                                    {
                                        selectedDoctor.experience ??
                                        0
                                    }{" "}
                                    Years
                                </strong>
                            </div>

                        </div>

                    </div>

                )}


                {/* FORM */}

                <form
                    className="appointment-form"
                    onSubmit={
                        bookAppointment
                    }
                >

                    <div className="appointment-form-title">

                        <h2>
                            Appointment Details
                        </h2>

                        <p>
                            Please provide the
                            required details below.
                        </p>

                    </div>


                    {/* PATIENT */}

                    <div className="form-group">

                        <label>
                            👤 Patient Name
                        </label>

                        <input
                            type="text"
                            value={
                                profile.full_name ||
                                profile.name ||
                                ""
                            }
                            readOnly
                        />

                    </div>


                    {/* PHONE */}

                    <div className="form-group">

                        <label>
                            📱 Phone Number
                        </label>

                        <input
                            type="text"
                            value={
                                profile.phone ||
                                ""
                            }
                            readOnly
                        />

                    </div>


                    {/* DOCTOR */}

                    <div className="form-group">

                        <label>
                            🩺 Select Doctor
                        </label>

                        <select
                            value={
                                form.doctor_name
                            }
                            onChange={
                                handleDoctorChange
                            }
                            required
                            disabled={
                                booking
                            }
                        >

                            <option value="">
                                Select Doctor
                            </option>

                            {doctors.map(
                                (doctor) => (

                                    <option
                                        key={
                                            doctor.id
                                        }
                                        value={
                                            doctor.name
                                        }
                                    >
                                        {
                                            doctor.name
                                        }
                                        {" • "}
                                        {
                                            doctor.specialization
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* DEPARTMENT */}

                    <div className="form-group">

                        <label>
                            🏥 Department
                        </label>

                        <input
                            type="text"
                            value={
                                form.department
                            }
                            readOnly
                        />

                    </div>


                    {/* FEE */}

                    <div className="form-group">

                        <label>
                            💰 Consultation Fee
                        </label>

                        <input
                            type="text"
                            value={
                                selectedDoctor
                                    ? `₹${selectedDoctor.fees}`
                                    : ""
                            }
                            readOnly
                        />

                    </div>


                    {/* EXPERIENCE */}

                    <div className="form-group">

                        <label>
                            ⭐ Experience
                        </label>

                        <input
                            type="text"
                            value={
                                selectedDoctor
                                    ? `${selectedDoctor.experience || 0} Years`
                                    : ""
                            }
                            readOnly
                        />

                    </div>


                    {/* DATE */}

                    <div className="form-group">

                        <label>
                            📅 Date & Time
                        </label>

                        <DatePicker
                            selected={
                                appointmentDateTime
                            }
                            onChange={(
                                date
                            ) => {

                                if (date) {

                                    setAppointmentDateTime(
                                        date
                                    );
                                }

                            }}
                            showTimeSelect
                            timeIntervals={
                                15
                            }
                            dateFormat="dd/MM/yyyy h:mm aa"
                            minDate={
                                new Date()
                            }
                            className="form-control"
                            disabled={
                                booking
                            }
                        />

                    </div>


                    {/* REASON */}

                    <div className="form-group">

                        <label>
                            📝 Reason for Visit
                        </label>

                        <textarea
                            name="reason"
                            rows={4}
                            value={
                                form.reason
                            }
                            onChange={
                                handleChange
                            }
                            placeholder="Briefly describe the reason for your appointment..."
                            required
                            disabled={
                                booking
                            }
                        />

                    </div>


                    {/* ACTIONS */}

                    <div className="appointment-buttons">

                        <button
                            type="button"
                            className="clear-btn"
                            onClick={
                                clearForm
                            }
                            disabled={
                                booking
                            }
                        >
                            Clear
                        </button>


                        <button
                            type="submit"
                            className="book-btn"
                            disabled={
                                booking
                            }
                        >
                            {booking
                                ? "Processing..."
                                : "Book Appointment & Pay"}
                        </button>

                    </div>

                </form>


                {/* EXISTING APPOINTMENT POPUP */}

                {showAppointmentPopup && (

                    <div className="appointment-popup-overlay">

                        <div className="appointment-popup">

                            <div className="popup-icon">
                                ⚠️
                            </div>

                            <h2>
                                Appointment Already Exists
                            </h2>

                            <p>
                                {
                                    popupMessage
                                }
                            </p>

                            <div className="popup-buttons">

                                <button
                                    type="button"
                                    className="popup-primary"
                                    onClick={() => {

                                        setShowAppointmentPopup(
                                            false
                                        );

                                        navigate(
                                            "/patient-appointments"
                                        );
                                    }}
                                >
                                    View My Appointments
                                </button>


                                <button
                                    type="button"
                                    className="popup-secondary"
                                    onClick={() =>
                                        setShowAppointmentPopup(
                                            false
                                        )
                                    }
                                >
                                    Close
                                </button>

                            </div>

                        </div>

                    </div>

                )}


                {/* PAYMENT SUCCESS */}

                {paymentSuccess && (

                    <div className="payment-success-overlay">

                        <div className="payment-success-card">

                            <div className="success-check">
                                ✓
                            </div>

                            <h2>
                                {
                                    paymentMessage
                                }
                            </h2>

                            <p>
                                Payment verified successfully.
                                Redirecting to your appointments...
                            </p>

                        </div>

                    </div>

                )}

            </div>

        </DashboardLayout>
    );
}