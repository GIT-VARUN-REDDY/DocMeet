import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const SPECIALIZATIONS = [
  "General Physician","Cardiologist","Dermatologist","Neurologist",
  "Orthopedic","Pediatrician","Gynecologist","Psychiatrist","ENT Specialist","Ophthalmologist",
];

function RegisterDoctor() {
  const [form, setForm] = useState({ name:"", email:"", password:"", specialization:"", experience:"", fees:"" });
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
    const { name, email, password, specialization, experience, fees } = form;
    if (!name || !email || !password || !specialization || !experience || !fees)
      return setError("All fields are required");
    if (!pwChecks.length || !pwChecks.upper || !pwChecks.number)
      return setError("Password doesn't meet requirements");

    setLoading(true);
    try {
      await API.post("/auth/register", { name, email, password, role: "doctor", specialization, experience: Number(experience), fees: Number(fees) });
      navigate("/verify-otp", { state: { email } });
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
    <div className="flex min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
      <div className="hidden md:flex w-1/2 bg-teal-600 text-white flex-col justify-center items-center p-12">
        <p className="text-7xl mb-6">👨‍⚕️</p>
        <h2 className="text-3xl font-bold mb-3">Join as a Doctor</h2>
        <p className="text-teal-100 text-center text-sm leading-relaxed max-w-xs">
          Connect with patients, manage your schedule, and grow your practice.
        </p>
        <div className="mt-10 space-y-3 text-sm text-teal-100">
          <p>✅ Verified email required</p>
          <p>✅ Set your availability & slots</p>
          <p>✅ Receive patient bookings</p>
          <p>✅ Full appointment dashboard</p>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-sm">
          <div className="flex rounded-xl overflow-hidden border border-teal-200 mb-8">
            <Link to="/register" className="w-1/2 py-2.5 text-sm font-semibold text-teal-500 bg-white hover:bg-teal-50 transition text-center">Patient</Link>
            <button className="w-1/2 py-2.5 text-sm font-semibold bg-teal-600 text-white">Doctor</button>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Doctor Account</h2>
          <p className="text-gray-400 text-sm mb-6">You'll receive an OTP to verify your email</p>

          {error && (
            <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">{error}</div>
          )}

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Basic Info</p>
          <input name="name" className="border border-gray-200 p-3 mb-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm" placeholder="Full name" value={form.name} onChange={handleChange} />
          <input name="email" type="email" className="border border-gray-200 p-3 mb-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm" placeholder="Professional email" value={form.email} onChange={handleChange} />
          <input name="password" type="password" className="border border-gray-200 p-3 mb-2 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm" placeholder="Password" value={form.password} onChange={handleChange} />

          {form.password && (
            <div className="mb-4 space-y-1 px-1">
              <Check ok={pwChecks.length} label="At least 6 characters" />
              <Check ok={pwChecks.upper}  label="One uppercase letter" />
              <Check ok={pwChecks.number} label="One number" />
            </div>
          )}

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Professional Info</p>
          <select name="specialization" className="border border-gray-200 p-3 mb-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm text-gray-700 bg-white" value={form.specialization} onChange={handleChange}>
            <option value="">Select specialization</option>
            {SPECIALIZATIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>

          <div className="flex gap-3 mb-6">
            <input name="experience" type="number" min="0" className="border border-gray-200 p-3 w-1/2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm" placeholder="Experience (yrs)" value={form.experience} onChange={handleChange} />
            <input name="fees" type="number" min="0" className="border border-gray-200 p-3 w-1/2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm" placeholder="Fees (₹)" value={form.fees} onChange={handleChange} />
          </div>

          <button onClick={register} disabled={loading} className="bg-teal-600 text-white py-3 w-full rounded-xl font-semibold hover:bg-teal-700 transition disabled:opacity-60">
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