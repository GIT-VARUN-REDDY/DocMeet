import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

function RegisterUser() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pwChecks, setPwChecks] = useState({ length: false, upper: false, number: false });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === "password") {
      setPwChecks({
        length: value.length >= 6,
        upper: /[A-Z]/.test(value),
        number: /[0-9]/.test(value),
      });
    }
  };

  const register = async () => {
    setError("");
    if (!form.name || !form.email || !form.password)
      return setError("All fields are required");
    if (!pwChecks.length || !pwChecks.upper || !pwChecks.number)
      return setError("Password doesn't meet requirements");

    setLoading(true);
    try {
      await API.post("/auth/register", { ...form, role: "user" });
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const Check = ({ ok, label }) => (
    <p className={`text-xs flex items-center gap-1 ${ok ? "text-green-500" : "text-gray-400"}`}>
      {ok ? "✅" : "○"} {label}
    </p>
  );

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Left panel */}
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white flex-col justify-center items-center p-12">
        <p className="text-7xl mb-6">🧑‍⚕️</p>
        <h2 className="text-3xl font-bold mb-3">Join as a Patient</h2>
        <p className="text-blue-100 text-center text-sm leading-relaxed max-w-xs">
          Book appointments with top doctors, track your health visits, and manage your medical life in one place.
        </p>
        <div className="mt-10 space-y-3 text-sm text-blue-100">
          <p>✅ Browse verified doctors</p>
          <p>✅ Book slots instantly</p>
          <p>✅ Get email confirmations</p>
          <p>✅ Cancel anytime</p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-sm">
          {/* Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-blue-200 mb-8">
            <button className="w-1/2 py-2.5 text-sm font-semibold bg-blue-600 text-white">Patient</button>
            <Link to="/register/doctor" className="w-1/2 py-2.5 text-sm font-semibold text-blue-500 bg-white hover:bg-blue-50 transition text-center">
              Doctor
            </Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Patient Account</h2>
          <p className="text-gray-400 text-sm mb-6">You'll receive an OTP to verify your email</p>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">{error}</div>
          )}

          <input
            name="name"
            className="border border-gray-200 p-3 mb-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
          />
          <input
            name="email"
            type="email"
            className="border border-gray-200 p-3 mb-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
          />
          <input
            name="password"
            type="password"
            className="border border-gray-200 p-3 mb-2 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          {/* Password strength checks */}
          {form.password && (
            <div className="mb-4 space-y-1 px-1">
              <Check ok={pwChecks.length} label="At least 6 characters" />
              <Check ok={pwChecks.upper}  label="One uppercase letter" />
              <Check ok={pwChecks.number} label="One number" />
            </div>
          )}

          <button
            onClick={register}
            disabled={loading}
            className="bg-blue-600 text-white py-3 w-full rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Register as Patient"}
          </button>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterUser;