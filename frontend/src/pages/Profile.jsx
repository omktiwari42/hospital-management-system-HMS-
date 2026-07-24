import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ProfileSkeleton from "../components/ProfileSkeleton";
import { FaEdit, FaTimes } from "react-icons/fa";
import { FaCamera } from "react-icons/fa";
import { hmsToast } from "../utils/hmsToast";
function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [uploading, setUploading] =
    useState(false);
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

      // Update session storage
      sessionStorage.setItem("full_name", form.full_name);

      // Notify Navbar and Sidebar
      window.dispatchEvent(new Event("userUpdated"));

      setShowEdit(false);


      hmsToast.success("Profile updated successfully!", {
        description: "Your profile information has been saved."
      });
    } catch (err) {

      console.log(err);

    }

  }
  async function uploadPhoto(e) {

    try {

      setUploading(true);

      const token =
        localStorage.getItem("token");

      const data = new FormData();

      data.append("image", e.target.files[0]);

      const res = await api.post("/profile/upload-image", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(prev => ({
        ...prev,
        profile_image: res.data.image,
      }));

      sessionStorage.setItem("profile_image", res.data.image);

      window.dispatchEvent(new Event("userUpdated"));
      await getProfile();
      hmsToast.success("Profile photo updated!", {
        description: "Your new profile picture is now visible."
      });

    } catch (err) {

      console.log(err);

    } finally {

      setUploading(false);

    }
  }
  // async function deletePhoto() {
  //   try {
  //     const token = localStorage.getItem("token");

  //     await api.delete("/profile/delete-image", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });

  //     sessionStorage.removeItem("profile_image");

  //     await getProfile();

  //     window.dispatchEvent(new Event("userUpdated"));

  //     hmsToast.success("Profile photo removed!", {
  //       description: "Your profile picture has been deleted.",
  //     });

  //     setTimeout(() => {
  //       window.dispatchEvent(new Event("userUpdated"));
  //     }, 100);

  //   } catch (err) {
  //     console.error(err);

  //     hmsToast.error(
  //       err.response?.data?.message || "Failed to remove profile photo."
  //     );
  //   }
  // }
  async function deletePhoto() {
    try {
      await api.delete("/profile/delete-image");

      setProfile(prev => ({
        ...prev,
        profile_image: null,
      }));

      // Comment these out temporarily
      // sessionStorage.removeItem("profile_image");
      // window.dispatchEvent(new Event("userUpdated"));

      hmsToast.success("Deleted");
    } catch (err) {
      console.log(err);
    }
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="profile-page page">

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
        <div className="profile-avatar-section">

          <div className="profile-avatar">

            {
              profile.profile_image ? (
                <img
                  src={`${import.meta.env.VITE_API_URL.replace("/api", "")}/uploads/${profile.profile_image}`}
                  alt="Profile"
                />
              ) : (
                (profile.full_name || "U")
                  .charAt(0)
                  .toUpperCase()
              )
            }

            <label className="avatar-upload">

              {uploading ? (
                <span className="upload-spinner"></span>
              ) : (
                <FaCamera />
              )}

              <input
                id="profile-photo-input"
                hidden
                type="file"
                accept="image/*"
                onChange={uploadPhoto}
              />

            </label>

          </div>

          <div className="profile-photo-actions">

            <button
              className="change-photo-btn"
              onClick={() =>
                document.getElementById("profile-photo-input").click()
              }
              disabled={uploading}
            >
              📷 Change Photo
            </button>

            <button
              className="delete-photo-btn"
              onClick={deletePhoto}
              disabled={uploading}
            >
              🗑️ Remove Photo
            </button>

          </div>

        </div>

        <div className="profile-details">

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
              <label>Email</label>
              <p>{profile.email || "Not Added"}</p>
            </div>

            <div className="profile-item">
              <label>Gender</label>
              <p>{profile.gender || "Not Added"}</p>
            </div>

            <div className="profile-item">
              <label>Date of Birth</label>
              <p>
                {profile.dob
                  ? new Date(profile.dob).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                  : "Not Added"}
              </p>
            </div>

            <div className="profile-item">
              <label>Blood Group</label>
              <p>{profile.blood_group || "Not Added"}</p>
            </div>

            <div className="profile-item">
              <label>Emergency Contact</label>
              <p>{profile.emergency_contact || "Not Added"}</p>
            </div>

            <div className="profile-item">
              <label>Role</label>
              <p>{profile.role}</p>
            </div>

            <div className="profile-item">
              <label>Account Status</label>
              <p className="status-active">Active</p>
            </div>

          </div>

          <div className="profile-section">

            <h3>🩺 Allergies</h3>

            <div className="profile-box">
              {profile.allergies || "No allergies recorded."}
            </div>

          </div>

          <div className="profile-section">

            <h3>📋 Medical History</h3>

            <div className="profile-box">
              {profile.medical_history || "No medical history available."}
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