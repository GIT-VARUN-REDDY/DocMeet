import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const SPECIALIZATIONS = ["All", "Cardiologist", "Dermatologist", "Neurologist", "Orthopedic", "Pediatrician", "General Physician"];

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/doctor/all")
      .then((res) => setDoctors(res.data))
      .catch(() => alert("Failed to load doctors. Is the backend running?"))
      .finally(() => setLoading(false));
  }, []);

  const filtered = doctors.filter((doc) => {
    const matchSearch =
      doc.name?.toLowerCase().includes(search.toLowerCase()) ||
      doc.specialization?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "All" || doc.specialization === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-blue-700 mb-2">Find Your Doctor</h2>
        <p className="text-gray-500">Browse trusted medical professionals and book instantly</p>
      </div>

      {/* Search */}
      <div className="max-w-lg mx-auto mb-5">
        <input
          type="text"
          placeholder="🔍 Search by name or specialization..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-blue-200 rounded-full px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {SPECIALIZATIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === s
                ? "bg-blue-600 text-white shadow"
                : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className="text-center text-gray-400 mt-16">
          <p className="text-5xl mb-4">🩺</p>
          <p className="text-lg font-semibold">No doctors found</p>
          <p className="text-sm">Try a different search or filter</p>
        </div>
      )}

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {filtered.map((doc) => (
          <div
            key={doc._id}
            className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-24 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg text-2xl font-bold text-blue-600">
                {doc.name?.charAt(0).toUpperCase() || "D"}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-800">Dr. {doc.name}</h3>
              <span className="inline-block mt-1 mb-3 text-xs font-semibold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                {doc.specialization || "General Physician"}
              </span>

              <div className="text-sm text-gray-500 space-y-1 mb-4">
                {doc.experience !== undefined && (
                  <p>🕐 {doc.experience} years experience</p>
                )}
                {doc.fees !== undefined && (
                  <p>💰 ₹{doc.fees} consultation fee</p>
                )}
              </div>

              <button
                onClick={() => navigate(`/book/${doc._id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-colors duration-200"
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Doctors;