import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

function VerifyOtp() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const inputs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  // Redirect if no email passed
  useEffect(() => {
    if (!email) navigate("/register");
  }, [email, navigate]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return; // only digits
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (paste.length === 6) {
      setOtp(paste.split(""));
      inputs.current[5]?.focus();
    }
  };

  const verify = async () => {
    const otpStr = otp.join("");
    if (otpStr.length < 6) return setError("Please enter the complete 6-digit OTP");
    setError("");
    setLoading(true);
    try {
      const res = await API.post("/auth/verify-otp", { email, otp: otpStr });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({
        name: res.data.name,
        email: res.data.email,
        role: res.data.role,
      }));
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed");
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResending(true);
    setError("");
    try {
      await API.post("/auth/resend-otp", { email });
      setCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      inputs.current[0]?.focus();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
        <p className="text-5xl mb-3">📧</p>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">Check your email</h2>
        <p className="text-gray-400 text-sm mb-1">We sent a 6-digit OTP to</p>
        <p className="text-blue-600 font-semibold text-sm mb-6">{email}</p>

        {error && (
          <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">
            {error}
          </div>
        )}

        {/* OTP Input Boxes */}
        <div className="flex justify-center gap-2 mb-6" onPaste={handlePaste}>
          {otp.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => (inputs.current[idx] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              className="w-11 h-12 text-center text-xl font-bold border-2 rounded-xl focus:outline-none focus:border-blue-500 transition"
              style={{ borderColor: digit ? "#2563eb" : "#e5e7eb" }}
            />
          ))}
        </div>

        <button
          onClick={verify}
          disabled={loading || otp.join("").length < 6}
          className="bg-blue-600 text-white py-3 w-full rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 mb-4"
        >
          {loading ? "Verifying..." : "Verify Email"}
        </button>

        {/* Resend */}
        <p className="text-sm text-gray-400">
          Didn't receive it?{" "}
          {countdown > 0 ? (
            <span className="text-gray-400">Resend in {countdown}s</span>
          ) : (
            <button
              onClick={resendOtp}
              disabled={resending}
              className="text-blue-600 font-semibold hover:underline disabled:opacity-60"
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          )}
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;