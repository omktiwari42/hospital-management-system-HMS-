import { useState, useEffect } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";
import BookAppointmentSkeleton from "../components/skeletons/BookAppointmentSkeleton";

export default function BookAppointment() {
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    const [profile, setProfile] = useState({});
    const [doctors, setDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    const [form, setForm] = useState({
        doctor_name: "",
        department: "",
        appointment_date: "",
        appointment_time: "",
        reason: "",
    });

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const token = sessionStorage.getItem("token");

            const [profileRes, doctorsRes] = await Promise.all([
                axios.get("/api/profile", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),

                axios.get("/api/doctors", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }),
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
                            value={profile.full_name || ""}
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
                        <label>📅 Appointment Date</label>

                        <input
                            type="date"
                            name="appointment_date"
                            value={form.appointment_date}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>⏰ Appointment Time</label>

                        <input
                            type="time"
                            name="appointment_time"
                            value={form.appointment_time}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>📝 Reason</label>

                        <textarea
                            name="reason"
                            rows="4"
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
        </DashboardLayout>
    );
}