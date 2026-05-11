import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";
import { StarDisplay } from "../components/StarRating";
import ReviewSection from "../components/ReviewSection";

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
    <div className="flex justify-center items-center min-h-screen text-gray-400 flex-col gap-3">
      <p className="text-5xl">🩺</p>
      <p>Doctor not found</p>
      <button onClick={() => navigate("/doctors")} className="text-blue-600 hover:underline text-sm">← Back</button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">

      {/* Hospital photo banner */}
      <div className="relative h-56 w-full overflow-hidden">
        {doc.hospitalPhoto
          ? <img src={doc.hospitalPhoto} alt="Hospital" className="w-full h-full object-cover" />
          : <div className="w-full h-full bg-gradient-to-r from-blue-600 to-blue-400" />
        }
        <div className="absolute inset-0 bg-black/35" />
        <button onClick={() => navigate("/doctors")}
          className="absolute top-4 left-4 bg-white/20 backdrop-blur text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition">
          ← Back
        </button>
        <div className="absolute bottom-4 left-5 text-white">
          <p className="text-xs font-semibold opacity-70 uppercase tracking-wider">Hospital / Clinic</p>
          <p className="text-lg font-bold">{doc.hospital || "Not specified"}</p>
          {doc.city && <p className="text-sm opacity-80">📍 {doc.city}</p>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 pb-12">

        {/* Profile card */}
        <div className="bg-white rounded-3xl shadow-xl p-6 -mt-8 relative z-10 mb-6">
          <div className="flex items-start gap-5">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-blue-100 flex items-center justify-center shadow-lg shrink-0 border-4 border-white -mt-14">
              {doc.profilePhoto
                ? <img src={doc.profilePhoto} alt={doc.name} className="w-full h-full object-cover object-top" />
                : <span className="text-4xl font-bold text-blue-600">{doc.name?.charAt(0)?.toUpperCase()}</span>
              }
            </div>
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h1 className="text-2xl font-extrabold text-gray-900">Dr. {doc.name}</h1>
                  <span className="inline-block mt-1 text-sm font-semibold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
                    {doc.specialization || "General Physician"}
                  </span>
                  {/* ✅ Rating shown here */}
                  <div className="mt-2">
                    <StarDisplay rating={doc.averageRating || 0} total={doc.totalReviews || 0} size="sm" />
                  </div>
                </div>
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${
                  doc.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-500"
                }`}>
                  <span className={`w-2 h-2 rounded-full ${doc.available ? "bg-green-500" : "bg-red-400"}`}></span>
                  {doc.available ? "Available" : "Unavailable"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-4 gap-3 mt-6">
            <div className="bg-blue-50 rounded-2xl p-3 text-center">
              <p className="text-xl font-extrabold text-blue-700">{doc.experience ?? "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">Yrs Exp</p>
            </div>
            <div className="bg-green-50 rounded-2xl p-3 text-center">
              <p className="text-xl font-extrabold text-green-700">₹{doc.fees ?? "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">Fee</p>
            </div>
            <div className="bg-yellow-50 rounded-2xl p-3 text-center">
              <p className="text-xl font-extrabold text-yellow-600">{doc.averageRating || "—"}</p>
              <p className="text-xs text-gray-400 mt-0.5">Rating</p>
            </div>
            <div className="bg-purple-50 rounded-2xl p-3 text-center">
              <p className="text-xl font-extrabold text-purple-700">{doc.totalReviews || 0}</p>
              <p className="text-xs text-gray-400 mt-0.5">Reviews</p>
            </div>
          </div>
        </div>

        {/* Contact & Location */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4">📋 Contact & Location</h2>
          <div className="space-y-3">
            {doc.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">📞</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Phone</p>
                  <a href={`tel:${doc.phone}`} className="text-blue-600 font-semibold hover:underline">{doc.phone}</a>
                </div>
              </div>
            )}
            {doc.hospital && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">🏥</span>
                <div>
                  <p className="text-xs text-gray-400 font-medium">Hospital</p>
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
                <div>
                  <p className="text-xs text-gray-400 font-medium">Address</p>
                  <p className="text-gray-700 text-sm">{doc.location.address}</p>
                </div>
              </div>
            )}
            {(doc.location?.lat || doc.hospital) && (
              <button onClick={openMaps}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-2xl transition flex items-center justify-center gap-2">
                🗺️ Navigate to Hospital on Google Maps
              </button>
            )}
          </div>
        </div>

        {/* About */}
        {doc.about && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">👨‍⚕️ About Dr. {doc.name}</h2>
            <p className="text-gray-600 leading-relaxed text-sm">{doc.about}</p>
          </div>
        )}

        {/* Available Slots */}
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

        {/* ✅ Reviews Section */}
        <ReviewSection doctorId={id} />

        {/* Book button */}
        <button onClick={() => navigate(`/book/${doc._id}`)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-4 rounded-2xl transition text-lg shadow-xl">
          📅 Book Appointment with Dr. {doc.name}
        </button>
      </div>
    </div>
  );
}