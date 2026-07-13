import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import PatientsSkeleton from "../components/skeletons/PatientsSkeleton";



import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { hmsToast } from "../utils/hmsToast";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function Patients() {
  const navigate = useNavigate();
  const [showForm, setShowForm] =
    useState(false);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] =
    useState([]);

  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");
  const [bloodGroup, setBloodGroup] =
    useState("");
  const [address, setAddress] =
    useState("");
  const [email, setEmail] =
    useState("");

  const [
    emergencyContact,
    setEmergencyContact,
  ] = useState("");
  const [weight, setWeight] =
    useState("");
  const [height, setHeight] =
    useState("");
  const [allergies, setAllergies] =
    useState("");
  const [
    medicalHistory,
    setMedicalHistory,
  ] = useState("");

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] =
    useState(null);

  const [loading, setLoading] = useState(true);

  async function fetchPatients() {
    try {
      setLoading(true);

      const response = await api.get("/patients");

      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.log("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.name
          ?.toLowerCase()
          .includes(
            search.toLowerCase()
          )
    );

    setFilteredPatients(filtered);
  }, [search, patients]);
  async function uploadReport(patientId, file) {
    const formData = new FormData();

    formData.append("report", file);

    try {
      await api.post(
        `/upload-report/${patientId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      hmsToast.success("Report Uploaded Successfully");
    } catch (error) {
      console.log(error);
      hmsToast.warning("Upload Failed");
    }
  }
  async function addPatient() {
    if (!name.trim() || !age) {
      hmsToast.warning(
        "Please fill all fields"
      );
      return;
    }

    try {
      await api.post("/patients", {
        name,
        age,
        phone,
        gender,
        bloodGroup,
        address,
        email,
        emergencyContact,
        weight,
        height,
        allergies,
        medicalHistory,
      });

      await fetchPatients();

      hmsToast.success(
        "Patient Added Successfully"
      );
      setShowForm(false);

      setName("");
      setAge("");
      setPhone("");
      setGender("");
      setBloodGroup("");
      setAddress("");
      setEmail("");
      setEmergencyContact("");
      setWeight("");
      setHeight("");
      setAllergies("");
      setMedicalHistory("");

    } catch (error) {
      console.log(
        "Error adding patient:",
        error
      );

      hmsToast.error(
        "Failed to add patient"
      );
    }
  }
  async function deletePatient(id) {

    if (
      !window.confirm(
        "Delete this patient?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/patients/${id}`
      );
      await fetchPatients();
      hmsToast.success(
        "Patient Deleted Successfully"
      );


    } catch (error) {
      console.log(
        "Error deleting patient:",
        error
      );

      hmsToast.error(
        "Failed to delete patient"
      );
    }
  }
  // DOWNLOADPDF
  function downloadPDF() {
    if (
      filteredPatients.length === 0
    ) {
      alert(
        "No patients available to export"
      );
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "Hospital Management System",
      14,
      15
    );

    doc.setFontSize(12);

    doc.text(
      "Patients Report",
      14,
      25
    );

    autoTable(doc, {
      startY: 35,

      head: [
        [
          "ID",
          "Name",
          "Age",
          "Phone",
          "Gender",
          "Blood Group",
        ],
      ],

      body: filteredPatients.map(
        (patient) => [
          patient.id,
          patient.name,
          patient.age,
          patient.phone,
          patient.gender,
          patient.blood_group,
        ]
      ),
    });

    doc.save(
      `patients-report-${new Date()
        .toISOString()
        .split("T")[0]}.pdf`
    );
  }
  function downloadExcel() {
    if (
      filteredPatients.length === 0
    ) {
      alert(
        "No patients available to export"
      );
      return;
    }

    const worksheet =
      XLSX.utils.json_to_sheet(
        filteredPatients
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Patients"
    );

    const excelBuffer =
      XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

    const fileData =
      new Blob([excelBuffer], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

    saveAs(
      fileData,
      "patients-report.xlsx"
    );
  }
  // Download
  function editPatient(patient) {
    setShowForm(true);   // ADD THIS LINE

    setName(patient.name);
    setAge(patient.age);
    setPhone(patient.phone || "");
    setGender(patient.gender || "");
    setBloodGroup(patient.blood_group || "");
    setAddress(patient.address || "");
    setEmail(patient.email || "");
    setEmergencyContact(patient.emergency_contact || "");
    setWeight(patient.weight || "");
    setHeight(patient.height || "");
    setAllergies(patient.allergies || "");
    setMedicalHistory(patient.medical_history || "");

    setEditingId(patient.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function updatePatient() {
    if (!name.trim() || !age) {
      hmsToast.warning(
        "Please fill all fields"
      );
      return;
    }

    try {
      await api.put(
        `/patients/${editingId}`,
        {
          name,
          age,
          phone,
          gender,
          bloodGroup,
          address,
          email,
          emergencyContact,
          weight,
          height,
          allergies,
          medicalHistory,
        }
      );

      await fetchPatients();

      hmsToast.success(
        "Patient Updated Successfully"
      );

      setName("");
      setAge("");
      setPhone("");
      setGender("");
      setBloodGroup("");
      setAddress("");
      setEmail("");
      setEmergencyContact("");
      setWeight("");
      setHeight("");
      setAllergies("");
      setMedicalHistory("");

      setEditingId(null);
      setShowForm(false);
    } catch (error) {
      console.log("UPDATE ERROR:", error);
      console.log("RESPONSE:", error.response?.data);

      hmsToast.error(
        "Failed to update patient"
      );
    }
  }
  if (loading) {
    return <PatientsSkeleton />
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
      <div className="page-header">
        <h1>👨‍⚕️ Patients Management</h1>

        <div className="header-actions">
          <button
            onClick={downloadPDF}
            className="pdf-btn"
          >
            📄 Export PDF
          </button>

          <button
            onClick={downloadExcel}
            className="excel-btn"
          >
            📊 Export Excel
          </button>
        </div>
      </div>
      <div className="form-toggle">
        <button
          className="toggle-btn"
          onClick={() =>
            setShowForm(!showForm)
          }
        >
          {showForm
            ? "▲ Hide Form"
            : "➕ Add Patient"}
        </button>
      </div>

      {showForm && (

        <div className="card patient-form">

          <h3>
            {editingId
              ? "Update Patient"
              : "Add Patient"}
          </h3>
          <input
            type="text"
            placeholder="Patient Name"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
          />


          <input
            type="number"
            placeholder="Age"
            value={age}
            onChange={(e) =>
              setAge(e.target.value)
            }
          />



          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) =>
              setPhone(e.target.value)
            }
          />


          <select
            value={gender}
            onChange={(e) =>
              setGender(e.target.value)
            }
          >
            <option value="">
              Select Gender
            </option>
            <option value="Male">
              Male
            </option>
            <option value="Female">
              Female
            </option>
            <option value="Other">
              Other
            </option>
          </select>


          <select
            value={bloodGroup}
            onChange={(e) =>
              setBloodGroup(
                e.target.value
              )
            }
          >
            <option value="">
              Blood Group
            </option>
            <option value="A+">
              A+
            </option>
            <option value="A-">
              A-
            </option>
            <option value="B+">
              B+
            </option>
            <option value="B-">
              B-
            </option>
            <option value="AB+">
              AB+
            </option>
            <option value="AB-">
              AB-
            </option>
            <option value="O+">
              O+
            </option>
            <option value="O-">
              O-
            </option>
          </select>


          {/* <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
          /> */}



          <input
            type="text"
            placeholder="Emergency Contact"
            value={emergencyContact}
            onChange={(e) =>
              setEmergencyContact(
                e.target.value
              )
            }
          />



          {/* <input
            type="number"
            placeholder="Weight (kg)"
            value={weight}
            onChange={(e) =>
              setWeight(e.target.value)
            }
          />


          <input
            type="number"
            placeholder="Height (cm)"
            value={height}
            onChange={(e) =>
              setHeight(e.target.value)
            }
          /> */}



          <textarea
            placeholder="Address"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
          />



          <textarea
            placeholder="Allergies"
            value={allergies}
            onChange={(e) =>
              setAllergies(e.target.value)
            }
          />


          <textarea
            placeholder="Medical History"
            value={medicalHistory}
            onChange={(e) =>
              setMedicalHistory(
                e.target.value
              )
            }
          />

          {editingId ? (
            <button
              onClick={updatePatient}
            >
              Update Patient
            </button>
          ) : (
            <button
              onClick={addPatient}
            >
              Add Patient
            </button>
          )}
        </div>
      )}



      <div className="card">
        <input
          type="text"
          placeholder="🔍 Search Patient"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </div>



      <div className="card">
        <div className="table-container">
          <table className="patient-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Age</th>
                <th>Phone</th>
                <th>Gender</th>
                <th>Blood Group</th>
                <th>Actions</th>
                <th>Report</th>
              </tr>
            </thead>

            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id}>
                  <td>{patient.id}</td>

                  <td>{patient.name}</td>

                  <td>{patient.age}</td>

                  <td>{patient.phone}</td>

                  <td>{patient.gender}</td>

                  <td>{patient.blood_group}</td>

                  {/* ACTIONS */}
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-btn"
                        onClick={() => editPatient(patient)}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() =>
                          deletePatient(patient.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </td>

                  {/* REPORT */}
                  <td>
                    <input
                      type="file"
                      id={`file-${patient.id}`}
                      style={{ display: "none" }}
                      onChange={(e) => {
                        const file = e.target.files[0];

                        if (file) {
                          uploadReport(patient.id, file);
                        }
                      }}
                    />

                    <button
                      onClick={() =>
                        document
                          .getElementById(
                            `file-${patient.id}`
                          )
                          .click()
                      }
                    >
                      Upload Report
                    </button>
                    {patient.report && (
                      <>
                        <a
                          href={`https://hospital-backend-8pek.onrender.com/uploads/${patient.report}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <button>View</button>
                        </a>

                        <a
                          href={`https://hospital-backend-8pek.onrender.com/uploads/${patient.report}`}
                          download
                        >
                          <button>Download</button>

                        </a>
                      </>
                    )}
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


export default Patients;
