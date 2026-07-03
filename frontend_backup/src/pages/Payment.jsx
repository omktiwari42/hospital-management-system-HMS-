import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api from "../services/api";

function Payment() {
    const location = useLocation();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);

    const {
        patientName,
        amount,
        appointmentId,
    } = location.state || {};
    function downloadReceipt() {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Hospital Management System", 20, 20);

        doc.setFontSize(14);
        doc.text("Payment Receipt", 20, 35);

        autoTable(doc, {
            startY: 50,
            head: [["Field", "Value"]],
            body: [
                ["Patient", patientName],
                ["Appointment ID", appointmentId],
                ["Amount", `₹${amount}`],
                ["Status", "Paid"],
                ["Payment Method", "Online"],
                ["Date", new Date().toLocaleString()],
            ],
        });

        doc.save(`Receipt_${appointmentId}.pdf`);
    }
    async function payNow() {
        console.log("PAY BUTTON CLICKED");
        try {
            const orderResponse =
                await api.post(
                    "/create-order",
                    {
                        amount,
                    }
                );

            const order =
                orderResponse.data;

            const options = {
                key: "rzp_test_actual_key_here", // Replace with your Razorpay Key ID

                amount: order.amount,

                currency:
                    order.currency,

                name:
                    "Hospital Management System",

                description:
                    "Appointment Payment",

                order_id: order.id,

                handler:
                    async function (
                        response
                    ) {
                        try {
                            await api.put(
                                `/bills/pay/${appointmentId}`
                            );

                            toast.success(
                                "Payment Successful ✅"
                            );

                            navigate(
                                "/billing"
                            );
                        } catch (error) {
                            console.log(
                                error
                            );

                            toast.error(
                                "Failed to update bill"
                            );
                        }
                    },

                prefill: {
                    name:
                        patientName,
                },

                theme: {
                    color:
                        "#2563eb",
                },
            };

            const razorpay =
                new window.Razorpay(
                    options
                );

            razorpay.open();
        } catch (error) {
            console.log(error);

            toast.error(
                "Payment Failed ❌"
            );
        }
    }

    if (!appointmentId) {
        return (
            <div className="page">
                <div className="card">
                    <h2>No Payment Data Found</h2>

                    <br />

                    <button
                        onClick={() =>
                            navigate("/appointments")
                        }
                    >
                        Back to Appointments
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="page">
            <h1>💳 Payment</h1>

            <div className="card">
                <h3>Appointment Payment</h3>

                <br />

                <p>
                    <strong>Patient:</strong>{" "}
                    {patientName}
                </p>

                <br />

                <p>
                    <strong>
                        Appointment ID:
                    </strong>{" "}
                    {appointmentId}
                </p>

                <br />

                <p>
                    <strong>Amount:</strong> ₹
                    {amount}
                </p>

                <br />

                <button
                    onClick={payNow}
                    disabled={loading}
                >
                    {loading
                        ? "⏳ Processing..."
                        : "💳 Pay Now"}
                </button>
            </div>
        </div>
    );
}

export default Payment;