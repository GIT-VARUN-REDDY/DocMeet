import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";

const SPECIALIZATIONS = [
  "All", "Cardiologist", "Dermatologist", "Neurologist",
  "Orthopedic", "Pediatrician", "General Physician", "Gynecologist",
  "Psychiatrist", "ENT Specialist", "Ophthalmologist",
];

function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // Load doctors & read query params from Home page
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const searchQuery = query.get("search") || "";
    const specialtyQuery = query.get("specialty") || "All";
    setSearch(searchQuery);
    setFilter(specialtyQuery);

    API.get("/doctor/all")
      .then((res) => setDoctors(res.data))
      .catch(() => alert("Failed to load doctors. Is the backend running?"))
      .finally(() => setLoading(false));
  }, [location.search]);

  // Apply filters
  useEffect(() => {
    let data = [...doctors];

    if (search) {
      const q = search.toLowerCase();
      data = data.filter((doc) =>
        doc.name?.toLowerCase().includes(q) ||
        doc.specialization?.toLowerCase().includes(q) ||
        doc.hospital?.toLowerCase().includes(q) ||
        doc.city?.toLowerCase().includes(q)
      );
    }

    if (filter !== "All") {
      data = data.filter((doc) => doc.specialization === filter);
    }

    setFilteredDoctors(data);
  }, [search, filter, doctors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-blue-700 mb-2">Find Your Doctor</h2>
        <p className="text-gray-500">Browse by name, specialty, hospital, or city</p>
      </div>

      {/* Search */}
      <div className="max-w-lg mx-auto mb-5">
        <input
          type="text"
          placeholder="🔍 Search by name, specialty, hospital, city..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-blue-200 rounded-full px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700"
        />
      </div>

      {/* Specialty Filter Pills */}
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
      {!loading && filteredDoctors.length === 0 && (
        <div className="text-center text-gray-400 mt-16">
          <p className="text-5xl mb-4">🩺</p>
          <p className="text-lg font-semibold">No doctors found</p>
          <p className="text-sm">Try a different search or filter</p>
        </div>
      )}

      {/* Doctor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filteredDoctors.map((doc) => (
          <div key={doc._id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">
            {/* Top banner */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-400 h-24 flex items-center justify-center relative">
              <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center shadow-lg text-2xl font-bold text-blue-600">
                {doc.name?.charAt(0).toUpperCase() || "D"}
              </div>
              {doc.available && (
                <span className="absolute top-3 right-3 bg-green-400 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                  Available
                </span>
              )}
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-800">Dr. {doc.name}</h3>
              <span className="inline-block mt-1 mb-2 text-xs font-semibold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                {doc.specialization || "General Physician"}
              </span>

              <div className="text-sm text-gray-500 space-y-1 mb-4">
                {doc.hospital && <p>🏥 {doc.hospital}</p>}
                {doc.city && <p>📍 {doc.city}</p>}
                {doc.experience !== undefined && <p>🕐 {doc.experience} yrs experience</p>}
                {doc.fees !== undefined && <p>💰 ₹{doc.fees} consultation</p>}
                {doc.phone && <p>📞 {doc.phone}</p>}
              </div>

              <button
                onClick={() => navigate(`/book/${doc._id}`)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition"
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