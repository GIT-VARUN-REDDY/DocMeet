import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

function Book() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);

  // Today's date as min for date picker
  const today = new Date().toISOString().split("T")[0];

  useEffect(() => {
    API.get(`/doctor/${id}`)
      .then((res) => setDoctor(res.data))
      .catch(() => alert("Doctor not found"));
  }, [id]);

  useEffect(() => {
    if (!date) return;
    setLoadingSlots(true);
    setSelectedSlot("");
    API.get(`/appointment/available?doctorId=${id}&date=${date}`)
      .then((res) => setSlots(res.data.availableSlots))
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [date, id]);

  const book = async () => {
    if (!date) return alert("Please select a date");
    if (!selectedSlot) return alert("Please select a time slot");

    setBooking(true);
    try {
      await API.post("/appointment/book", {
        doctorId: id,
        date,
        time: selectedSlot,
        symptoms: symptoms || "General checkup",
      });
      alert("✅ Appointment booked successfully!");
      navigate("/my");
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed. Please try again.");
    } finally {
      setBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-8">
      <div className="max-w-xl mx-auto">
        <button
          onClick={() => navigate("/doctors")}
          className="text-blue-600 hover:underline text-sm mb-6 flex items-center gap-1"
        >
          ← Back to Doctors
        </button>

        {/* Doctor Info */}
        {doctor && (
          <div className="bg-white rounded-2xl shadow p-6 mb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-600">
              {doctor.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Dr. {doctor.name}</h2>
              <p className="text-blue-500 text-sm">{doctor.specialization}</p>
              <p className="text-gray-400 text-xs">₹{doctor.fees} • {doctor.experience} yrs experience</p>
            </div>
          </div>
        )}

        {/* Date Picker */}
        <div className="bg-white rounded-2xl shadow p-6 mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            📅 Select Date
          </label>
          <input
            type="date"
            min={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
          />
        </div>

        {/* Time Slots */}
        {date && (
          <div className="bg-white rounded-2xl shadow p-6 mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-3">
              🕐 Available Slots
            </label>

            {loadingSlots ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-2">
                No slots available for this date
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      selectedSlot === slot
                        ? "bg-blue-600 text-white shadow"
                        : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Symptoms */}
        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">
            📝 Symptoms / Reason (optional)
          </label>
          <textarea
            placeholder="Describe your symptoms or reason for visit..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={3}
            className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
          />
        </div>

        {/* Book Button */}
        <button
          onClick={book}
          disabled={booking || !date || !selectedSlot}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition disabled:opacity-50"
        >
          {booking ? "Booking..." : `Confirm Booking ${selectedSlot ? `at ${selectedSlot}` : ""}`}
        </button>
      </div>
    </div>
  );
}

export default Book;