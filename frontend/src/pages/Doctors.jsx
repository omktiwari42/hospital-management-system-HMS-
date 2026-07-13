import { useState, useEffect } from "react";
import api from "../services/api";
import { hmsToast } from "../utils/hmsToast";
import { useNavigate } from "react-router-dom";
import DoctorsSkeleton from "../components/skeletons/DoctorsSkeleton";

function Doctors() {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] =
    useState([]);

  const [name, setName] = useState("");
  const [specialization, setSpecialization] =
    useState("");
  const [experience, setExperience] =
    useState("");

  const [fees, setFees] =
    useState("");

  const [phone, setPhone] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [availability, setAvailability] =
    useState("");

  const [search, setSearch] = useState("");

  const [editingId, setEditingId] =
    useState(null);
  const [loading, setLoading] = useState(true);
  async function fetchDoctors() {
    try {
      setLoading(true);

      const response = await api.get("/doctors");

      setDoctors(response.data);
      setFilteredDoctors(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchDoctors();
  }, []);

  useEffect(() => {
    const filtered = doctors.filter(
      (doctor) =>
        doctor.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        doctor.specialization
          .toLowerCase()
          .includes(search.toLowerCase())
    );

    setFilteredDoctors(filtered);
  }, [search, doctors]);

  async function addDoctor() {
    if (
      !name.trim() ||
      !specialization.trim()
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      await api.post("/doctors", {
        name,
        specialization,
        experience,
        fees,
        phone,
        email,
        availability,
      });
      hmsToast.success("✅ Doctor Added Successfully", {
        position: "top-right",
        autoClose: 2000,
      });

      await fetchDoctors();

      setName("");
      setSpecialization("");
      setExperience("");
      setFees("");
      setPhone("");
      setEmail("");
      setAvailability("");
    } catch (error) {
      console.log(
        "Error adding doctor:",
        error
      );
    }
  }
  async function updateDoctor() {
    try {
      await api.put(`/doctors/${editingId}`, {
        name,
        specialization,
        experience,
        fees,
        phone,
        email,
        availability,
      });

      hmsToast.success("✅ Doctor Updated Successfully", {
        position: "top-right",
        autoClose: 2000,
      });

      await fetchDoctors();

      setName("");
      setSpecialization("");
      setExperience("");
      setFees("");
      setPhone("");
      setEmail("");
      setAvailability("");

      setEditingId(null);
    } catch (error) {
      console.log("Error updating doctor:", error);

      hmsToast.error("❌ Failed to Update Doctor", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  }
  async function deleteDoctor(id) {
    if (!window.confirm("Delete this doctor?")) {
      return;
    }

    try {
      await api.delete(`/doctors/${id}`);

      hmsToast.success("✅ Doctor Deleted Successfully", {
        position: "top-right",
        autoClose: 2000,
      });

      await fetchDoctors();
    } catch (error) {
      console.log("Error deleting doctor:", error);

      hmsToast.error("❌ Failed to Delete Doctor", {
        position: "top-right",
        autoClose: 2000,
      });
    }
  }

  function editDoctor(doctor) {
    setName(doctor.name);

    setSpecialization(
      doctor.specialization
    );

    setExperience(
      doctor.experience || ""
    );

    setFees(
      doctor.fees || ""
    );

    setPhone(
      doctor.phone || ""
    );

    setEmail(
      doctor.email || ""
    );

    setAvailability(
      doctor.availability || ""
    );

    setEditingId(doctor.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }
  if (loading) {
    return <DoctorsSkeleton />
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
      <h1>🩺 Doctors Management</h1>

      <div className="card">
        <h3>
          {editingId
            ? "Update Doctor"
            : "Add Doctor"}
        </h3>

        <input
          type="text"
          placeholder="Doctor Name"
          value={name}
          onChange={(e) =>
            setName(e.target.value)
          }
        />

        <br />
        <br />

        <input
          type="text"
          placeholder="Specialization"
          value={specialization}
          onChange={(e) =>
            setSpecialization(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <input
          type="number"
          placeholder="Experience (Years)"
          value={experience}
          onChange={(e) =>
            setExperience(
              e.target.value
            )
          }
        />

        <br />
        <br />

        <input
          type="number"
          placeholder="Consultation Fee"
          value={fees}
          onChange={(e) =>
            setFees(e.target.value)
          }
        />

        <br />
        <br />

        <input
          type="text"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
        />

        <br />
        <br />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
        />

        <br />
        <br />

        <select
          value={availability}
          onChange={(e) =>
            setAvailability(
              e.target.value
            )
          }
        >
          <option value="">
            Availability
          </option>

          <option value="Available">
            Available
          </option>

          <option value="Busy">
            Busy
          </option>

          <option value="On Leave">
            On Leave
          </option>
        </select>

        <br />
        <br />

        {editingId ? (
          <button
            onClick={updateDoctor}
          >
            Update Doctor
          </button>
        ) : (
          <button
            onClick={addDoctor}
          >
            Add Doctor
          </button>
        )}
      </div>

      <br />

      <div className="card">
        <input
          type="text"
          placeholder="🔍 Search Doctor"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
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
                <th>Name</th>
                <th>Specialization</th>
                <th>Experience</th>
                <th>Fee</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredDoctors.map(
                (doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.id}</td>

                    <td>{doctor.name}</td>

                    <td>
                      {
                        doctor.specialization
                      }
                    </td>

                    <td>
                      {doctor.experience}
                    </td>

                    <td>
                      ₹{doctor.fees}
                    </td>

                    <td>
                      {doctor.phone}
                    </td>

                    <td>
                      {
                        doctor.availability
                      }
                    </td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="edit-btn"
                          onClick={() =>
                            editDoctor(
                              doctor
                            )
                          }
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() =>
                            deleteDoctor(
                              doctor.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
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

export default Doctors;