import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [countryCode, setCountryCode] =
  useState("+91");

  const navigate = useNavigate();

  async function sendOTP() {
  try {
    const fullPhone =
      countryCode + phone;

    const response =
      await api.post(
        "/send-otp",
        {
          phone: fullPhone,
        }
      );

    setGeneratedOtp(
      response.data.otp
    );

    alert(
      "OTP Sent Successfully"
    );
  } catch (error) {
    console.log(error);

    alert(
      "Failed to Send OTP"
    );
  }
}

async function verifyOTP() {
  try {
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

    localStorage.setItem(
      "token",
      response.data.token
    );

    alert(
      "Login Successful"
    );

    navigate("/dashboard");
  } catch (error) {
    console.log(error);

    alert("Invalid OTP");
  }
}

 return (
  <div className="login-page">
    <div className="login-card">
      <h1>🏥 Hospital Management System</h1>

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
      setPhone(e.target.value)
    }
  />
</div>

      <button
        className="send-otp-btn"
        onClick={sendOTP}
      >
        📩 Send OTP
      </button>

      {generatedOtp && (
        <div className="otp-box">
          <strong>
            OTP:
          </strong>{" "}
          {generatedOtp}
        </div>
      )}

      <label>
        Enter OTP
      </label>

      <input
        type="text"
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) =>
          setOtp(e.target.value)
        }
      />

      <button
        className="verify-otp-btn"
        onClick={verifyOTP}
      >
        🔓 Verify OTP
      </button>
    </div>
  </div>
);
}

export default Login;