import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
 
const SPECIALIZATIONS = [
  "General Physician", "Cardiologist", "Dermatologist", "Neurologist",
  "Orthopedic", "Pediatrician", "Gynecologist", "Psychiatrist",
  "ENT Specialist", "Ophthalmologist",
];
 
// ✅ Defined OUTSIDE component so it never gets recreated on re-render
const inputClass = "border border-gray-200 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm";
 
function RegisterDoctor() {
  const [form, setForm] = useState({
    name: "", email: "", password: "",
    specialization: "", experience: "", fees: "",
    hospital: "", city: "", phone: "", about: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pwChecks, setPwChecks] = useState({ length: false, upper: false, number: false });
  const navigate = useNavigate();
 
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
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

  const { name, email, password, specialization, experience, fees, hospital, city, phone } = form;

  if (!name || !email || !password || !specialization || !experience || !fees || !hospital || !city || !phone)
    return setError("All fields except bio are required");

  if (!pwChecks.length || !pwChecks.upper || !pwChecks.number)
    return setError("Password doesn't meet requirements");

  setLoading(true);

  try {
    await API.post("/auth/register", {
      ...form,
      role: "doctor",
      experience: Number(experience),
      fees: Number(fees),
    });

    navigate("/verify-otp", { state: { email } });

  } catch (err) {
    console.log("Doctor register error:", err);

    setError(
      err.response?.data?.message ||
      "Server not responding. Please try again."
    );
  } finally {
    setLoading(false);
  }
};
 
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
 
      {/* Left panel */}
      <div className="hidden md:flex w-2/5 bg-teal-600 text-white flex-col justify-center items-center p-12 sticky top-0 h-screen">
        <p className="text-7xl mb-6">👨‍⚕️</p>
        <h2 className="text-3xl font-bold mb-3">Join as a Doctor</h2>
        <p className="text-teal-100 text-center text-sm leading-relaxed max-w-xs mb-8">
          Build your profile, set your availability, and start receiving patient bookings today.
        </p>
        <div className="space-y-3 text-sm text-teal-100">
          <p>✅ Verified email required</p>
          <p>✅ Patients find you by hospital & city</p>
          <p>✅ Full appointment dashboard</p>
          <p>✅ Email alerts for new bookings</p>
        </div>
      </div>
 
      {/* Right form */}
      <div className="flex flex-col justify-start items-center w-full md:w-3/5 p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
 
          {/* Toggle */}
          <div className="flex rounded-xl overflow-hidden border border-teal-200 mb-8">
            <Link to="/register" className="w-1/2 py-2.5 text-sm font-semibold text-teal-500 bg-white hover:bg-teal-50 transition text-center">
              Patient
            </Link>
            <button className="w-1/2 py-2.5 text-sm font-semibold bg-teal-600 text-white">
              Doctor
            </button>
          </div>
 
          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Doctor Account</h2>
          <p className="text-gray-400 text-sm mb-6">Fill in your details — patients will see this on your profile</p>
 
          {error && (
            <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">
              {error}
            </div>
          )}
 
          {/* ── ACCOUNT INFO ── */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Account Info</p>
 
          <input
            name="name"
            placeholder="Full name (e.g. Arjun Mehta)"
            value={form.name}
            onChange={handleChange}
            className={`${inputClass} mb-3`}
          />
          <input
            name="email"
            type="email"
            placeholder="Professional email"
            value={form.email}
            onChange={handleChange}
            className={`${inputClass} mb-3`}
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className={`${inputClass} mb-2`}
          />
 
          {/* Password checks */}
          {form.password && (
            <div className="mb-4 space-y-1 px-1">
              <p className={`text-xs flex items-center gap-1 ${pwChecks.length ? "text-green-500" : "text-gray-400"}`}>
                {pwChecks.length ? "✅" : "○"} At least 6 characters
              </p>
              <p className={`text-xs flex items-center gap-1 ${pwChecks.upper ? "text-green-500" : "text-gray-400"}`}>
                {pwChecks.upper ? "✅" : "○"} One uppercase letter
              </p>
              <p className={`text-xs flex items-center gap-1 ${pwChecks.number ? "text-green-500" : "text-gray-400"}`}>
                {pwChecks.number ? "✅" : "○"} One number
              </p>
            </div>
          )}
 
          {/* ── PROFESSIONAL INFO ── */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">Professional Info</p>
 
          <select
            name="specialization"
            value={form.specialization}
            onChange={handleChange}
            className={`${inputClass} mb-3 bg-white text-gray-700`}
          >
            <option value="">Select specialization</option>
            {SPECIALIZATIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
 
          <div className="flex gap-3 mb-3">
            <input
              name="experience"
              type="number"
              min="0"
              placeholder="Experience (years)"
              value={form.experience}
              onChange={handleChange}
              className="border border-gray-200 p-3 w-1/2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
            <input
              name="fees"
              type="number"
              min="0"
              placeholder="Consultation fee (₹)"
              value={form.fees}
              onChange={handleChange}
              className="border border-gray-200 p-3 w-1/2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
          </div>
 
          {/* ── CONTACT & LOCATION ── */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">Contact & Location</p>
 
          <input
            name="hospital"
            placeholder="Hospital / Clinic name (e.g. Apollo Hospital)"
            value={form.hospital}
            onChange={handleChange}
            className={`${inputClass} mb-3`}
          />
 
          <div className="flex gap-3 mb-3">
            <input
              name="city"
              placeholder="City (e.g. Hyderabad)"
              value={form.city}
              onChange={handleChange}
              className="border border-gray-200 p-3 w-1/2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
            <input
              name="phone"
              type="tel"
              placeholder="Contact number"
              value={form.phone}
              onChange={handleChange}
              className="border border-gray-200 p-3 w-1/2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm"
            />
          </div>
 
          {/* ── BIO ── */}
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">About You (optional)</p>
 
          <textarea
            name="about"
            placeholder="Brief bio — specialties, achievements, approach to care..."
            value={form.about}
            onChange={handleChange}
            rows={3}
            className={`${inputClass} resize-none mb-6`}
          />
 
          <button
            onClick={register}
            disabled={loading}
            className="bg-teal-600 text-white py-3 w-full rounded-xl font-semibold hover:bg-teal-700 transition disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "Register as Doctor"}
          </button>
 
          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-600 font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
 
export default RegisterDoctor;