import { useEffect, useState } from "react";
import api from "../services/api";
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

export default Patients;
function Profile() {
  const [profile, setProfile] =
    useState({});

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      const token =
        localStorage.getItem(
          "token"
        );

      const response =
        await api.get(
          "/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

      setProfile(
        response.data
      );
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="page">
      <div className="card">
        <h2>
          👤 My Profile
        </h2>

        <p>
          <strong>
            Phone:
          </strong>{" "}
          {profile.phone}
        </p>
      </div>
    </div>
  );
}

export default Profile;