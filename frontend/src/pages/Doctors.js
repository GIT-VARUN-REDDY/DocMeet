import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../services/api";
import { StarDisplay } from "../components/StarRating";

const SPECIALIZATIONS = [
  "All","Cardiologist","Dermatologist","Neurologist","Orthopedic",
  "Pediatrician","General Physician","Gynecologist","Psychiatrist",
  "ENT Specialist","Ophthalmologist",
];

export default function Doctors() {
  const [doctors, setDoctors] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    setSearch(query.get("search") || "");
    setFilter(query.get("specialty") || "All");
    API.get("/doctor/all")
      .then((res) => setDoctors(res.data))
      .catch(() => alert("Failed to load doctors"))
      .finally(() => setLoading(false));
  }, [location.search]);

  useEffect(() => {
    let data = [...doctors];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((d) =>
        d.name?.toLowerCase().includes(q) ||
        d.specialization?.toLowerCase().includes(q) ||
        d.hospital?.toLowerCase().includes(q) ||
        d.city?.toLowerCase().includes(q)
      );
    }
    if (filter !== "All") data = data.filter((d) => d.specialization === filter);
    setFiltered(data);
  }, [search, filter, doctors]);

  const openMaps = (e, doc) => {
    e.stopPropagation();
    if (doc.location?.lat && doc.location?.lng) {
      window.open(`https://www.google.com/maps?q=${doc.location.lat},${doc.location.lng}`, "_blank");
    } else if (doc.hospital) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(doc.hospital + " " + (doc.city || ""))}`, "_blank");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-bold text-blue-700 mb-2">Find Your Doctor</h2>
        <p className="text-gray-500">Search by name, specialty, hospital, or city</p>
      </div>

      <div className="max-w-lg mx-auto mb-5">
        <input type="text" placeholder="🔍 Search by name, specialty, hospital, city..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-blue-200 rounded-full px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white text-gray-700" />
      </div>

      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {SPECIALIZATIONS.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === s ? "bg-blue-600 text-white shadow" : "bg-white text-blue-600 border border-blue-200 hover:bg-blue-50"
            }`}>{s}</button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center h-40 items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center text-gray-400 mt-16">
          <p className="text-5xl mb-4">🩺</p>
          <p className="text-lg font-semibold">No doctors found</p>
          <p className="text-sm">Try a different search or filter</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filtered.map((doc) => (
          <div key={doc._id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden">

            {/* 35% profile | 65% hospital photo */}
            <div className="h-36 flex">
              <div className="w-[35%] relative overflow-hidden bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
                {doc.profilePhoto
                  ? <img src={doc.profilePhoto} alt={doc.name} className="w-full h-full object-cover object-top" />
                  : <span className="text-4xl font-bold text-white">{doc.name?.charAt(0).toUpperCase()}</span>
                }
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] text-center py-0.5">Doctor</div>
              </div>
              <div className="w-px bg-white/50 shrink-0" />
              <div className="flex-1 relative overflow-hidden bg-gray-100 flex items-center justify-center">
                {doc.hospitalPhoto
                  ? <img src={doc.hospitalPhoto} alt="Hospital" className="w-full h-full object-cover" />
                  : <span className="text-4xl">🏥</span>
                }
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 text-white text-[10px] text-center py-0.5">Hospital</div>
                {doc.available && (
                  <span className="absolute top-2 right-2 bg-green-400 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold">● Available</span>
                )}
              </div>
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-gray-800">Dr. {doc.name}</h3>
              <span className="inline-block mt-1 mb-2 text-xs font-semibold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                {doc.specialization || "General Physician"}
              </span>

              {/* ✅ Star rating on card */}
              <div className="mb-3">
                <StarDisplay rating={doc.averageRating || 0} total={doc.totalReviews || 0} size="sm" />
              </div>

              <div className="text-sm text-gray-500 space-y-1 mb-4">
                {doc.hospital && <p>🏥 {doc.hospital}</p>}
                {doc.city && <p>📍 {doc.city}</p>}
                {doc.experience !== undefined && <p>🕐 {doc.experience} yrs experience</p>}
                {doc.fees !== undefined && <p>💰 ₹{doc.fees} consultation</p>}
              </div>

              <div className="flex gap-2">
                <button onClick={() => navigate(`/book/${doc._id}`)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition text-sm">
                  Book
                </button>
                <button onClick={() => navigate(`/doctor/${doc._id}`)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-2 rounded-xl transition text-sm"
                  title="View profile">
                  👁
                </button>
                {(doc.location?.lat || doc.hospital) && (
                  <button onClick={(e) => openMaps(e, doc)}
                    title="Navigate to hospital"
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-xl transition">
                    🗺️
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}