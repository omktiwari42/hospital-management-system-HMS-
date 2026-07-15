import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ProfileSkeleton from "../components/skeletons/ProfileSkeleton";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
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

    </div>
  );
}

export default Profile;