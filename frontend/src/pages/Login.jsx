
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { hmsToast, TOAST_IDS } from "../utils/hmsToast";

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
  const [turnstileToken, setTurnstileToken] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);


  useEffect(() => {
    if (!showOTP && window.turnstile) {
      setTimeout(() => {
        try {
          window.turnstile.remove(".cf-turnstile");
        } catch { }

        window.turnstile.render(".cf-turnstile", {
          sitekey: import.meta.env.VITE_TURNSTILE_SITE_KEY,
          callback: (token) => {
            setTurnstileToken(token);
            setCaptchaVerified(true);
          },
        });
      }, 100);
    }
  }, [showOTP]);
  const [mergeOTP, setMergeOTP] = useState(false);
  const [timer, setTimer] =
    useState(60);

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

      hmsToast.error(
        "Enter valid 10 digit mobile number"
      );

      return;
    }

    const toastId = hmsToast.loading("Sending OTP...", TOAST_IDS.SEND_OTP);

    try {

      setLoading(true);

      await api.post("/send-otp", {
        phone: "+91" + phone,
        turnstileToken,
      });

      hmsToast.updateSuccess(
        toastId,
        "OTP Sent",
        "Check your mobile for the verification code."
      );

      setShowOTP(true);
      setTimer(60);
      setCanResend(false);

      setTurnstileToken("");
      setCaptchaVerified(false);

      setTimeout(() => {
        window.turnstile?.reset();
      }, 100);

    } catch (err) {

      console.log(err);

      hmsToast.updateError(
        toastId,
        "Failed",
        "Unable to send OTP."
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
    const toastId = hmsToast.loading(
      "Verifying OTP...", TOAST_IDS.VERIFY_OTP
    );

    try {

      setVerifying(true);

      const response = await api.post("/verify-otp", {
        phone: "+91" + phone,
        otp: code,
      });

      sessionStorage.setItem("token", response.data.token);
      sessionStorage.setItem("role", response.data.role);
      sessionStorage.setItem("full_name", response.data.full_name);

      setMergeOTP(true);

      setTimeout(() => {
        setVerified(true);
      }, 1000);

      hmsToast.updateSuccess(
        toastId,
        "Login Successful",
        "Welcome back!"
      );

      setTimeout(() => {
        const role = response.data.role;

        if (role === "admin") {
          navigate("/dashboard");
        } else if (role === "doctor") {
          navigate("/doctor-dashboard");
        } else if (role === "receptionist") {
          navigate("/reception-dashboard");
        } else if (role === "pharmacist") {
          navigate("/pharmacist-dashboard");
        } else if (role === "lab") {
          navigate("/lab-dashboard");
        } else if (role === "patient") {
          navigate("/patient-dashboard");
        } else {
          navigate("/");
        }
      }, 2500);

    } catch (err) {

      setShake(true);

      setTimeout(() => setShake(false), 500);

      hmsToast.updateError(
        toastId,
        "Invalid OTP",
        "Please enter the correct OTP."
      );

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

    const toastId = hmsToast.loading(
      "Resending OTP...", TOAST_IDS.RESEND_OTP
    );

    try {

      await api.post("/send-otp", {
        phone: "+91" + phone,
        turnstileToken,
      });

      hmsToast.updateSuccess(
        toastId,
        "OTP Sent Again",
        "A new OTP has been sent."
      );

      setTimer(60);

      setCanResend(false);

    } catch {

      hmsToast.updateError(
        toastId,
        "Failed",
        "Unable to resend OTP."
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
              <div
                className="cf-turnstile"
                data-sitekey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
                data-callback="onTurnstileSuccess"
                data-theme="light"
              ></div>
            )}
            {!showOTP && (
              <button
                className={`send-otp-btn ${loading ? "loading-btn" : ""
                  }`}
                onClick={sendOTP}
                disabled={loading || !captchaVerified}
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

                      setTurnstileToken("");
                      setCaptchaVerified(false);
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
    </div >
  );
}
export default Login;