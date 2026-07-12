import { useEffect, useMemo, useState } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import api from "../services/api";
import BillingSkeleton from "./BillingSkeleton";

export default function PatientBilling() {

    const [loading, setLoading] = useState(true);

    const [bills, setBills] = useState([]);

    const [search, setSearch] = useState("");

    const [selectedBill, setSelectedBill] = useState(null);
    const [showInvoice, setShowInvoice] = useState(false);

    async function loadBills() {

        try {

            setLoading(true);


            const res = await api.get("/patient/bills");


            setBills(res.data.bills || []);

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadBills();

    }, []);

    const filteredBills = useMemo(() => {

        return bills.filter((bill) => {

            const doctor = bill.doctor_name || "";

            const patient = bill.patient_name || "";

            const id = String(bill.id || "");

            return (

                doctor.toLowerCase().includes(search.toLowerCase()) ||

                patient.toLowerCase().includes(search.toLowerCase()) ||

                id.includes(search)

            );

        });

    }, [bills, search]);

    const totalBills = bills.length;

    const paidBills = bills.filter(

        bill => bill.payment_status === "Paid"

    ).length;

    const pendingBills = bills.filter(

        bill => bill.payment_status !== "Paid"

    ).length;

    const totalAmount = bills.reduce(

        (sum, bill) => sum + Number(bill.amount || 0),

        0

    );

    if (loading) {
        return (
            <DashboardLayout>
                <BillingSkeleton />
            </DashboardLayout>
        );
    }
    function openInvoice(bill) {
        setSelectedBill(bill);
        setShowInvoice(true);
    }

    function closeInvoice() {
        setShowInvoice(false);
        setSelectedBill(null);
    }

    function printInvoice() {
        window.print();
    }

    return (

        <DashboardLayout>

            <div className="patient-billing-page">

                <div className="billing-header">

                    <div>

                        <h1>🧾 My Bills</h1>

                        <p>

                            View all hospital bills and payment history.

                        </p>

                    </div>

                </div>

                <div className="billing-summary-grid">

                    <div className="billing-summary-card">

                        <h3>Total Bills</h3>

                        <h2>{totalBills}</h2>

                    </div>

                    <div className="billing-summary-card">

                        <h3>Paid</h3>

                        <h2>{paidBills}</h2>

                    </div>

                    <div className="billing-summary-card">

                        <h3>Pending</h3>

                        <h2>{pendingBills}</h2>

                    </div>

                    <div className="billing-summary-card">

                        <h3>Total Amount</h3>

                        <h2>₹{totalAmount}</h2>

                    </div>

                </div>

                <div className="billing-search">

                    <input

                        type="text"

                        placeholder="Search by Bill ID, Doctor..."

                        value={search}

                        onChange={(e) => setSearch(e.target.value)}

                    />

                </div>

                {filteredBills.length === 0 ? (

                    <div className="empty-bills">

                        <h2>No Bills Found</h2>

                    </div>

                ) : (

                    <div className="billing-table-wrapper">

                        <table className="billing-table">

                            <thead>

                                <tr>

                                    <th>Bill ID</th>

                                    <th>Doctor</th>

                                    <th>Patient</th>

                                    <th>Amount</th>

                                    <th>Status</th>

                                    <th>Payment</th>

                                    <th>Date</th>

                                    <th>Action</th>

                                </tr>

                            </thead>

                            <tbody>

                                {filteredBills.map((bill) => (

                                    <tr key={bill.id}>

                                        <td>

                                            #{bill.id}

                                        </td>

                                        <td>

                                            {bill.doctor_name || "-"}

                                        </td>

                                        <td>

                                            {bill.patient_name}

                                        </td>

                                        <td>

                                            ₹{bill.amount}

                                        </td>

                                        <td>

                                            <span

                                                className={

                                                    bill.status === "Paid"

                                                        ? "paid"

                                                        : "pending"

                                                }

                                            >

                                                {bill.status}

                                            </span>

                                        </td>

                                        <td>

                                            <span

                                                className={

                                                    bill.payment_status === "Paid"

                                                        ? "paid"

                                                        : "pending"

                                                }

                                            >

                                                {bill.payment_status}

                                            </span>

                                        </td>

                                        <td>
                                            {bill.appointment_date
                                                ? new Date(bill.appointment_date).toLocaleDateString("en-IN")
                                                : "-"}
                                        </td>

                                        <td>

                                            <button
                                                className="view-bill-btn"
                                                onClick={() => openInvoice(bill)}
                                            >
                                                👁 View
                                            </button>

                                        </td>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}

            </div>
            {showInvoice && selectedBill && (

                <div className="invoice-overlay">

                    <div className="invoice-container">

                        <button
                            className="invoice-close"
                            onClick={closeInvoice}
                        >

                            ✕

                        </button>

                        <h1>🏥 Hospital Invoice</h1>

                        <div className="invoice-section">

                            <div>

                                <strong>Bill ID</strong>

                                <p>#{selectedBill.id}</p>

                            </div>

                            <div>

                                <strong>Appointment</strong>

                                <p>#{selectedBill.appointment_id}</p>

                            </div>

                            <div>

                                <strong>Doctor</strong>

                                <p>

                                    Dr. {selectedBill.doctor_name}

                                </p>

                            </div>

                            <div>

                                <strong>Department</strong>

                                <p>

                                    {selectedBill.department}

                                </p>

                            </div>

                            <div>

                                <strong>Date</strong>

                                <p>

                                    {selectedBill.appointment_date}

                                </p>

                            </div>

                            <div>

                                <strong>Time</strong>

                                <p>

                                    {selectedBill.appointment_time}

                                </p>

                            </div>

                            <div>

                                <strong>Amount</strong>

                                <h2>

                                    ₹{selectedBill.amount}

                                </h2>

                            </div>

                            <div>

                                <strong>Payment Status</strong>

                                <p>

                                    {selectedBill.payment_status}

                                </p>

                            </div>

                        </div>

                        <div className="invoice-buttons">

                            <button
                                className="print-btn"
                                onClick={() => window.print()}
                            >
                                🖨 Print
                            </button>

                            <button
                                className="close-btn"
                                onClick={closeInvoice}
                            >

                                Close

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </DashboardLayout>

    );

}