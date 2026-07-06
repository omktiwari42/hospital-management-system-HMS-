import { useState, useEffect } from "react";
import api from "../services/api";
import DashboardLayout from "../layouts/DashboardLayout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import BookAppointmentSkeleton from "../components/skeletons/BookAppointmentSkeleton";

export default function BookAppointment() {
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);
    const [showAppointmentPopup, setShowAppointmentPopup] = useState(false);
    const [popupMessage, setPopupMessage] = useState("");
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [paymentMessage, setPaymentMessage] = useState("");
    const [profile, setProfile] = useState({});
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const [appointmentDateTime, setAppointmentDateTime] = useState(new Date());

    const [form, setForm] = useState({
        doctor_name: "",
        department: "",
        reason: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const [profileRes, doctorsRes] = await Promise.all([
                api.get("/profile"),
                api.get("/doctors"),
            ]);

            setProfile(profileRes.data);
            setDoctors(doctorsRes.data);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    }

    function handleDoctorChange(e) {
        const doctor = doctors.find(
            (d) => d.name === e.target.value
        );

        setSelectedDoctor(doctor);

        setForm((prev) => ({
            ...prev,
            doctor_name: doctor?.name || "",
            department: doctor?.specialization || "",
        }));
    }

    function handleChange(e) {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    }

    function clearForm() {
        setSelectedDoctor(null);

        setForm({
            doctor_name: "",
            department: "",
            appointment_date: "",
            appointment_time: "",
            reason: "",
        });
    }

    async function bookAppointment(e) {
        e.preventDefault();

        setBooking(true);

        try {
            const appointment_date =
                appointmentDateTime.toISOString().split("T")[0];

            const appointment_time =
                appointmentDateTime.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                });

            const response = await api.post(
                "/patient/book-appointment",
                {
                    doctor_name: form.doctor_name,
                    department: form.department,
                    appointment_date,
                    appointment_time,
                    reason: form.reason,
                }
            );
            const order = await api.post("/create-order", {
                amount: response.data.amount,
            });
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,

                amount: order.data.amount,

                currency: order.data.currency,

                name: "Hospital Management System",

                description: "Doctor Consultation",

                order_id: order.data.id,

                handler: async function (payment) {

                    try {

                        const verify = await api.post("/verify-payment", {
                            razorpay_order_id: payment.razorpay_order_id,
                            razorpay_payment_id: payment.razorpay_payment_id,
                            razorpay_signature: payment.razorpay_signature,
                            billId: response.data.billId,
                        });

                        setPaymentMessage("Appointment Booked Successfully!");
                        setPaymentSuccess(true);

                        setBooking(false);

                        clearForm();
                        setAppointmentDateTime(new Date());

                        if (verify.data.invoiceUrl) {
                            window.open(verify.data.invoiceUrl, "_blank");
                        }

                        setTimeout(() => {
                            window.location.href = "/patient/appointments";
                        }, 2500);

                    } catch (err) {

                        console.error(err);

                        setBooking(false);

                        alert("Payment verification failed.");

                    }

                },
                prefill: {
                    name: profile.full_name,
                    contact: profile.phone,
                },

                theme: {
                    color: "#2563eb",
                },
                modal: {
                    ondismiss: function () {
                        setBooking(false);
                    }
                },
            };

            const razorpay = new window.Razorpay(options);
            razorpay.on("payment.failed", function () {

                setBooking(false);

                alert("Payment Failed. Please try again.");

            });

            razorpay.open();



        } catch (error) {

            console.error(error);

            if (
                error.response?.status === 400 &&
                error.response?.data?.message
            ) {

                setPopupMessage(error.response.data.message);
                setShowAppointmentPopup(true);

            } else {

                alert(
                    error.response?.data?.message ||
                    "Failed to book appointment."
                );

            }

        } finally {

            setBooking(false);

        }
    }

    if (loading) {
        return <BookAppointmentSkeleton />;
    }
    return (
        <DashboardLayout>
            <div className="book-appointment-page">

                <h1>📅 Book Appointment</h1>

                <form
                    className="appointment-form"
                    onSubmit={bookAppointment}
                >

                    <div className="form-group">
                        <label>👤 Patient Name</label>

                        <input
                            type="text"
                            value={profile.full_name || profile.name || ""}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>📱 Phone Number</label>

                        <input
                            type="text"
                            value={profile.phone || ""}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>🩺 Select Doctor</label>

                        <select
                            value={form.doctor_name}
                            onChange={handleDoctorChange}
                            required
                        >
                            <option value="">
                                Select Doctor
                            </option>

                            {doctors.map((doctor) => (
                                <option
                                    key={doctor.id}
                                    value={doctor.name}
                                >
                                    {doctor.name} • {doctor.specialization}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>🏥 Department</label>

                        <input
                            type="text"
                            value={form.department}
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>💰 Consultation Fee</label>

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

                    <div className="form-group">
                        <label>⭐ Experience</label>

                        <input
                            type="text"
                            value={
                                selectedDoctor
                                    ? `${selectedDoctor.experience} Years`
                                    : ""
                            }
                            readOnly
                        />
                    </div>

                    <div className="form-group">
                        <label>📅 Date & Time</label>

                        <DatePicker
                            selected={appointmentDateTime}
                            onChange={(date) => setAppointmentDateTime(date)}
                            showTimeSelect
                            timeIntervals={15}
                            dateFormat="dd/MM/yyyy h:mm aa"
                            minDate={new Date()}
                            className="form-control"
                        />
                    </div>

                    <div className="form-group">
                        <label>📝 Reason</label>

                        <textarea
                            name="reason"
                            rows={4}
                            value={form.reason}
                            onChange={handleChange}
                            placeholder="Enter reason for appointment..."
                            required
                        />
                    </div>

                    <div className="appointment-buttons">

                        <button
                            type="button"
                            className="clear-btn"
                            onClick={clearForm}
                        >
                            Clear
                        </button>

                        <button
                            type="submit"
                            className="book-btn"
                            disabled={booking}
                        >
                            {booking
                                ? "Booking..."
                                : "Book Appointment"}
                        </button>

                    </div>

                </form>

            </div>
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
                                className="popup-primary"
                                onClick={() => {
                                    setShowAppointmentPopup(false);
                                    window.location.href = "/patient-appointments";
                                }}
                            >
                                View My Appointments
                            </button>

                            <button
                                className="popup-secondary"
                                onClick={() =>
                                    setShowAppointmentPopup(false)
                                }
                            >
                                Close
                            </button>

                        </div>

                    </div>
                </div>
            )}
            {paymentSuccess && (
                <div className="payment-success-overlay">
                    <div className="payment-success-card">
                        <div className="success-check">✔</div>

                        <h2>{paymentMessage}</h2>

                        <p>
                            Redirecting to your dashboard...
                        </p>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}