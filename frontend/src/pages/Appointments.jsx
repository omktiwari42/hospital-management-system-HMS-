import { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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


import { toast } from "react-toastify";
function Appointments() {
  const [appointments, setAppointments] =
    useState([]);

  const [
    filteredAppointments,
    setFilteredAppointments,
  ] = useState([]);
  const [doctors, setDoctors] =
    useState([]);
  const [patients, setPatients] =
    useState([]);
  const [patientName, setPatientName] =
    useState("");

  const [doctorName, setDoctorName] =
    useState("");

  const [appointmentDate, setAppointmentDate] =
    useState(new Date());

  const [reason, setReason] =
    useState("");

  const [status, setStatus] =
    useState("Scheduled");

  const [loading, setLoading] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [editingId, setEditingId] =
    useState(null);
  const navigate = useNavigate();

  async function fetchAppointments() {
    try {
      const response =
        await api.get("/appointments");

      setAppointments(response.data);
      setFilteredAppointments(
        response.data
      );
    } catch (error) {
      console.log(
        "Error fetching appointments:",
        error
      );
    }
  }
  async function fetchDoctors() {
    try {
      const response =
        await api.get("/doctors");

      console.log(
        "DOCTORS FROM API:",
        response.data
      );

      setDoctors(response.data);
    } catch (error) {
      console.log(
        "Error fetching doctors:",
        error
      );
    }
  }
  async function fetchPatients() {
    try {
      const response =
        await api.get("/patients");

      setPatients(response.data);
    } catch (error) {
      console.log(
        "Error fetching patients:",
        error
      );
    }
  }
  async function addAppointment() {
    try {
      setLoading(true);

      const date =
        appointmentDate
          .toISOString()
          .split("T")[0];

      const time =
        appointmentDate.toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );
      if (
        !patientName.trim() ||
        !doctorName.trim() ||
        !reason.trim()
      ) {
        toast.error(
          "⚠️ Please fill all fields"
        );
        return;
      }
      await api.post(
        "/appointments",
        {
          patientName,
          doctorName,
          date,
          time,
          reason,
          status,
        }
      );
      toast.success(
        "Appointment Added Successfully✅ ",
        {
          position: "top-right",
          autoClose: 2000,
        }
      );

      setPatientName("");
      setDoctorName("");
      setReason("");
      setStatus("Scheduled");
      setAppointmentDate(
        new Date()
      );

      fetchAppointments();
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to create appointment"
      );
    } finally {
      setLoading(false);
    }
  }
  function editAppointment(
    appointment
  ) {
    setEditingId(
      appointment.id
    );

    setPatientName(
      appointment.patient_name
    );

    setDoctorName(
      appointment.doctor_name
    );

    setReason(
      appointment.reason || ""
    );

    setStatus(
      appointment.status ||
      "Scheduled"
    );

    console.log(appointment);

    setAppointmentDate(
      appointment.appointment_date
        ? new Date(appointment.appointment_date)
        : new Date()
    );
  }

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered =
      appointments.filter(
        (appointment) =>
          appointment.patient_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            ) ||
          appointment.doctor_name
            ?.toLowerCase()
            .includes(
              search.toLowerCase()
            )
      );

    setFilteredAppointments(filtered);
  }, [search, appointments]);


  async function updateAppointment() {
    try {
      const date =
        appointmentDate
          .toISOString()
          .split("T")[0];

      const time =
        appointmentDate.toLocaleTimeString(
          "en-US",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );
      if (
        !patientName.trim() ||
        !doctorName.trim() ||
        !reason.trim()
      ) {
        toast.error(
          "Please fill all fields⚠️ "
        );
        return;
      }
      await api.put(
        `/appointments/${editingId}`,
        {
          patientName,
          doctorName,
          date,
          time,
          reason,
          status,
        }
      );

      toast.success(
        "✏️ Appointment Updated Successfully",
        {
          position: "top-right",
          autoClose: 2000,
        }
      );

      fetchAppointments();

      setPatientName("");
      setDoctorName("");
      setReason("");
      setStatus("Scheduled");
      setAppointmentDate(
        new Date()
      );

      setEditingId(null);
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Failed to update appointment"
      );
    }
  }

  async function deleteAppointment(id) {
    console.log("DELETE STARTED:", id);

    try {
      const response = await api.delete(
        `/appointments/${id}`
      );

      console.log(
        "DELETE SUCCESS:",
        response.data
      );

      toast.success(
        "✅ Appointment Deleted Successfully"
      );

      fetchAppointments();
    } catch (error) {
      console.log(
        "DELETE ERROR:",
        error
      );

      console.log(
        "DELETE ERROR RESPONSE:",
        error.response?.data
      );

      toast.error(
        "❌ Delete Failed"
      );
    }
  }
  function goToPayment(appointment) {
    navigate("/payment", {
      state: {
        patientName: appointment.patient_name,
        amount: 500,
        appointmentId: appointment.id,
      },
    });
  }
  return (
    <div className="page">
      <h1>
        📅 Appointments Management
      </h1>

      <div className="card">
        <h3>
          {editingId
            ? "Update Appointment"
            : "Add Appointment"}
        </h3>

        <select
          value={patientName}
          onChange={(e) =>
            setPatientName(
              e.target.value
            )
          }
        >
          <option value="">
            Select Patient
          </option>

          {patients.map((patient) => (
            <option
              key={patient.id}
              value={patient.name}
            >
              {patient.name}
            </option>
          ))}
        </select>

        <br />
        <br />

        <select
          value={doctorName}
          onChange={(e) =>
            setDoctorName(
              e.target.value
            )
          }
        >
          <option value="">
            Select Doctor
          </option>

          {doctors.map((doctor) => (
            <option
              key={doctor.id}
              value={doctor.name}
            >
              {doctor.name}
              {" - "}
              {
                doctor.specialization
              }
            </option>
          ))}
        </select>
        <br />
        <br />

        <DatePicker
          selected={appointmentDate}
          onChange={(date) =>
            setAppointmentDate(date)
          }
          showTimeSelect
          timeintervals={15}
          dateFormat="dd/MM/yyyy h:mm aa"
          minDate={new Date()}
          placeholderText="Select Date & Time"
        />
        <br />
        <br />

        <input
          type="text"
          placeholder="Reason"
          value={reason}
          onChange={(e) =>
            setReason(e.target.value)
          }
        />

        <br />
        <br />

        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value)
          }
        >
          <option value="Scheduled">
            Scheduled
          </option>

          <option value="Completed">
            Completed
          </option>

          <option value="Cancelled">
            Cancelled
          </option>
        </select>

        <br />
        <br />

        {editingId ? (
          <button
            onClick={updateAppointment}
          >
            Update Appointment
          </button>
        ) : (
          <button
            onClick={addAppointment}
            disabled={loading}
          >
            {loading
              ? "⏳ Adding..."
              : "➕ Add Appointment"}
          </button>
        )}


      </div>

      <br />

      <div className="card">
        <input
          type="text"
          placeholder="🔍 Search Appointment"
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
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Edit</th>
                <th>Delete</th>
                <th>Pay</th>
              </tr>
            </thead>

            <tbody>
              {filteredAppointments.map(
                (
                  appointment
                ) => (
                  <tr
                    key={
                      appointment.id
                    }
                  >
                    <td>
                      {
                        appointment.id
                      }
                    </td>

                    <td>
                      {
                        appointment.patient_name
                      }
                    </td>

                    <td>
                      {
                        appointment.doctor_name
                      }
                    </td>

                    <td>
                      {appointment.appointment_date?.split(
                        "T"
                      )[0]}
                    </td>

                    <td>
                      {
                        appointment.appointment_time
                      }
                    </td>

                    <td>
                      {
                        appointment.status
                      }
                    </td>

                    <td>
                      <button
                        className="edit-btn"
                        onClick={() =>
                          editAppointment(
                            appointment
                          )
                        }
                      >
                        Edit
                      </button>
                    </td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => {
                          console.log(
                            "BUTTON PRESSED",
                            appointment.id
                          );
                          deleteAppointment(
                            appointment.id
                          );
                        }}
                      >
                        Delete
                      </button>
                    </td>
                    <td>
                      <button
                        className="pay-btn"
                        onClick={() =>
                          goToPayment(appointment)
                        }
                      >
                        Pay
                      </button>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Appointments;