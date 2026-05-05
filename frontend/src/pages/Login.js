import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const login = async () => {
    setError("");
    if (!email || !password) return setError("Please fill in all fields");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify({ name: res.data.name, email: res.data.email, role: res.data.role }));
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-blue-100 to-blue-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm">
        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🩺</p>
          <h2 className="text-2xl font-bold text-gray-800">Welcome Back</h2>
          <p className="text-gray-400 text-sm mt-1">Login as patient or doctor</p>
        </div>

        {error && <div className="bg-red-50 text-red-500 text-sm px-4 py-2 rounded-lg mb-4 border border-red-200">{error}</div>}

        <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()}
          className="border border-gray-200 p-3 mb-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && login()}
          className="border border-gray-200 p-3 mb-5 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />

        <button onClick={login} disabled={loading}
          className="bg-blue-600 text-white py-3 w-full rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <><span className="animate-spin rounded-full h-4 w-4 border-t-2 border-white"></span> Logging in...</> : "Login"}
        </button>

        <div className="border-t border-gray-100 mt-6 pt-5 space-y-2 text-center text-sm text-gray-400">
          <p>New patient? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link></p>
          <p>Are you a doctor? <Link to="/register/doctor" className="text-teal-600 font-semibold hover:underline">Doctor registration</Link></p>
        </div>
      </div>
    </div>
  );
}