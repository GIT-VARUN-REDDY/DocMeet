import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function RegisterUser() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pw, setPw] = useState({ length: false, upper: false, number: false });
  const navigate = useNavigate();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (e.target.name === "password") {
      const v = e.target.value;
      setPw({ length: v.length >= 6, upper: /[A-Z]/.test(v), number: /[0-9]/.test(v) });
    }
  };

  const register = async () => {
    setError("");
    if (!form.name || !form.email || !form.password) return setError("All fields required");
    if (!pw.length || !pw.upper || !pw.number) return setError("Password doesn't meet requirements");
    setLoading(true);
    try {
      const res = await API.post("/auth/register", { ...form, role: "user" });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({ name: res.data.name, email: res.data.email, role: res.data.role }));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="hidden md:flex w-1/2 bg-blue-600 text-white flex-col justify-center items-center p-12">
        <p className="text-7xl mb-6">🧑‍⚕️</p>
        <h2 className="text-3xl font-bold mb-3">Join as a Patient</h2>
        <div className="mt-6 space-y-3 text-sm text-blue-100">
          <p>✅ Browse verified doctors</p>
          <p>✅ Book slots instantly</p>
          <p>✅ Get email confirmations</p>
          <p>✅ Cancel anytime</p>
        </div>
      </div>

      <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-8">
        <div className="w-full max-w-sm">
          <div className="flex rounded-xl overflow-hidden border border-blue-200 mb-8">
            <button className="w-1/2 py-2.5 text-sm font-semibold bg-blue-600 text-white">Patient</button>
            <Link to="/register/doctor" className="w-1/2 py-2.5 text-sm font-semibold text-blue-500 bg-white hover:bg-blue-50 text-center">Doctor</Link>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-1">Create Patient Account</h2>
          <p className="text-gray-400 text-sm mb-6">Register to book doctor appointments</p>

          {error && <div className="bg-red-50 text-red-500 text-sm px-4 py-3 rounded-lg mb-4 border border-red-200">{error}</div>}

          <input name="name" placeholder="Full name" value={form.name} onChange={onChange}
            className="border border-gray-200 p-3 mb-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
          <input name="email" type="email" placeholder="Email address" value={form.email} onChange={onChange}
            className="border border-gray-200 p-3 mb-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
          <input name="password" type="password" placeholder="Password" value={form.password} onChange={onChange}
            className="border border-gray-200 p-3 mb-2 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />

          {form.password && (
            <div className="mb-4 space-y-1 px-1">
              {[["length","At least 6 characters"],["upper","One uppercase letter"],["number","One number"]].map(([k,l]) => (
                <p key={k} className={`text-xs flex items-center gap-1 ${pw[k] ? "text-green-500" : "text-gray-400"}`}>
                  {pw[k] ? "✅" : "○"} {l}
                </p>
              ))}
            </div>
          )}

          <button onClick={register} disabled={loading}
            className="bg-blue-600 text-white py-3 w-full rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span> Registering...</> : "Register as Patient"}
          </button>

          <p className="text-center text-sm text-gray-400 mt-5">
            Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}