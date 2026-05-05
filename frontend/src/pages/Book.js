import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Book() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const today = new Date().toISOString().split("T")[0];
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    API.get(`/doctor/${id}`)
      .then((res) => setDoctor(res.data?.doctor || res.data))
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

  // ── Load Razorpay script dynamically ──
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ── Book with payment ──
  const handleBook = async () => {
    if (!date) return alert("Please select a date");
    if (!selectedSlot) return alert("Please select a time slot");

    setBooking(true);

    try {
      // If doctor has fees > 0, go through payment
      if (doctor?.fees && doctor.fees > 0) {
        await bookWithPayment();
      } else {
        await bookDirectly();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed. Please try again.");
      setBooking(false);
    }
  };

  // ── Free booking (no fees) ──
  const bookDirectly = async () => {
    await API.post("/appointment/book", {
      doctorId: id, date, time: selectedSlot,
      symptoms: symptoms || "General checkup",
      paid: false, amount: 0,
    });
    alert("✅ Appointment booked successfully!");
    navigate("/my");
  };

  // ── Paid booking via Razorpay ──
  const bookWithPayment = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) {
      alert("Failed to load payment gateway. Check your internet connection.");
      setBooking(false);
      return;
    }

    // Step 1: Create order on backend
    const orderRes = await API.post("/payment/create-order", {
      amount: doctor.fees,
      doctorName: doctor.name,
    });

    const { orderId, amount, currency, keyId } = orderRes.data;

    // Step 2: Open Razorpay checkout
    const options = {
      key: keyId,
      amount,
      currency,
      name: "DocMeet",
      description: `Appointment with Dr. ${doctor.name}`,
      image: "https://i.imgur.com/3g7nmJB.png",
      order_id: orderId,
      prefill: {
        name: user.name,
        email: user.email,
      },
      theme: { color: "#2563eb" },

      handler: async (response) => {
        try {
          // Step 3: Verify payment on backend
          await API.post("/payment/verify", {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });

          // Step 4: Book appointment with payment details
          await API.post("/appointment/book", {
            doctorId: id, date, time: selectedSlot,
            symptoms: symptoms || "General checkup",
            paymentId: response.razorpay_payment_id,
            paid: true,
            amount: doctor.fees,
          });

          alert("✅ Payment successful! Appointment confirmed.");
          navigate("/my");
        } catch (err) {
          alert("Payment verified but booking failed. Contact support.");
          setBooking(false);
        }
      },

      modal: {
        ondismiss: () => {
          alert("Payment cancelled.");
          setBooking(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-xl mx-auto">
        <button onClick={() => navigate("/doctors")}
          className="text-blue-600 hover:underline text-sm mb-6 flex items-center gap-1">
          ← Back to Doctors
        </button>

        {/* Doctor info */}
        {doctor && (
          <div className="bg-white rounded-2xl shadow p-5 mb-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center shrink-0">
              {doctor.profilePhoto
                ? <img src={doctor.profilePhoto} alt={doctor.name} className="w-full h-full object-cover" />
                : <span className="text-2xl font-bold text-blue-600">{doctor.name?.charAt(0)}</span>
              }
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-gray-800">Dr. {doctor.name}</h2>
              <p className="text-blue-500 text-sm">{doctor.specialization}</p>
              <p className="text-gray-400 text-xs">{doctor.hospital} • {doctor.city}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-lg font-extrabold text-green-600">₹{doctor.fees}</p>
              <p className="text-xs text-gray-400">Consultation fee</p>
            </div>
          </div>
        )}

        {/* Date picker */}
        <div className="bg-white rounded-2xl shadow p-5 mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-2">📅 Select Date</label>
          <input type="date" min={today} value={date} onChange={(e) => setDate(e.target.value)}
            className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm" />
        </div>

        {/* Time slots */}
        {date && (
          <div className="bg-white rounded-2xl shadow p-5 mb-4">
            <label className="block text-sm font-semibold text-gray-600 mb-3">🕐 Available Slots</label>
            {loadingSlots ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
              </div>
            ) : slots.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-2">No slots available for this date</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                      selectedSlot === slot ? "bg-blue-600 text-white shadow" : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}>
                    {slot}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Symptoms */}
        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-2">📝 Symptoms (optional)</label>
          <textarea placeholder="Describe your symptoms or reason for visit..."
            value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
            rows={3} className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none" />
        </div>

        {/* Payment summary */}
        {doctor?.fees > 0 && selectedSlot && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
            <p className="text-sm font-semibold text-green-700 mb-2">💳 Payment Summary</p>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Consultation fee</span>
              <span className="font-semibold">₹{doctor.fees}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mt-1">
              <span>Platform fee</span>
              <span>₹0</span>
            </div>
            <div className="border-t border-green-200 mt-2 pt-2 flex justify-between font-bold text-green-700">
              <span>Total</span>
              <span>₹{doctor.fees}</span>
            </div>
          </div>
        )}

        {/* Book button */}
        <button onClick={handleBook} disabled={booking || !date || !selectedSlot}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50 text-lg shadow-lg">
          {booking
            ? "Processing..."
            : doctor?.fees > 0
              ? `💳 Pay ₹${doctor.fees} & Confirm`
              : `✅ Confirm Booking at ${selectedSlot || "..."}`
          }
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          {doctor?.fees > 0 ? "Secured by Razorpay • UPI, Cards, Net Banking accepted" : "Free consultation — no payment required"}
        </p>
      </div>
    </div>
  );
}