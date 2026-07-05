import { useState } from "react";
import axios from "axios";
import DashboardLayout from "../layouts/DashboardLayout";

export default function BookAppointment() {
    const [form, setForm] = useState({
        doctor_name: "",
        department: "",
        appointment_date: "",
        appointment_time: "",
        reason: "",
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const bookAppointment = async (e) => {
        e.preventDefault();

        setLoading(true);

        try {
            const token = sessionStorage.getItem("token");

            const res = await axios.post(
                "/api/patient/book-appointment",
                form,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            alert(res.data.message);

            setForm({
                doctor_name: "",
                department: "",
                appointment_date: "",
                appointment_time: "",
                reason: "",
            });
        } catch (err) {
            console.error(err);

            alert(
                err.response?.data?.message || "Failed to book appointment."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout>
            <h1>Book Appointment</h1>

            <form onSubmit={bookAppointment}>
                <input
                    type="text"
                    name="doctor_name"
                    placeholder="Doctor Name"
                    value={form.doctor_name}
                    onChange={handleChange}
                    required
                />

                <input
                    type="text"
                    name="department"
                    placeholder="Department"
                    value={form.department}
                    onChange={handleChange}
                    required
                />

                <input
                    type="date"
                    name="appointment_date"
                    value={form.appointment_date}
                    onChange={handleChange}
                    required
                />

                <input
                    type="time"
                    name="appointment_time"
                    value={form.appointment_time}
                    onChange={handleChange}
                    required
                />

                <textarea
                    name="reason"
                    placeholder="Reason for Appointment"
                    value={form.reason}
                    onChange={handleChange}
                    rows={4}
                    required
                />

                <button type="submit" disabled={loading}>
                    {loading ? "Booking..." : "Book Appointment"}
                </button>
            </form>
        </DashboardLayout>
    );
}