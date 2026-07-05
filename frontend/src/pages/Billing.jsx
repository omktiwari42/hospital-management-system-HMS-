import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import jsPDF from "jspdf";
import { toast } from "react-toastify";
import autoTable from "jspdf-autotable";
import BillingSkeleton from "../components/skeletons/BillingSkeleton";
import AppointmentsSkeleton from "../components/skeletons/AppointmentsSkeleton";
function Billing() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    appointmentId,
    patientName: paymentPatientName,
    amount: paymentAmount,
    autoPay,
  } = location.state || {};
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] =
    useState([]);

  const [patientName, setPatientName] =
    useState("");
  const [selectedBill, setSelectedBill] = useState(null);


  const [amount, setAmount] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchBills() {
    try {
      setLoading(true);

      const response = await api.get("/bills");

      setBills(response.data);
      setFilteredBills(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    if (!appointmentId || bills.length === 0) return;

    const bill = bills.find(
      (b) => Number(b.appointment_id) === Number(appointmentId)
    );

    if (bill && autoPay) {
      payBill(bill);
    }
  }, [appointmentId, bills, autoPay]);

  useEffect(() => {
    fetchBills();
  }, []);

  useEffect(() => {
    const filtered = bills.filter(
      (bill) =>
        bill.patient_name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          ) ||
        bill.status
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

    setFilteredBills(filtered);
  }, [search, bills]);

  async function addBill() {
    if (
      !patientName ||
      !amount ||
      !status
    ) {
      toast.warning("Please fill all fields");
      return;
    }

    try {
      await api.post("/bills", {
        patientName,
        amount,
        status,
      });

      fetchBills();

      setPatientName("");
      setAmount("");
      setStatus("");
    } catch (error) {
      console.log(error);
    }
  }

  function editBill(bill) {
    setPatientName(
      bill.patient_name
    );

    setAmount(bill.amount);

    setStatus(bill.status);

    setEditingId(bill.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function updateBill() {
    try {
      await api.put(
        `/bills/${editingId}`,
        {
          patientName,
          amount,
          status,
        }
      );

      fetchBills();

      setPatientName("");
      setAmount("");
      setStatus("");

      setEditingId(null);
    } catch (error) {
      console.log(error);
    }
  }

  async function deleteBill(id) {
    if (
      !window.confirm(
        "Delete this bill?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/bills/${id}`
      );

      fetchBills();
    } catch (error) {
      console.log(error);
    }
  }
  function downloadInvoice(bill) {
    const doc = new jsPDF();

    doc.setFontSize(20);

    doc.text(
      "Hospital Management System",
      20,
      20
    );

    doc.setFontSize(14);

    doc.text(
      "Invoice Receipt",
      20,
      35
    );

    autoTable(doc, {
      startY: 50,
      body: [
        [
          "Invoice ID",
          bill.id,
        ],
        [
          "Patient Name",
          bill.patient_name,
        ],
        [
          "Amount",
          `₹${bill.amount}`,
        ],
        [
          "Status",
          bill.status,
        ],
        [
          "Payment Status",
          bill.payment_status ||
          "Pending",
        ],
        [
          "Transaction ID",
          bill.transaction_id ||
          "N/A",
        ],
        [
          "Date",
          new Date().toLocaleDateString(),
        ],
      ],
    });

    doc.save(
      `Invoice-${bill.id}.pdf`
    );
  }
  async function payBill(bill) {
    console.log("PAY BUTTON CLICKED", bill);
    try {
      const { data: order } = await api.post(
        "/create-order",
        {
          amount: bill.amount,
        }
      );

      const options = {
        key: "rzp_test_T99nYTP866jEID",

        amount: order.amount,

        currency: order.currency,

        name: "Hospital Management System",

        description: `Bill #${bill.id}`,

        order_id: order.id,

        handler: async function (response) {
          try {
            await api.post("/verify-payment", {
              razorpay_order_id:
                response.razorpay_order_id,

              razorpay_payment_id:
                response.razorpay_payment_id,

              razorpay_signature:
                response.razorpay_signature,

              billId: bill.id,
            });

            toast.success("✅ Payment Successful");

            fetchBills();
          } catch (error) {
            console.log(error);

            toast.warning("Payment verification failed");
          }
        },

        prefill: {
          name: bill.patient_name,
        },

        theme: {
          color: "#2563eb",
        },
      };
      console.log(options);
      console.log(import.meta.env.VITE_RAZORPAY_KEY_ID);

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response) {
          alert(
            response.error.description
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.log("FULL ERROR:", error);
      console.log("RESPONSE:", error.response);
      console.log("DATA:", error.response?.data);

      alert(error.response?.data?.message || error.message);
    }
  }
  if (loading) {
    return <AppointmentsSkeleton />
  }
  return (
    <div className="page">

      <div className="page-header">
        <button
          className="back-btn"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>

        <button
          className="dashboard-btn"
          onClick={() => navigate("/dashboard")}
        >
          🏠 Dashboard
        </button>
      </div>

      <h1>💳 Billing Management</h1>
      <div className="card">
        <h3>
          {editingId
            ? "Update Bill"
            : "Add Bill"}
        </h3>

        <input
          type="text"
          placeholder="Patient Name"
          value={patientName}
          onChange={(e) =>
            setPatientName(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) =>
            setAmount(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <select
          value={status}
          onChange={(e) =>
            setStatus(
              e.target.value
            )
          }
        >
          <option value="">
            Select Status
          </option>

          <option value="Paid">
            Paid
          </option>

          <option value="Pending">
            Pending
          </option>
        </select>

        <br />
        <br />

        {editingId ? (
          <button
            onClick={updateBill}
          >
            Update Bill
          </button>
        ) : (
          <button
            onClick={addBill}
          >
            Add Bill
          </button>
        )}
      </div>

      <br />

      <div className="card">
        <input
          type="text"
          placeholder="🔍 Search Bill"
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
        />
      </div>

      <br />

      <div className="card">
        <div className="table-container">
          <table className="patient-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment Status</th>
                <th>Transaction ID</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredBills.map((bill) => (
                <tr key={bill.id}>
                  <td>{bill.id}</td>

                  <td>{bill.patient_name}</td>

                  <td>₹{bill.amount}</td>

                  <td>{bill.status}</td>

                  <td>
                    {bill.payment_status ||
                      "Pending"}
                  </td>

                  <td>
                    {bill.transaction_id ||
                      "N/A"}
                  </td>

                  <td>
                    <div
                      className="action-buttons"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px",
                        alignItems: "center",
                      }}
                    >
                      <button
                        className="edit-btn"
                        onClick={() => editBill(bill)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => deleteBill(bill.id)}
                      >
                        Delete
                      </button>

                      <button
                        className="pdf-btn"
                        onClick={() => downloadInvoice(bill)}
                      >
                        📄 PDF
                      </button>


                      {bill.payment_status !== "Paid" && (
                        <button
                          className="pay-btn"
                          onClick={() => payBill(bill)}
                        >
                          Pay Now
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Billing;