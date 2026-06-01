import { useState, useEffect } from "react";
import api from "../services/api";

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

  const [date, setDate] = useState("");

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

  async function addAppointment() {
    if (
      !patientName ||
      !doctorName ||
      !date
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post(
        "/appointments",
        {
          patientName,
          doctorName,
          date,
        }
      );

      fetchAppointments();

      setPatientName("");
      setDoctorName("");
      setDate("");
    } catch (error) {
      console.log(
        "Error adding appointment:",
        error
      );
    }
  }

  function editAppointment(
    appointment
  ) {
    setPatientName(
      appointment.patient_name
    );

    setDoctorName(
      appointment.doctor_name
    );

    setDate(
      appointment.appointment_date?.split(
        "T"
      )[0]
    );

    setEditingId(
      appointment.id
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function updateAppointment() {
    try {
      await api.put(
        `/appointments/${editingId}`,
        {
          patientName,
          doctorName,
          date,
        }
      );

      fetchAppointments();

      setPatientName("");
      setDoctorName("");
      setDate("");

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

        <input
          type="date"
          value={date}
          onChange={(e) =>
            setDate(
              e.target.value
            )
          }
        />

        <br />
        <br />

        {editingId ? (
          <button
            onClick={
              updateAppointment
            }
          >
            Update Appointment
          </button>
        ) : (
          <button
            onClick={
              addAppointment
            }
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