import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

const SPECS = ["General Physician","Cardiologist","Dermatologist","Neurologist","Orthopedic","Pediatrician","Gynecologist","Psychiatrist","ENT Specialist","Ophthalmologist"];
const ic = "border border-gray-200 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm";

export default function RegisterDoctor() {
  const [form, setForm] = useState({ name:"",email:"",password:"",specialization:"",experience:"",fees:"",hospital:"",city:"",phone:"",about:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pw, setPw] = useState({ length:false, upper:false, number:false });
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    if (e.target.name === "password") {
      const v = e.target.value;
      setPw({ length: v.length >= 6, upper: /[A-Z]/.test(v), number: /[0-9]/.test(v) });
    }
  };

  const register = async () => {
    setError("");
    const { name,email,password,specialization,experience,fees,hospital,city,phone } = form;
    if (!name||!email||!password||!specialization||!experience||!fees||!hospital||!city||!phone)
      return setError("All fields except bio are required");
    if (!pw.length||!pw.upper||!pw.number) return setError("Password doesn't meet requirements");
    setLoading(true);
    try {
      const res = await API.post("/auth/register", { ...form, role:"doctor", experience:Number(form.experience), fees:Number(form.fees) });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({ name: res.data.name, email: res.data.email, role: res.data.role }));
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-teal-50 to-teal-100">
      <div className="hidden md:flex w-2/5 bg-teal-600 text-white flex-col justify-center items-center p-12 sticky top-0 h-screen">
        <p className="text-7xl mb-6">👨‍⚕️</p>
        <h2 className="text-3xl font-bold mb-3">Join as a Doctor</h2>
        <div className="mt-6 space-y-3 text-sm text-teal-100">
          <p>✅ Patients find you by hospital & city</p>
          <p>✅ Full appointment dashboard</p>
          <p>✅ Manage your profile & photos</p>
          <p>✅ Set your availability slots</p>
        </div>
      </div>

      <div className="flex flex-col justify-start items-center w-full md:w-3/5 p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="flex rounded-xl overflow-hidden border border-teal-200 mb-8">
            <Link to="/register" className="w-1/2 py-2.5 text-sm font-semibold text-teal-500 bg-white hover:bg-teal-50 text-center">Patient</Link>
            <button className="w-1/2 py-2.5 text-sm font-semibold bg-teal-600 text-white">Doctor</button>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Doctor Account</h2>
          <p className="text-gray-400 text-sm mb-6">Patients will see your full profile</p>

          {error && <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">{error}</div>}

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Account Info</p>
          <input name="name" placeholder="Full name" value={form.name} onChange={onChange} className={`${ic} mb-3`} />
          <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} className={`${ic} mb-3`} />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange} className={`${ic} mb-2`} />
          {form.password && (
            <div className="mb-4 space-y-1 px-1">
              {[["length","At least 6 characters"],["upper","One uppercase letter"],["number","One number"]].map(([k,l]) => (
                <p key={k} className={`text-xs flex gap-1 ${pw[k]?"text-green-500":"text-gray-400"}`}>{pw[k]?"✅":"○"} {l}</p>
              ))}
            </div>
          )}

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">Professional Info</p>
          <select name="specialization" value={form.specialization} onChange={onChange} className={`${ic} mb-3 bg-white text-gray-700`}>
            <option value="">Select specialization</option>
            {SPECS.map((s) => <option key={s}>{s}</option>)}
          </select>
          <div className="flex gap-3 mb-3">
            <input name="experience" type="number" min="0" placeholder="Experience (yrs)" value={form.experience} onChange={onChange} className="border border-gray-200 p-3 w-1/2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm" />
            <input name="fees" type="number" min="0" placeholder="Fees (₹)" value={form.fees} onChange={onChange} className="border border-gray-200 p-3 w-1/2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm" />
          </div>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">Contact & Location</p>
          <input name="hospital" placeholder="Hospital / Clinic name" value={form.hospital} onChange={onChange} className={`${ic} mb-3`} />
          <div className="flex gap-3 mb-3">
            <input name="city" placeholder="City" value={form.city} onChange={onChange} className="border border-gray-200 p-3 w-1/2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm" />
            <input name="phone" type="tel" placeholder="Phone number" value={form.phone} onChange={onChange} className="border border-gray-200 p-3 w-1/2 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm" />
          </div>

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 mt-2">About (optional)</p>
          <textarea name="about" placeholder="Brief bio..." value={form.about} onChange={onChange} rows={3} className={`${ic} resize-none mb-6`} />

          <button onClick={register} disabled={loading}
            className="bg-teal-600 text-white py-3 w-full rounded-xl font-semibold hover:bg-teal-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span> Registering...</> : "Register as Doctor"}
          </button>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account? <Link to="/login" className="text-teal-600 font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}