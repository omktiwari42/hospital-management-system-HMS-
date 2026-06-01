import { useState, useEffect } from "react";
import api from "../services/api";
import { toast } from "react-toastify";
function Patients() {
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

  async function fetchPatients() {
    try {
      const response =
        await api.get("/patients");

      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.log(
        "Error fetching patients:",
        error
      );
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

  async function addPatient() {
  if (!name.trim() || !age) {
    toast.warning(
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

    toast.success(
      "Patient Added Successfully"
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

  } catch (error) {
    console.log(
      "Error adding patient:",
      error
    );

    toast.error(
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
    toast.success(
      "Patient Deleted Successfully"
    );

    
  } catch (error) {
    console.log(
      "Error deleting patient:",
      error
    );

    toast.error(
      "Failed to delete patient"
    );
  }
}
 function editPatient(patient) {
  setName(patient.name);
  setAge(patient.age);

  setPhone(patient.phone || "");
  setGender(patient.gender || "");
  setBloodGroup(
    patient.blood_group || ""
  );

  setAddress(patient.address || "");
  setEmail(patient.email || "");

  setEmergencyContact(
    patient.emergency_contact || ""
  );

  setWeight(patient.weight || "");
  setHeight(patient.height || "");

  setAllergies(
    patient.allergies || ""
  );

  setMedicalHistory(
    patient.medical_history || ""
  );

  setEditingId(patient.id);

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

async function updatePatient() {
  if (!name.trim() || !age) {
    toast.warning(
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

    toast.success(
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
  } catch (error) {
    console.log(
      "Error updating patient:",
      error
    );

    toast.error(
      "Failed to update patient"
    );
  }
}  
return (
  <div className="page">
    <h1>👨‍⚕️ Patients Management</h1>

    <div className="card">
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

      <br />
      <br />

      <input
        type="number"
        placeholder="Age"
        value={age}
        onChange={(e) =>
          setAge(e.target.value)
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

      <br />
      <br />

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

      <br />
      <br />

      <input
        type="number"
        placeholder="Weight (kg)"
        value={weight}
        onChange={(e) =>
          setWeight(e.target.value)
        }
      />

      <br />
      <br />

      <input
        type="number"
        placeholder="Height (cm)"
        value={height}
        onChange={(e) =>
          setHeight(e.target.value)
        }
      />

      <br />
      <br />

      <textarea
        placeholder="Address"
        value={address}
        onChange={(e) =>
          setAddress(e.target.value)
        }
      />

      <br />
      <br />

      <textarea
        placeholder="Allergies"
        value={allergies}
        onChange={(e) =>
          setAllergies(e.target.value)
        }
      />

      <br />
      <br />

      <textarea
        placeholder="Medical History"
        value={medicalHistory}
        onChange={(e) =>
          setMedicalHistory(
            e.target.value
          )
        }
      />

      <br />
      <br />

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

    <br />

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

    <br />

    <div className="card">
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
          </tr>
        </thead>

        <tbody>
  {filteredPatients.map(
    (patient) => (
      <tr key={patient.id}>
        <td>{patient.id}</td>

        <td>{patient.name}</td>

        <td>{patient.age}</td>

        <td>{patient.phone}</td>

        <td>{patient.gender}</td>

        <td>
          {patient.blood_group}
        </td>

        <td>
          <div className="action-buttons">
            <button
              className="edit-btn"
              onClick={() =>
                editPatient(patient)
              }
            >
              Edit
            </button>

            <button
              className="delete-btn"
              onClick={() =>
                deletePatient(
                  patient.id
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
);
}


export default Patients;
