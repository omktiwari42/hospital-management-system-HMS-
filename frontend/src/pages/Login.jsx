import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

function Login() {
  const [phone, setPhone] =
    useState("");

  const [otp, setOtp] =
    useState("");

  const [countryCode, setCountryCode] =
    useState("+91");

  const [loading, setLoading] =
    useState(false);

  const navigate = useNavigate();

  async function sendOTP() {
    try {
      setLoading(true);

      const fullPhone =
        countryCode + phone;

      console.log(
        "Sending OTP to:",
        fullPhone
      );

      const response =
        await api.post(
          "/send-otp",
          {
            phone: fullPhone,
          }
        );

      console.log(
        response.data
      );

      toast.success(
        "OTP Sent Successfully"
      );
    } catch (error) {
      console.log(error);

      toast.error(
        "Failed to Send OTP"
      );
    } finally {
      setLoading(false);
    }
  }

  async function verifyOTP() {
    try {
      setLoading(true);

      const fullPhone =
        countryCode + phone;

      const response =
        await api.post(
          "/verify-otp",
          {
            phone: fullPhone,
            otp,
          }
        );

      sessionStorage.setItem(
        "token",
        response.data.token
      );

      toast.success(
        "Login Successful"
      );

      setTimeout(() => {
        navigate("/dashboard");

      }, 1000);
    } catch (error) {
      console.log(error);

      toast.error(
        "Invalid OTP"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <h1>
          🏥 Hospital Management
          System
        </h1>

        <p className="login-subtitle">
          Secure OTP Login
        </p>

        <label>
          Phone Number
        </label>

        <div className="phone-input-group">
          <select
            value={countryCode}
            onChange={(e) =>
              setCountryCode(
                e.target.value
              )
            }
          >
            <option value="+91">
              🇮🇳 +91
            </option>

            <option value="+1">
              🇺🇸 +1
            </option>

            <option value="+44">
              🇬🇧 +44
            </option>

            <option value="+61">
              🇦🇺 +61
            </option>

            <option value="+971">
              🇦🇪 +971
            </option>
          </select>

          <input
            type="text"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) =>
              setPhone(
                e.target.value
              )
            }
          />
        </div>

        <button
          className="send-otp-btn"
          onClick={sendOTP}
          disabled={loading}
        >
          {loading
            ? "Sending..."
            : "📩 Send OTP"}
        </button>

        <label>
          Enter OTP
        </label>

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) =>
            setOtp(
              e.target.value
            )
          }
        />

        <button
          className="verify-otp-btn"
          onClick={verifyOTP}
          disabled={loading}
        >
          {loading
            ? "Verifying..."
            : "🔓 Verify OTP"}
        </button>
      </div>
    </div>
  );
}

export default Login;