import { useState, useEffect } from "react";
import api from "../services/api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function Appointments() {
  const [appointments, setAppointments] =
    useState([]);

  const [
    filteredAppointments,
    setFilteredAppointments,
  ] = useState([]);

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

    setAppointmentDate(
      new Date(
        `${appointment.appointment_date}T${appointment.appointment_time}`
      )
    );
  }

  useEffect(() => {
    fetchAppointments();
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

      fetchAppointments();

      setPatientName("");
      setDoctorName("");
      setAppointmentDate(
        new Date()
      );

      setEditingId(null);
    } catch (error) {
      console.log(
        "Error updating appointment:",
        error
      );
    }
  }

  async function deleteAppointment(
    id
  ) {
    if (
      !window.confirm(
        "Delete this appointment?"
      )
    ) {
      return;
    }

    try {
      await api.delete(
        `/appointments/${id}`
      );

      fetchAppointments();
    } catch (error) {
      console.log(
        "Error deleting appointment:",
        error
      );
    }
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
          type="text"
          placeholder="Doctor Name"
          value={doctorName}
          onChange={(e) =>
            setDoctorName(
              e.target.value
            )
          }
        />
        <br />
        <br />

        <DatePicker
          selected={appointmentDate}
          onChange={(date) =>
            setAppointmentDate(date)
          }
          showTimeSelect
          timeIntervals={15}
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
          >
            Add Appointment
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
        <table className="patient-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Patient</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Edit</th>
              <th>Delete</th>
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
                      onClick={() =>
                        deleteAppointment(
                          appointment.id
                        )
                      }
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Appointments;