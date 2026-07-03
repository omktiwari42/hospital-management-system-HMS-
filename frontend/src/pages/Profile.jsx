import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({});

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const token = sessionStorage.getItem("token");

      const response = await api.get("/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setProfile(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <button
          className="back-btn"
          onClick={() => navigate("/dashboard")}
        >
          🏠 Dashboard
        </button>
      </div>

      <div className="card">
        <h2>👤 My Profile</h2>

        <p>
          <strong>Phone:</strong> {profile.phone}
        </p>
      </div>
    </div>
  );
}

export default Profile;