import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const SPECIALIZATIONS = [
  "General Physician","Cardiologist","Dermatologist","Neurologist",
  "Orthopedic","Pediatrician","Gynecologist","Psychiatrist","ENT Specialist","Ophthalmologist",
];

const DEFAULT_SLOTS = [
  "09:00 AM","10:00 AM","11:00 AM","12:00 PM",
  "02:00 PM","03:00 PM","04:00 PM","05:00 PM",
];

export default function DoctorProfile() {
  const [form, setForm] = useState({
    name:"", phone:"", specialization:"", experience:"", fees:"",
    hospital:"", city:"", about:"", available:true,
    slots: DEFAULT_SLOTS, profilePhoto:"", hospitalPhoto:"", location:{},
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("profile");
  const [cameraOpen, setCameraOpen] = useState(null);
  const [locating, setLocating] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const navigate = useNavigate();

  const fillForm = (doc) => setForm({
    name: doc.name || "",
    phone: doc.phone || "",
    specialization: doc.specialization || "General Physician",
    experience: doc.experience ?? "",
    fees: doc.fees ?? "",
    hospital: doc.hospital || "",
    city: doc.city || "",
    about: doc.about || "",
    available: doc.available ?? true,
    slots: doc.slots?.length ? doc.slots : DEFAULT_SLOTS,
    profilePhoto: doc.profilePhoto || "",
    hospitalPhoto: doc.hospitalPhoto || "",
    location: doc.location || {},
  });

  useEffect(() => {
    API.get("/doctor/me/profile")
      .then((res) => fillForm(res.data?.doctor || res.data))
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const toggleSlot = (slot) => {
    setForm((p) => ({
      ...p,
      slots: p.slots.includes(slot) ? p.slots.filter((s) => s !== slot) : [...p.slots, slot],
    }));
  };

  const handlePhotoFile = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2_000_000) return setError("Photo must be under 2MB");
    const reader = new FileReader();
    reader.onload = () => setForm((p) => ({ ...p, [type]: reader.result }));
    reader.readAsDataURL(file);
  };

  const openCamera = async (type) => {
    setCameraOpen(type);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      setTimeout(() => { if (videoRef.current) videoRef.current.srcObject = stream; }, 100);
    } catch {
      setError("Camera access denied");
      setCameraOpen(null);
    }
  };

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    setForm((p) => ({ ...p, [cameraOpen]: canvas.toDataURL("image/jpeg", 0.8) }));
    closeCamera();
  };

  const closeCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOpen(null);
  };

  const getLocation = () => {
    setLocating(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude: lat, longitude: lng } }) => {
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
          const data = await res.json();
          setForm((p) => ({ ...p, location: { lat, lng, address: data.display_name } }));
          setSuccess("📍 Location captured!");
          setTimeout(() => setSuccess(""), 3000);
        } catch {
          setForm((p) => ({ ...p, location: { lat, lng, address: `${lat}, ${lng}` } }));
        }
        setLocating(false);
      },
      (err) => { setError("Location error: " + err.message); setLocating(false); },
      { enableHighAccuracy: true }
    );
  };

  const save = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await API.put("/doctor/profile", form);
      fillForm(res.data?.doctor || res.data);
      setSuccess("✅ Profile updated successfully!");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-teal-500"></div>
    </div>
  );

  const ic = "border border-gray-200 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm";

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100">

      {/* Camera Modal */}
      {cameraOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col items-center justify-center gap-4">
          <p className="text-white font-semibold text-lg">
            📸 {cameraOpen === "profilePhoto" ? "Profile Photo" : "Hospital Photo"}
          </p>
          <video ref={videoRef} autoPlay playsInline className="rounded-2xl w-80 h-60 object-cover border-4 border-white" />
          <div className="flex gap-3">
            <button onClick={capturePhoto} className="bg-white text-gray-900 font-bold px-6 py-3 rounded-full hover:bg-gray-100 transition">📷 Capture</button>
            <button onClick={closeCamera} className="bg-red-500 text-white font-bold px-6 py-3 rounded-full hover:bg-red-600 transition">Cancel</button>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-teal-700">My Profile</h1>
            <p className="text-gray-400 text-sm mt-1">Keep your profile updated so patients can find you</p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="text-teal-600 hover:underline text-sm font-semibold">← Dashboard</button>
        </div>

        {error && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-4 text-sm">{error}</div>}
        {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{success}</div>}

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-2xl p-1.5 shadow-sm">
          {[
            { id:"profile",  label:"👤 Profile" },
            { id:"photos",   label:"📸 Photos" },
            { id:"location", label:"📍 Location" },
            { id:"slots",    label:"🕐 Availability" },
          ].map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition ${
                activeTab === tab.id ? "bg-teal-600 text-white shadow" : "text-gray-500 hover:text-teal-600"
              }`}
            >{tab.label}</button>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-lg p-8">

          {/* ── PROFILE TAB ── */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              {/* Preview card */}
              <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-2xl mb-6">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-teal-200 flex items-center justify-center shrink-0">
                  {form.profilePhoto
                    ? <img src={form.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    : <span className="text-2xl font-bold text-teal-700">{form.name?.charAt(0)}</span>
                  }
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-800 text-lg">Dr. {form.name || "—"}</p>
                  <p className="text-teal-600 text-sm">{form.specialization}</p>
                  <p className="text-gray-400 text-xs">{form.hospital} {form.city ? `• ${form.city}` : ""}</p>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer">
                  <input type="checkbox" name="available" checked={form.available} onChange={handleChange} className="w-4 h-4 accent-teal-600" />
                  Available
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Full Name</label><input name="name" value={form.name} onChange={handleChange} className={ic} /></div>
                <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Phone</label><input name="phone" value={form.phone} onChange={handleChange} className={ic} /></div>
                <div>
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Specialization</label>
                  <select name="specialization" value={form.specialization} onChange={handleChange} className={`${ic} bg-white`}>
                    {SPECIALIZATIONS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Experience (years)</label><input name="experience" type="number" min="0" value={form.experience} onChange={handleChange} className={ic} /></div>
                <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Consultation Fee (₹)</label><input name="fees" type="number" min="0" value={form.fees} onChange={handleChange} className={ic} /></div>
                <div><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Hospital / Clinic</label><input name="hospital" value={form.hospital} onChange={handleChange} className={ic} /></div>
                <div className="md:col-span-2"><label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">City</label><input name="city" value={form.city} onChange={handleChange} className={ic} /></div>
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">About / Bio</label>
                  <textarea name="about" value={form.about} onChange={handleChange} rows={4} className={`${ic} resize-none`} placeholder="Tell patients about your expertise..." />
                </div>
              </div>
            </div>
          )}

          {/* ── PHOTOS TAB ── */}
          {activeTab === "photos" && (
            <div className="space-y-8">
              {/* Profile Photo */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">👤 Profile Photo (Selfie)</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-36 h-36 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 shrink-0">
                    {form.profilePhoto ? <img src={form.profilePhoto} alt="Profile" className="w-full h-full object-cover" /> : <span className="text-5xl">👤</span>}
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-500">Upload a clear professional photo of yourself</p>
                    <label className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition text-center">
                      📁 Upload from Device
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoFile(e, "profilePhoto")} />
                    </label>
                    <button onClick={() => openCamera("profilePhoto")} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">📷 Take with Camera</button>
                    {form.profilePhoto && <button onClick={() => setForm((p) => ({ ...p, profilePhoto: "" }))} className="text-red-400 hover:text-red-600 text-sm hover:underline">🗑 Remove</button>}
                  </div>
                </div>
              </div>

              <hr className="border-gray-100" />

              {/* Hospital Photo */}
              <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">🏥 Hospital / Clinic Photo</h3>
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="w-48 h-36 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300 shrink-0">
                    {form.hospitalPhoto ? <img src={form.hospitalPhoto} alt="Hospital" className="w-full h-full object-cover" /> : <span className="text-5xl">🏥</span>}
                  </div>
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-gray-500">Upload a photo of your hospital or clinic</p>
                    <label className="cursor-pointer bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition text-center">
                      📁 Upload from Device
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoFile(e, "hospitalPhoto")} />
                    </label>
                    <button onClick={() => openCamera("hospitalPhoto")} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition">📷 Take with Camera</button>
                    {form.hospitalPhoto && <button onClick={() => setForm((p) => ({ ...p, hospitalPhoto: "" }))} className="text-red-400 hover:text-red-600 text-sm hover:underline">🗑 Remove</button>}
                  </div>
                </div>
              </div>

              {/* Preview side by side */}
              {(form.profilePhoto || form.hospitalPhoto) && (
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Preview — how it appears on your card</p>
                  <div className="h-32 flex rounded-2xl overflow-hidden border border-gray-200">
                    <div className="w-[35%] overflow-hidden bg-blue-100 flex items-center justify-center">
                      {form.profilePhoto ? <img src={form.profilePhoto} alt="Profile" className="w-full h-full object-cover object-top" /> : <span className="text-3xl">👤</span>}
                    </div>
                    <div className="w-px bg-gray-200" />
                    <div className="flex-1 overflow-hidden bg-gray-100 flex items-center justify-center">
                      {form.hospitalPhoto ? <img src={form.hospitalPhoto} alt="Hospital" className="w-full h-full object-cover" /> : <span className="text-3xl">🏥</span>}
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 text-center mt-2">35% profile · 65% hospital</p>
                </div>
              )}
            </div>
          )}

          {/* ── LOCATION TAB ── */}
          {activeTab === "location" && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">📍 Hospital Location</h3>
              <p className="text-gray-400 text-sm">Set your exact GPS location so patients can navigate directly to your hospital.</p>

              {form.location?.lat && (
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
                  <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Current Location</p>
                  <p className="text-gray-700 text-sm mb-1">📍 {form.location.address}</p>
                  <p className="text-gray-400 text-xs">Lat: {form.location.lat?.toFixed(6)}, Lng: {form.location.lng?.toFixed(6)}</p>
                  <button
                    onClick={() => window.open(`https://www.google.com/maps?q=${form.location.lat},${form.location.lng}`, "_blank")}
                    className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
                  >
                    🗺️ Preview on Google Maps
                  </button>
                </div>
              )}

              <button onClick={getLocation} disabled={locating}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-bold transition disabled:opacity-60 flex items-center justify-center gap-3 text-lg"
              >
                {locating ? <><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-white"></div>Getting location...</> : <>📍 {form.location?.lat ? "Update Location" : "Get My Current Location"}</>}
              </button>

              <p className="text-xs text-gray-400 text-center">Be at your hospital when capturing for accuracy</p>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Or enter address manually</label>
                <input
                  placeholder="e.g. Apollo Hospital, Jubilee Hills, Hyderabad"
                  value={form.location?.address || ""}
                  onChange={(e) => setForm((p) => ({ ...p, location: { ...p.location, address: e.target.value } }))}
                  className={ic}
                />
              </div>
            </div>
          )}

          {/* ── SLOTS TAB ── */}
          {activeTab === "slots" && (
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">🕐 Available Time Slots</h3>
              <p className="text-gray-400 text-sm mb-6">Select the slots you're available. Patients can only book selected slots.</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {DEFAULT_SLOTS.map((slot) => (
                  <button key={slot} onClick={() => toggleSlot(slot)}
                    className={`py-3 rounded-xl text-sm font-semibold transition border-2 ${
                      form.slots?.includes(slot) ? "bg-teal-600 text-white border-teal-600 shadow" : "bg-white text-gray-500 border-gray-200 hover:border-teal-400"
                    }`}
                  >{slot}</button>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
                <p className="font-semibold">Selected: {form.slots?.length || 0} slots</p>
              </div>
            </div>
          )}

          {/* Save */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <button onClick={save} disabled={saving}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-4 rounded-2xl font-bold text-lg transition disabled:opacity-60 shadow-lg"
            >
              {saving ? "Saving..." : "💾 Save Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}