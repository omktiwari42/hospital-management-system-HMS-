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
       LOADING / BOOKING
    ========================= */

    const [loading, setLoading] =
        useState(true);

    const [booking, setBooking] =
        useState(false);


    /* =========================
       POPUPS
    ========================= */

    const [
        showAppointmentPopup,
        setShowAppointmentPopup,
    ] = useState(false);

    const [
        popupMessage,
        setPopupMessage,
    ] = useState("");

    const [
        paymentSuccess,
        setPaymentSuccess,
    ] = useState(false);

    const [
        paymentMessage,
        setPaymentMessage,
    ] = useState("");


    /* =========================
       PROFILE / DOCTORS
    ========================= */

    const [profile, setProfile] =
        useState({});

    const [doctors, setDoctors] =
        useState([]);

    const [
        selectedDoctor,
        setSelectedDoctor,
    ] = useState(null);


    /* =========================
       DATE / TIME
    ========================= */

    const [
        appointmentDateTime,
        setAppointmentDateTime,
    ] = useState(new Date());


    /* =========================
       FORM
    ========================= */

    const [form, setForm] =
        useState({
            doctor_name: "",
            department: "",
            reason: "",
        });


    /* =========================
       LOAD PROFILE + DOCTORS
    ========================= */

    useEffect(() => {

        loadData();

    }, [location.state]);


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
                Array.isArray(
                    doctorsRes.data
                )
                    ? doctorsRes.data
                    : [];


            setProfile(
                profileData
            );

            setDoctors(
                doctorsData
            );


            /* =========================
               PRESELECT DOCTOR
            ========================= */

            const selectedDoctorId =
                location.state?.doctorId;

            const selectedDoctorName =
                location.state?.doctorName;


            if (
                selectedDoctorId ||
                selectedDoctorName
            ) {

                const doctor =
                    doctorsData.find(
                        (item) => {

                            const idMatch =
                                selectedDoctorId &&
                                String(
                                    item.id
                                ) ===
                                String(
                                    selectedDoctorId
                                );


                            const nameMatch =
                                selectedDoctorName &&
                                item.name ===
                                selectedDoctorName;


                            return (
                                idMatch ||
                                nameMatch
                            );

                        }
                    );


                if (doctor) {

                    setSelectedDoctor(
                        doctor
                    );


                    setForm(
                        (prev) => ({
                            ...prev,

                            doctor_name:
                                doctor.name ||
                                "",

                            department:
                                doctor.specialization ||
                                "",
                        })
                    );

                }

            }

        } catch (err) {

            console.error(
                "Book appointment load error:",
                err
            );

        } finally {

            setLoading(false);

        }

    }


    /* =========================
       DOCTOR CHANGE
    ========================= */

    function handleDoctorChange(
        e
    ) {

        const doctor =
            doctors.find(
                (item) =>
                    item.name ===
                    e.target.value
            );


        setSelectedDoctor(
            doctor || null
        );


        setForm(
            (prev) => ({
                ...prev,

                doctor_name:
                    doctor?.name ||
                    "",

                department:
                    doctor?.specialization ||
                    "",
            })
        );

    }


    /* =========================
       FORM CHANGE
    ========================= */

    function handleChange(
        e
    ) {

        const {
            name,
            value,
        } = e.target;


        setForm(
            (prev) => ({
                ...prev,
                [name]: value,
            })
        );

    }


    /* =========================
       CLEAR FORM
    ========================= */

    function clearForm() {

        setSelectedDoctor(
            null
        );


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

    async function bookAppointment(
        e
    ) {

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
                "Please select a valid appointment date and time."
            );

            return;

        }


        if (
            appointmentDateTime <
            new Date()
        ) {

            alert(
                "Please select a future date and time."
            );

            return;

        }


        if (
            typeof window.Razorpay !==
            "function"
        ) {

            alert(
                "Razorpay Checkout could not be loaded. Please refresh the page and try again."
            );

            return;

        }


        try {

            setBooking(true);


            /* =========================
               FORMAT DATE
            ========================= */

            const appointment_date =
                appointmentDateTime
                    .toISOString()
                    .split("T")[0];


            /* =========================
               FORMAT TIME
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


            console.log(
                "BOOK RESPONSE:",
                response.data
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
               RAZORPAY OPTIONS
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


                /* =====================
                   PAYMENT SUCCESS
                ===================== */

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


                            console.log(
                                "PAYMENT VERIFY:",
                                verify.data
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


                            clearForm();


                            if (
                                verify.data
                                    .invoiceUrl
                            ) {

                                window.open(
                                    verify.data
                                        .invoiceUrl,
                                    "_blank"
                                );

                            }


                            setTimeout(
                                () => {

                                    window.location.replace(
                                        "/patient-appointments"
                                    );

                                },
                                1500
                            );

                        } catch (err) {

                            console.error(
                                "Payment verification error:",
                                err
                            );


                            setBooking(
                                false
                            );


                            alert(
                                err.response
                                    ?.data
                                    ?.message ||
                                "Payment verification failed."
                            );

                        }

                    },


                /* =====================
                   PREFILL
                ===================== */

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


                /* =====================
                   THEME
                ===================== */

                theme: {
                    color:
                        "#2563eb",
                },


                /* =====================
                   MODAL
                ===================== */

                modal: {

                    ondismiss:
                        function () {

                            setBooking(
                                false
                            );

                        },

                },

            };


            /* =========================
               OPEN RAZORPAY
            ========================= */

            const razorpay =
                new window.Razorpay(
                    options
                );


            razorpay.on(
                "payment.failed",
                function (
                    paymentError
                ) {

                    console.error(
                        "Razorpay payment failed:",
                        paymentError
                    );


                    setBooking(
                        false
                    );


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
                error.response
                    ?.status ===
                400 &&
                error.response
                    ?.data
                    ?.message
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

        } finally {

            /*
             * Razorpay may still be open.
             * It controls its own loading state
             * until dismissed or completed.
             */
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
       PAGE
    ========================= */

    return (

        <DashboardLayout>

            <div className="book-appointment-page">

                {/* =========================
                    HEADER
                ========================= */}

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
                        onClick={() =>
                            navigate(
                                "/patient-doctors"
                            )
                        }
                    >
                        ← Back to Doctors
                    </button>

                </div>


                {/* =========================
                    FORM
                ========================= */}

                <form
                    className="appointment-form"
                    onSubmit={
                        bookAppointment
                    }
                >

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
                                (
                                    doctor
                                ) => (

                                    <option
                                        key={
                                            doctor.id
                                        }
                                        value={
                                            doctor.name
                                        }
                                    >
                                        {doctor.name}
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


                    {/* DATE / TIME */}

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

                                if (
                                    date
                                ) {

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


                    {/* BUTTONS */}

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


                {/* =========================
                    EXISTING APPOINTMENT POPUP
                ========================= */}

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
                                {popupMessage}
                            </p>


                            <div className="popup-buttons">

                                <button
                                    type="button"
                                    className="popup-primary"
                                    onClick={() => {

                                        setShowAppointmentPopup(
                                            false
                                        );

                                        window.location.href =
                                            "/patient-appointments";

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


                {/* =========================
                    PAYMENT SUCCESS
                ========================= */}

                {paymentSuccess && (

                    <div className="payment-success-overlay">

                        <div className="payment-success-card">

                            <div className="success-check">
                                ✔
                            </div>


                            <h2>
                                {paymentMessage}
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