import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";
import { StarPicker } from "../components/StarRating";

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const [reviewModal, setReviewModal] = useState(null); // appointment object
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reviewed, setReviewed] = useState({}); // track reviewed doctor IDs
  const navigate = useNavigate();

  useEffect(() => {
    API.get("/appointment/my")
      .then((res) => setAppointments(res.data))
      .catch(() => alert("Failed to load appointments"))
      .finally(() => setLoading(false));
  }, []);

  const cancel = async (id) => {
    if (!window.confirm("Cancel this appointment? The slot will be freed.")) return;
    setCancelling(id);
    try {
      await API.delete(`/appointment/${id}`);
      setAppointments((prev) => prev.filter((a) => a._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Cancellation failed");
    } finally {
      setCancelling(null);
    }
  };

  const openReview = (appt) => {
    setReviewModal(appt);
    setRating(0);
    setComment("");
  };

  const submitReview = async () => {
    if (!rating) return alert("Please select a rating");
    setSubmitting(true);
    try {
      await API.post("/reviews", {
        doctorId: reviewModal.doctor._id,
        rating,
        comment,
        appointmentId: reviewModal._id,
      });
      setReviewed((prev) => ({ ...prev, [reviewModal.doctor._id]: true }));
      setReviewModal(null);
      alert("✅ Review submitted! Thank you.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        {/* Review Modal */}
        {reviewModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold text-gray-800 mb-1">Rate Dr. {reviewModal.doctor?.name}</h3>
              <p className="text-gray-400 text-sm mb-5">How was your experience?</p>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Your Rating *</p>
                <StarPicker value={rating} onChange={setRating} />
                <p className="text-xs text-gray-400 mt-1">
                  {["","Poor","Fair","Good","Very Good","Excellent"][rating] || ""}
                </p>
              </div>

              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience (optional)..."
                rows={3}
                maxLength={500}
                className="border border-gray-200 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none mb-4"
              />

              <div className="flex gap-2">
                <button onClick={submitReview} disabled={submitting || !rating}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
                <button onClick={() => setReviewModal(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-blue-700">My Appointments</h2>
            <p className="text-gray-400 text-sm mt-1">Your confirmed bookings</p>
          </div>
          <button onClick={() => navigate("/doctors")}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
            + Book New
          </button>
        </div>

        {loading && (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500"></div>
          </div>
        )}

        {!loading && appointments.length === 0 && (
          <div className="text-center text-gray-400 mt-16">
            <p className="text-5xl mb-4">📅</p>
            <p className="text-lg font-semibold">No appointments yet</p>
            <p className="text-sm mb-6">Book your first appointment with a doctor</p>
            <button onClick={() => navigate("/doctors")}
              className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition">
              Browse Doctors
            </button>
          </div>
        )}

        <div className="space-y-4">
          {appointments.map((a) => (
            <div key={a._id} className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-xl font-bold text-blue-600 shrink-0">
                    {a.doctor?.name?.charAt(0).toUpperCase() || "D"}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800">Dr. {a.doctor?.name || "Unknown"}</p>
                    <p className="text-blue-500 text-xs mb-1">{a.doctor?.specialization}</p>
                    <p className="text-gray-500 text-sm">📅 {a.date} &nbsp; 🕐 {a.time}</p>
                    {a.symptoms && <p className="text-gray-400 text-xs mt-1">📝 {a.symptoms}</p>}
                    {a.paid && <p className="text-green-600 text-xs mt-1">💳 Paid ₹{a.amount}</p>}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-green-100 text-green-700">
                    ✅ Confirmed
                  </span>
                  {/* ✅ Rate & Review button */}
                  {!reviewed[a.doctor?._id] && (
                    <button onClick={() => openReview(a)}
                      className="text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 font-semibold px-3 py-1 rounded-full transition">
                      ⭐ Rate Doctor
                    </button>
                  )}
                  {reviewed[a.doctor?._id] && (
                    <span className="text-xs text-green-500 font-medium">✅ Reviewed</span>
                  )}
                  <button onClick={() => cancel(a._id)} disabled={cancelling === a._id}
                    className="text-xs text-red-400 hover:text-red-600 hover:underline transition disabled:opacity-50">
                    {cancelling === a._id ? "Cancelling..." : "Cancel"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}