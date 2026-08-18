import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ProfileSkeleton from "../components/ProfileSkeleton";
import { FaEdit, FaTimes, FaCamera } from "react-icons/fa";
import { hmsToast } from "../utils/hmsToast";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [uploading, setUploading] = useState(false);

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

      if (!token) {
        navigate("/login");
        return;
      }

      const response = await api.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const user = response.data;

      setProfile(user);

      setForm({
        full_name: user.full_name || "",
        email: user.email || "",
        gender: user.gender || "",
        dob: user.dob || "",
        emergency_contact: user.emergency_contact || "",
        blood_group: user.blood_group || "",
        allergies: user.allergies || "",
        medical_history: user.medical_history || "",
      });

      /*
       * IMPORTANT:
       * Always synchronize profile_image with the
       * authenticated user's database record.
       */
      if (user.profile_image) {
        sessionStorage.setItem(
          "profile_image",
          user.profile_image
        );
      } else {
        sessionStorage.removeItem(
          "profile_image"
        );
      }

      sessionStorage.setItem(
        "full_name",
        user.full_name || "User"
      );

      sessionStorage.setItem(
        "role",
        user.role || ""
      );

      window.dispatchEvent(
        new Event("userUpdated")
      );

    } catch (error) {
      console.error(
        "Profile loading error:",
        error
      );

      if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        sessionStorage.clear();
        localStorage.removeItem("token");
        navigate("/login");
      }

    } finally {
      setLoading(false);
    }
  }

  async function updateProfile() {
    try {
      const token =
        localStorage.getItem("token");

      await api.put(
        "/profile",
        form,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      sessionStorage.setItem(
        "full_name",
        form.full_name
      );

      setProfile((prev) => ({
        ...prev,
        ...form,
      }));

      window.dispatchEvent(
        new Event("userUpdated")
      );

      setShowEdit(false);

      hmsToast.success(
        "Profile updated successfully!",
        "Your profile information has been saved."
      );

    } catch (err) {
      console.error(
        "Profile update error:",
        err
      );

      hmsToast.error(
        err.response?.data?.message ||
        "Failed to update profile."
      );
    }
  }

  async function uploadPhoto(e) {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      hmsToast.error(
        "Invalid image",
        "Please select JPG, PNG, or WEBP."
      );

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      hmsToast.error(
        "Image too large",
        "Profile photo must be smaller than 5 MB."
      );

      e.target.value = "";
      return;
    }

    try {
      setUploading(true);

      const token =
        localStorage.getItem("token");

      const data = new FormData();

      data.append(
        "image",
        file
      );

      const res = await api.post(
        "/profile/upload-image",
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const imageName =
        res.data.image;

      setProfile((prev) => ({
        ...prev,
        profile_image: imageName,
      }));

      sessionStorage.setItem(
        "profile_image",
        imageName
      );

      window.dispatchEvent(
        new Event("userUpdated")
      );

      hmsToast.success(
        "✅ Profile photo updated successfully!",
        "Your new profile picture is now visible."
      );

    } catch (err) {
      console.error(
        "Profile photo upload error:",
        err
      );

      hmsToast.error(
        err.response?.data?.message ||
        "Unable to update your profile photo."
      );

    } finally {
      setUploading(false);

      e.target.value = "";
    }
  }

  async function deletePhoto() {
    if (!profile.profile_image) {
      return;
    }

    try {
      setUploading(true);

      const token =
        localStorage.getItem("token");

      await api.delete(
        "/profile/delete-image",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      /*
       * Immediately remove photo from React state.
       */
      setProfile((prev) => ({
        ...prev,
        profile_image: null,
      }));

      /*
       * Remove cached photo.
       */
      sessionStorage.removeItem(
        "profile_image"
      );

      /*
       * Tell Navbar to update immediately.
       */
      window.dispatchEvent(
        new Event("userUpdated")
      );

      hmsToast.success(
        "🗑️ Profile photo removed successfully!",
        "Your default profile icon is now visible."
      );

    } catch (err) {
      console.error(
        "Profile photo delete error:",
        err
      );

      hmsToast.error(
        err.response?.data?.message ||
        "Failed to remove profile photo."
      );

    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <ProfileSkeleton />;
  }

  const profileImageUrl =
    profile.profile_image
      ? `${import.meta.env.VITE_API_URL.replace(
        /\/api\/?$/,
        ""
      )}/uploads/${profile.profile_image}`
      : null;

  return (
    <div className="profile-page page">

      <div className="page-header">

        <button
          className="back-btn"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Back
        </button>

        <h1>My Profile</h1>

        <div className="profile-actions">

          <button
            className="edit-profile-btn"
            onClick={() =>
              setShowEdit(true)
            }
          >
            <FaEdit />
            Edit Profile
          </button>

        </div>

      </div>

      <div className="profile-card">

        <div className="profile-avatar-section">

          <div
            className={`profile-avatar ${uploading
                ? "profile-avatar-uploading"
                : ""
              }`}
          >

            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt="Profile"
                className="profile-avatar-image"
              />
            ) : (
              <span className="profile-avatar-initial">
                {(profile.full_name ||
                  "U")
                  .charAt(0)
                  .toUpperCase()}
              </span>
            )}

            {uploading && (
              <div className="profile-avatar-overlay">
                <span className="upload-spinner"></span>
              </div>
            )}

          </div>

          <input
            id="profile-photo-input"
            hidden
            type="file"
            accept="image/jpeg,image/png,image/jpg,image/webp"
            onChange={uploadPhoto}
            disabled={uploading}
          />

          <div className="profile-photo-actions">

            <button
              type="button"
              className="change-photo-btn"
              onClick={() =>
                document
                  .getElementById(
                    "profile-photo-input"
                  )
                  ?.click()
              }
              disabled={uploading}
            >
              <FaCamera />

              {uploading
                ? "Updating..."
                : "Change Photo"}
            </button>

            {profile.profile_image && (
              <button
                type="button"
                className="delete-photo-btn"
                onClick={deletePhoto}
                disabled={uploading}
              >
                🗑️ Remove Photo
              </button>
            )}

          </div>

          {uploading && (
            <div className="profile-photo-status">
              <span className="status-spinner"></span>
              Updating profile photo...
            </div>
          )}

        </div>

        <div className="profile-details">

          <span className="role-badge">
            {profile.role || "User"}
          </span>

          <div className="profile-grid">

            <div className="profile-item">
              <label>Full Name</label>
              <p>
                {profile.full_name || "-"}
              </p>
            </div>

            <div className="profile-item">
              <label>Phone Number</label>
              <p>
                {profile.phone || "-"}
              </p>
            </div>

            <div className="profile-item">
              <label>Email</label>
              <p>
                {profile.email ||
                  "Not Added"}
              </p>
            </div>

            <div className="profile-item">
              <label>Gender</label>
              <p>
                {profile.gender ||
                  "Not Added"}
              </p>
            </div>

            <div className="profile-item">
              <label>Date of Birth</label>

              <p>
                {profile.dob
                  ? new Date(
                    profile.dob
                  ).toLocaleDateString(
                    "en-IN",
                    {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    }
                  )
                  : "Not Added"}
              </p>

            </div>

            <div className="profile-item">
              <label>Blood Group</label>

              <p>
                {profile.blood_group ||
                  "Not Added"}
              </p>

            </div>

            <div className="profile-item">
              <label>Emergency Contact</label>

              <p>
                {profile.emergency_contact ||
                  "Not Added"}
              </p>

            </div>

            <div className="profile-item">
              <label>Role</label>

              <p>
                {profile.role ||
                  "Not Added"}
              </p>

            </div>

            <div className="profile-item">
              <label>Account Status</label>

              <p className="status-active">
                Active
              </p>

            </div>

          </div>

          <div className="profile-section">

            <h3>🩺 Allergies</h3>

            <div className="profile-box">
              {profile.allergies ||
                "No allergies recorded."}
            </div>

          </div>

          <div className="profile-section">

            <h3>📋 Medical History</h3>

            <div className="profile-box">
              {profile.medical_history ||
                "No medical history available."}
            </div>

          </div>

        </div>

      </div>

      {showEdit && (

        <div className="profile-modal">

          <div className="profile-modal-content">

            <div className="profile-modal-header">

              <h2>
                Edit Profile
              </h2>

              <button
                onClick={() =>
                  setShowEdit(false)
                }
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
                  full_name:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Gender"
              value={form.gender}
              onChange={(e) =>
                setForm({
                  ...form,
                  gender:
                    e.target.value,
                })
              }
            />

            <input
              type="date"
              value={form.dob}
              onChange={(e) =>
                setForm({
                  ...form,
                  dob:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Emergency Contact"
              value={
                form.emergency_contact
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  emergency_contact:
                    e.target.value,
                })
              }
            />

            <input
              placeholder="Blood Group"
              value={
                form.blood_group
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  blood_group:
                    e.target.value,
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
                  allergies:
                    e.target.value,
                })
              }
            />

            <textarea
              rows="4"
              placeholder="Medical History"
              value={
                form.medical_history
              }
              onChange={(e) =>
                setForm({
                  ...form,
                  medical_history:
                    e.target.value,
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

      )}

    </div>
  );
}

export default Profile;