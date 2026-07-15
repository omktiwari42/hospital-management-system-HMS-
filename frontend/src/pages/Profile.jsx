import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ProfileSkeleton from "../components/skeletons/ProfileSkeleton";
import { FaEdit, FaTimes } from "react-icons/fa";
function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    gender: "",
    dob: "",
    emergency_contact: "",
    blood_group: "",
    allergies: "",
    medical_history: "",
  });

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data);

      setForm({
        full_name: response.data.full_name || "",
        email: response.data.email || "",
        gender: response.data.gender || "",
        dob: response.data.dob || "",
        emergency_contact: response.data.emergency_contact || "",
        blood_group: response.data.blood_group || "",
        allergies: response.data.allergies || "",
        medical_history: response.data.medical_history || "",
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }
  async function updateProfile() {

    try {

      const token = localStorage.getItem("token");

      await api.put(
        "/profile",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setShowEdit(false);

      getProfile();

    } catch (err) {

      console.log(err);

    }

  }
  if (loading) {
    return <ProfileSkeleton />;
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

        <h1>My Profile</h1>
        <div className="profile-actions">

          <button
            className="edit-profile-btn"
            onClick={() => setShowEdit(true)}
          >
            <FaEdit />
            Edit Profile
          </button>

        </div>

      </div>

      <div className="profile-card">


        <div className="profile-avatar">
          {profile.full_name?.charAt(0)?.toUpperCase() || "U"}
        </div>

        <div className="profile-details">

          <h2>
            {profile.full_name || "User"}
          </h2>

          <span className="role-badge">
            {profile.role || "User"}
          </span>

          <div className="profile-grid">

            <div className="profile-item">
              <label>Full Name</label>
              <p>{profile.full_name || "-"}</p>
            </div>

            <div className="profile-item">
              <label>Phone Number</label>
              <p>{profile.phone || "-"}</p>
            </div>

            <div className="profile-item">
              <label>Role</label>
              <p>{profile.role || "-"}</p>
            </div>

            <div className="profile-item">
              <label>Account Status</label>
              <p>Active</p>
            </div>

          </div>

        </div>

      </div>
      {
        showEdit && (

          <div className="profile-modal">

            <div className="profile-modal-content">

              <div className="profile-modal-header">

                <h2>Edit Profile</h2>

                <button
                  onClick={() => setShowEdit(false)}
                >
                  <FaTimes />
                </button>

              </div>

              <input
                placeholder="Full Name"
                value={form.full_name}
                onChange={(e) =>
                  setForm({
                    ...form,
                    full_name: e.target.value
                  })
                }
              />

              <input
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({
                    ...form,
                    email: e.target.value
                  })
                }
              />

              <input
                placeholder="Gender"
                value={form.gender}
                onChange={(e) =>
                  setForm({
                    ...form,
                    gender: e.target.value
                  })
                }
              />

              <input
                type="date"
                value={form.dob}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dob: e.target.value
                  })
                }
              />

              <input
                placeholder="Emergency Contact"
                value={form.emergency_contact}
                onChange={(e) =>
                  setForm({
                    ...form,
                    emergency_contact: e.target.value
                  })
                }
              />

              <input
                placeholder="Blood Group"
                value={form.blood_group}
                onChange={(e) =>
                  setForm({
                    ...form,
                    blood_group: e.target.value
                  })
                }
              />

              <textarea
                rows="3"
                placeholder="Allergies"
                value={form.allergies}
                onChange={(e) =>
                  setForm({
                    ...form,
                    allergies: e.target.value
                  })
                }
              />

              <textarea
                rows="4"
                placeholder="Medical History"
                value={form.medical_history}
                onChange={(e) =>
                  setForm({
                    ...form,
                    medical_history: e.target.value
                  })
                }
              />

              <div className="profile-modal-footer">

                <button
                  className="cancel-btn"
                  onClick={() =>
                    setShowEdit(false)
                  }
                >
                  Cancel
                </button>

                <button
                  className="save-btn"
                  onClick={updateProfile}
                >
                  Save Changes
                </button>

              </div>

            </div>

          </div>

        )
      }


    </div>

  );
}

export default Profile;