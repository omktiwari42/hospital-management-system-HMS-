import { useEffect, useState } from "react";
import api from "../services/api";

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