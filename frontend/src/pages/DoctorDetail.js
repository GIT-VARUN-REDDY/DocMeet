import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/doctor/${id}`)
      .then((res) => setDoc(res.data?.doctor || res.data))
      .catch(() => alert("Failed to load doctor details"))
      .finally(() => setLoading(false));
  }, [id]);

  const openMaps = () => {
    if (!doc) return;
    if (doc.location?.lat && doc.location?.lng) {
      window.open(`https://www.google.com/maps?q=${doc.location.lat},${doc.location.lng}`, "_blank");
    } else if (doc.location?.address) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(doc.location.address)}`, "_blank");
    } else if (doc.hospital) {
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(doc.hospital + " " + (doc.city || ""))}`, "_blank");
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
    </div>
  );

  if (!doc) return (
    <div className="flex justify-center items-center min-h-screen text-gray-400">
      <p>Doctor not found</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">

      {/* ── HERO BANNER ── */}
      <div className="relative h-56 w-full overflow-hidden">
        {doc.hospitalPhoto ? (
          <img src={doc.hospitalPhoto} alt="Hospital" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-400" />
        )}
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-black/30" />

        {/* Back button */}
        <button
          onClick={() => navigate("/doctors")}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition"
        >
          ← Back to Doctors
        </button>

        {/* Hospital label */}
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">Hospital / Clinic</p>
          <p className="text-lg font-bold">{doc.hospital || "Not specified"}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12">

        {/* ── PROFILE CARD ── */}
        <div className="bg-white rounded-3xl shadow-xl p-6 -mt-8 relative z-10 mb-6">
          <div className="flex items-start gap-5">
            {/* Profile photo */}
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-blue-100 flex items-center justify-center shadow-lg shrink-0 border-4 border-white -mt-12">
              {doc.profilePhoto ? (
                <img src={doc.profilePhoto} alt={doc.name} className="w-full h-full object-cover object-top" />
              ) : (
                <span className="text-4xl font-bold text-blue-600">{doc.name?.charAt(0).toUpperCase()}</span>
              )}
            </div>

            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">Dr. {doc.name}</h1>
                  <span className="inline-block mt-1 text-sm font-semibold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                    {doc.specialization || "General Physician"}
                  </span>
                </div>
                {doc.available ? (
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block"></span> Available
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full">
                    Unavailable
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <p className="text-xl font-extrabold text-blue-700">{doc.experience ?? "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">Yrs Experience</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-3 text-center">
              <p className="text-xl font-extrabold text-green-700">₹{doc.fees ?? "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">Consultation</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3 text-center">
              <p className="text-xl font-extrabold text-purple-700">{doc.slots?.length ?? 8}</p>
              <p className="text-xs text-gray-400 mt-0.5">Time Slots</p>
            </div>
          </div>
        </div>

        {/* ── CONTACT & LOCATION ── */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Contact & Location</h2>
          <div className="space-y-3">
            {doc.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Phone</p>
                  <a href={`tel:${doc.phone}`} className="text-blue-600 font-semibold hover:underline">
                    {doc.phone}
                  </a>
                </div>
              </div>
            )}
            {doc.hospital && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">🏥</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Hospital / Clinic</p>
                  <p className="text-gray-800 font-semibold">{doc.hospital}</p>
                </div>
              </div>
            )}
            {doc.city && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">📍</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">City</p>
                  <p className="text-gray-800 font-semibold">{doc.city}</p>
                </div>
              </div>
            )}
            {doc.location?.address && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">🗺️</span>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 font-medium">Exact Address</p>
                  <p className="text-gray-700 text-sm">{doc.location.address}</p>
                </div>
              </div>
            )}

            {/* Navigate button */}
            {(doc.location?.lat || doc.hospital || doc.location?.address) && (
              <button
                onClick={openMaps}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2 mt-2"
              >
                🗺️ Navigate to Hospital on Google Maps
              </button>
            )}
          </div>
        </div>

        {/* ── ABOUT ── */}
        {doc.about && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">👨‍⚕️ About Dr. {doc.name}</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{doc.about}</p>
          </div>
        )}

        {/* ── AVAILABLE SLOTS ── */}
        {doc.slots?.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🕐 Available Time Slots</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {doc.slots.map((slot) => (
                <div key={slot} className="bg-blue-50 text-blue-700 text-center py-2 px-3 rounded-xl text-sm font-semibold border border-blue-100">
                  {slot}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── HOSPITAL PHOTO full view ── */}
        {doc.hospitalPhoto && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">🏥 Hospital / Clinic Photo</h2>
            <img
              src={doc.hospitalPhoto}
              alt="Hospital"
              className="w-full rounded-2xl object-cover max-h-64"
            />
          </div>
        )}

        {/* ── BOOK BUTTON ── */}
        <button
          onClick={() => navigate(`/book/${doc._id}`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl transition text-lg shadow-xl"
        >
          📅 Book Appointment with Dr. {doc.name}
        </button>
      </div>
    </div>
  );
}