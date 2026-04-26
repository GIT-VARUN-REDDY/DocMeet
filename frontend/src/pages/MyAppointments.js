import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const navigate = useNavigate();

  const fetchAppointments = () => {
    setLoading(true);
    API.get("/appointment/my")
      .then((res) => setAppointments(res.data))
      .catch(() => alert("Failed to load appointments"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchAppointments(); }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this appointment? The slot will become available for others.")) return;
    setCancelling(id);
    try {
      await API.delete(`/appointment/${id}`);
      // ✅ Remove from list immediately without refetch
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed");
    } finally {
      setCancelling(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-blue-700">My Appointments</h2>
            <p className="text-gray-400 text-sm mt-1">Your confirmed bookings</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
          >
            + Book New
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          </div>
        )}

        {/* Empty */}
        {!loading && appointments.length === 0 && (
          <div className="text-center text-gray-400 mt-16">
            <p className="text-5xl mb-4">📅</p>
            <p className="text-lg font-semibold">No appointments yet</p>
            <p className="text-sm mb-6">Book your first appointment with a doctor</p>
            <button
              onClick={() => navigate("/")}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"
            >
              Browse Doctors
            </button>
          </div>
        )}

        {/* Cards */}
        <div className="space-y-4">
          {appointments.map((a) => (
            <div key={a._id} className="bg-white rounded-2xl shadow-md p-5 flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 shrink-0">
                  {a.doctor?.name?.charAt(0).toUpperCase() || "D"}
                </div>
                <div>
                  <p className="font-bold text-gray-800">Dr. {a.doctor?.name || "Unknown"}</p>
                  <p className="text-blue-500 text-xs mb-2">{a.doctor?.specialization}</p>
                  <p className="text-gray-500 text-sm">📅 {a.date} &nbsp; 🕐 {a.time}</p>
                  {a.symptoms && (
                    <p className="text-gray-400 text-xs mt-1">📝 {a.symptoms}</p>
                  )}
                  {a.doctor?.fees && (
                    <p className="text-gray-400 text-xs mt-0.5">💰 ₹{a.doctor.fees}</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-end gap-2 shrink-0">
                <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                  ✅ Confirmed
                </span>
                <button
                  onClick={() => cancel(a._id)}
                  disabled={cancelling === a._id}
                  className="text-xs text-red-400 hover:text-red-600 hover:underline transition disabled:opacity-50"
                >
                  {cancelling === a._id ? "Cancelling..." : "Cancel"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MyAppointments;