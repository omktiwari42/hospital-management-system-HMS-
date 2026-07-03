import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const navigate = useNavigate();

<div className="page-header">
  <button onClick={() => navigate("/dashboard")}>
    🏠 Dashboard
  </button>
</div>
import { useNavigate } from "react-router-dom";

function Patients() {
  const navigate = useNavigate();

  return (
    <div className="page">

      <button
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        ← Back
      </button>

      {/* Rest of your page */}
    </div>
  );
}


import api from "../services/api";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
function Billing() {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] =
    useState([]);

  const [patientName, setPatientName] =
    useState("");

  const [amount, setAmount] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);

  async function fetchBills() {
    try {
      const response =
        await api.get("/bills");

      setBills(response.data);
      setFilteredBills(response.data);
    } catch (error) {
      console.log(error);
    }
  }

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
      alert("Please fill all fields");
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
    }); pdf

    doc.save(
      `Invoice-${bill.id}.pdf`
    );
  }
  return (
    <div className="page">
      <h1>
        💳 Billing Management
      </h1>

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
                      style={{
                        display: "flex",
                        gap: "8px",
                        flexWrap: "wrap",
                      }}
                    >
                      <button
                        className="edit-btn"
                        onClick={() =>
                          editBill(bill)
                        }
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deleteBill(
                            bill.id
                          )
                        }
                      >
                        Delete
                      </button>

                      <button
                        onClick={() =>
                          downloadInvoice(
                            bill
                          )
                        }
                      >
                        PDF
                      </button>
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