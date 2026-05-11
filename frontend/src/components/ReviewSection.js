import React, { useState, useEffect } from "react";
import API from "../services/api";
import { StarDisplay, StarPicker } from "./StarRating";

export default function ReviewSection({ doctorId }) {
  const [reviews, setReviews] = useState([]);
  const [average, setAverage] = useState(0);
  const [total, setTotal] = useState(0);
  const [canReview, setCanReview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isPatient = user.role === "user";

  const fetchReviews = async () => {
    try {
      const res = await API.get(`/reviews/${doctorId}`);
      setReviews(res.data.reviews);
      setAverage(res.data.average);
      setTotal(res.data.total);
    } catch (e) {
      console.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const checkCanReview = async () => {
    if (!token || !isPatient) return;
    try {
      const res = await API.get(`/reviews/check/${doctorId}`);
      setCanReview(res.data.canReview);
    } catch (e) {}
  };

  useEffect(() => {
    fetchReviews();
    checkCanReview();
  }, [doctorId]);

  const submitReview = async () => {
    if (!rating) return setError("Please select a rating");
    setError(""); setSubmitting(true);
    try {
      await API.post("/reviews", { doctorId, rating, comment });
      setSuccess("✅ Review submitted! Thank you.");
      setShowForm(false);
      setRating(0);
      setComment("");
      setCanReview(false);
      fetchReviews();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteReview = async (id) => {
    if (!window.confirm("Delete your review?")) return;
    try {
      await API.delete(`/reviews/${id}`);
      fetchReviews();
      setCanReview(true);
    } catch (e) {
      alert("Failed to delete review");
    }
  };

  // Rating breakdown
  const breakdown = [5,4,3,2,1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: total ? Math.round((reviews.filter((r) => r.rating === star).length / total) * 100) : 0,
  }));

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
      <h2 className="text-lg font-bold text-gray-800 mb-6">⭐ Ratings & Reviews</h2>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row gap-6 mb-6">
        {/* Average score */}
        <div className="text-center sm:w-32 shrink-0">
          <p className="text-6xl font-extrabold text-gray-900">{average || "—"}</p>
          <StarDisplay rating={average} size="md" />
          <p className="text-gray-400 text-sm mt-1">{total} {total === 1 ? "review" : "reviews"}</p>
        </div>

        {/* Breakdown bars */}
        <div className="flex-1 space-y-2">
          {breakdown.map(({ star, count, pct }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-500 w-4">{star}</span>
              <span className="text-yellow-400 text-sm">★</span>
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-yellow-400 h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-xs text-gray-400 w-6">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Success message */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-4 text-sm">{success}</div>
      )}

      {/* Write review button */}
      {token && isPatient && canReview && !showForm && (
        <button onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition mb-6">
          ✍️ Write a Review
        </button>
      )}

      {/* Not logged in */}
      {!token && (
        <div className="bg-blue-50 border border-blue-200 text-blue-600 text-sm px-4 py-3 rounded-xl mb-6 text-center">
          <a href="/login" className="font-semibold hover:underline">Login</a> to write a review
        </div>
      )}

      {/* Review form */}
      {showForm && (
        <div className="bg-blue-50 rounded-2xl p-5 mb-6 border border-blue-100">
          <h3 className="font-bold text-gray-800 mb-4">Your Review</h3>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Rating *</p>
            <StarPicker value={rating} onChange={setRating} />
            <p className="text-xs text-gray-400 mt-1">
              {["","Poor","Fair","Good","Very Good","Excellent"][rating] || ""}
            </p>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Comment (optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this doctor..."
              rows={3}
              maxLength={500}
              className="border border-gray-200 p-3 w-full rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none"
            />
            <p className="text-xs text-gray-400 text-right">{comment.length}/500</p>
          </div>

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <div className="flex gap-2">
            <button onClick={submitReview} disabled={submitting || !rating}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition disabled:opacity-60">
              {submitting ? "Submitting..." : "Submit Review"}
            </button>
            <button onClick={() => { setShowForm(false); setError(""); setRating(0); setComment(""); }}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center text-gray-400 py-8">
          <p className="text-4xl mb-2">💬</p>
          <p className="font-medium">No reviews yet</p>
          <p className="text-sm">Be the first to review this doctor</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r._id} className="border-b border-gray-100 pb-4 last:border-0">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                    {r.patient?.name?.charAt(0)?.toUpperCase() || "P"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-800 text-sm">{r.patient?.name || "Patient"}</p>
                      <StarDisplay rating={r.rating} size="sm" />
                    </div>
                    {r.comment && (
                      <p className="text-gray-600 text-sm mt-1 leading-relaxed">{r.comment}</p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">
                      {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                </div>
                {/* Delete own review */}
                {token && r.patient?._id === JSON.parse(atob(token.split(".")[1])).id && (
                  <button onClick={() => deleteReview(r._id)}
                    className="text-red-400 hover:text-red-600 text-xs hover:underline shrink-0">
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}