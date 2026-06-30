import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

function Login() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");

  const [otp, setOtp] = useState([
    "", "", "", "", "", ""
  ]);

  const [showOTP, setShowOTP] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [verifying, setVerifying] =
    useState(false);

  const [verified, setVerified] =
    useState(false);

  const [mergeOTP, setMergeOTP] = useState(false);
  const [timer, setTimer] =
    useState(30);

  const [canResend, setCanResend] =
    useState(false);

  const inputRefs = useRef([]);
  const [shake, setShake] =
    useState(false);

  // ---------------------------
  // Only allow Indian 10 digits
  // ---------------------------

  function handlePhone(e) {

    const value =
      e.target.value.replace(/\D/g, "");

    if (/^\d*$/.test(value) && value.length <= 10) {
      setPhone(value);
    }
  }

  // ---------------------------
  // OTP BOX CHANGE
  // ---------------------------

  function handleOTP(value, index) {

    if (!/^\d?$/.test(value))
      return;

    const newOTP = [...otp];

    newOTP[index] = value;

    setOtp(newOTP);

    if (
      value &&
      index < 5
    ) {
      inputRefs.current[index + 1].focus();
    }
  }

  // ---------------------------
  // BACKSPACE
  // ---------------------------

  function handleKeyDown(e, index) {

    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1].focus();
    }
  }

  // ---------------------------
  // PASTE OTP
  // ---------------------------

  function handlePaste(e) {

    const pasted =
      e.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(0, 6);

    if (pasted.length === 6) {

      const arr =
        pasted.split("");

      setOtp(arr);

      arr.forEach((v, i) => {
        if (inputRefs.current[i]) {
          inputRefs.current[i].value = v;
        }
      });

      inputRefs.current[5].focus();
    }

    e.preventDefault();
  }

  // ---------------------------
  // SEND OTP
  // ---------------------------

  async function sendOTP() {

    if (phone.length !== 10) {

      toast.error(
        "Enter valid 10 digit mobile number"
      );

      return;
    }

    try {

      setLoading(true);

      await api.post(
        "/send-otp",
        {
          phone: "+91" + phone,
        }
      );

      toast.success(
        "OTP Sent Successfully"
      );

      setShowOTP(true);
      setTimer(30);
      setCanResend(false);

    } catch (err) {

      console.log(err);

      toast.error(
        "Failed to Send OTP"
      );

    } finally {

      setLoading(false);

    }
  }

  // ---------------------------
  // VERIFY OTP
  // ---------------------------

  async function verifyOTP(code = otp.join("")) {

    if (code.length !== 6) {

      return;
    }

    try {

      setVerifying(true);

      const response = await api.post("/verify-otp", {
        phone: "+91" + phone,
        otp: code,
      });

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("role", response.data.role);

      setMergeOTP(true);

      setTimeout(() => {
        setVerified(true);
      }, 1000);

      toast.success("Login Successful");

      setTimeout(() => {
        navigate("/dashboard");
      }, 2500);

    } catch (err) {

      setShake(true);

      setTimeout(() => setShake(false), 500);

      toast.error("Invalid OTP");

    } finally {

      setVerifying(false);

    }
  }
  useEffect(() => {

    if (!showOTP || canResend) return;

    if (timer === 0) {

      setCanResend(true);
      return;

    }

    const interval = setInterval(() => {

      setTimer((prev) => prev - 1);

    }, 1000);


    return () => clearInterval(interval);

  }, [timer, showOTP, canResend]);

  async function resendOTP() {

    try {

      await api.post(
        "/send-otp",
        {
          phone: "+91" + phone,
        }
      );

      toast.success(
        "OTP Sent Again"
      );

      setTimer(60);

      setCanResend(false);

    } catch {

      toast.error(
        "Failed to resend OTP"
      );

    }

  }
  return (
    <div className="login-page">

      <div className="background-animation">

        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>

      </div>
      <div className="login-card">

        <div className="login-logo">
          <div className="logo-circle">
            🏥
          </div>

          <h1>Hospital Management System</h1>

          <p className="login-subtitle">
            Secure OTP Login
          </p>
        </div>



        {!verified ? (
          <>
            <div className="floating-input">

              <label>Mobile Number</label>

              <div className="phone-input-group">
                <span className="country-code">
                  🇮🇳 +91
                </span>

                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="tel"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      sendOTP();
                    }
                  }}
                  placeholder="Enter 10 digit mobile number"
                  value={phone}
                  onChange={handlePhone}
                  maxLength={10}
                  disabled={showOTP || loading}
                />
              </div>
            </div>


            {!showOTP && (
              <button
                className={`send-otp-btn ${loading ? "loading-btn" : ""
                  }`}
                onClick={sendOTP}
                disabled={loading}
              >
                {loading
                  ? "Sending OTP..."
                  : "Send OTP"}
              </button>
            )}

            {showOTP && (
              <>

                <label className="otp-title">
                  Enter 6 Digit OTP
                </label>

                <div
                  className={`otp-container ${mergeOTP ? "merge" : ""} ${shake ? "shake" : ""
                    }`}
                  onPaste={handlePaste}
                >

                  {otp.map((digit, index) => (

                    <input
                      onKeyDown={(e) => {
                        handleKeyDown(e, index);

                        if (e.key === "Enter") {
                          verifyOTP();
                        }
                      }}

                      style={{
                        animation:
                          digit
                            ? "pop .25s"
                            : ""
                      }}
                      key={index}
                      ref={(el) =>
                        (inputRefs.current[index] = el)
                      }
                      className={`otp-input ${verified ? "verified" : ""}`}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete={
                        index === 0
                          ? "one-time-code"
                          : "off"
                      }
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const value = e.target.value;

                        handleOTP(value, index);

                        const newOtp = [...otp];
                        newOtp[index] = value;

                        if (newOtp.every(digit => digit !== "") && !verifying) {
                          verifyOTP(newOtp.join(""));
                        }
                      }}
                    />

                  ))}

                </div>


                <div className="otp-timer">
                  {!canResend ? (
                    <p>
                      Resend OTP in <b>{timer}s</b>
                    </p>
                  ) : (
                    <button
                      className="resend-btn"
                      onClick={resendOTP}
                    >
                      Resend OTP
                    </button>
                  )}

                  <button
                    className="change-number-btn"
                    onClick={() => {
                      setShowOTP(false);
                      setOtp(["", "", "", "", "", ""]);
                      setPhone("");
                      setTimer(60);
                      setCanResend(false);
                    }}
                  >
                    Change Number
                  </button>
                </div>

              </>
            )}

          </>

        ) : (

          <div className="success-box fade-success">

            <div className="success-circle">

              ✓

            </div>

            <h2>
              OTP Verified
            </h2>

            <p>
              OTP Verified Successfully
            </p>

            <h4 className="logging-text">
              Logging you in...
            </h4>

            <div className="success-loader"></div>

          </div>

        )}

      </div>
    </div>
  );
}
export default Login;