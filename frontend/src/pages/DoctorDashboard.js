import React, { useEffect, useState } from "react";
import API from "../services/api";

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get("/appointment/doctor-bookings")
      .then((res) => setAppointments(res.data))
      .catch(() => alert("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === "All" ? appointments : appointments.filter((a) => a.status === filter);
  const confirmed = appointments.filter((a) => a.status === "Confirmed").length;
  const totalEarned = appointments.filter((a) => a.paid).reduce((sum, a) => sum + (a.amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-teal-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-teal-700">👨‍⚕️ Dr. {user.name}'s Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">All patient bookings</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-teal-600">{appointments.length}</p>
            <p className="text-gray-400 text-sm mt-1">Total Bookings</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-green-600">{confirmed}</p>
            <p className="text-gray-400 text-sm mt-1">Confirmed</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-blue-600">{appointments.filter((a) => a.paid).length}</p>
            <p className="text-gray-400 text-sm mt-1">Paid</p>
          </div>
          <div className="bg-white rounded-2xl shadow p-5 text-center">
            <p className="text-3xl font-bold text-purple-600">₹{totalEarned}</p>
            <p className="text-gray-400 text-sm mt-1">Total Earned</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {["All", "Confirmed"].map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                filter === f ? "bg-teal-600 text-white shadow" : "bg-white text-teal-600 border border-teal-200 hover:bg-teal-50"
              }`}>
              {f}
            </button>
          ))}
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-teal-500"></div>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center text-gray-400 mt-16">
            <p className="text-5xl mb-4">📭</p>
            <p className="text-lg font-semibold">No bookings yet</p>
            <p className="text-sm">Patients will appear here once they book with you</p>
          </div>
        )}

        <div className="space-y-4">
          {filtered.map((a) => (
            <div key={a._id} className="bg-white rounded-2xl shadow-md p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center text-xl font-bold text-teal-600 shrink-0">
                  {a.user?.name?.charAt(0).toUpperCase() || "P"}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{a.user?.name || "Unknown Patient"}</p>
                  <p className="text-teal-500 text-xs mb-1">📧 {a.user?.email}</p>
                  <p className="text-gray-500 text-sm">📅 {a.date} &nbsp; 🕐 {a.time}</p>
                  {a.symptoms && (
                    <p className="text-gray-400 text-xs mt-1 bg-gray-50 px-3 py-1.5 rounded-lg inline-block">
                      📝 {a.symptoms}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                  ✅ Confirmed
                </span>
                {a.paid ? (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-blue-100 text-blue-700">
                    💳 Paid ₹{a.amount}
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-500">
                    Free
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}