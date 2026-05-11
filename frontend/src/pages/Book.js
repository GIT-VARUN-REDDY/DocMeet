import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function Book() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [booking, setBooking] = useState(false);
  const [blockedDates, setBlockedDates] = useState([]);
  const [fullyBlocked, setFullyBlocked] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const today = new Date();

  // Load doctor info + blocked dates
  useEffect(() => {
    const load = async () => {
      try {
        const [docRes, availRes] = await Promise.all([
          API.get(`/doctor/${id}`),
          API.get(`/availability/${id}`),
        ]);
        setDoctor(docRes.data?.doctor || docRes.data);
        setBlockedDates(availRes.data.blockedDates || []);
      } catch {
        alert("Failed to load doctor info");
      }
    };
    load();
  }, [id]);

  // Load slots when date selected
  useEffect(() => {
    if (!selectedDate) return;
    setLoadingSlots(true);
    setSelectedSlot("");
    setSlots([]);
    API.get(`/availability/${id}/slots/${selectedDate}`)
      .then((res) => {
        setSlots(res.data.availableSlots || []);
        setFullyBlocked(res.data.fullyBlocked || false);
      })
      .catch(() => setSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [selectedDate, id]);

  // Calendar helpers
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay();
  const toDateStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isPast = (y, m, d) => new Date(y, m, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
    setSelectedDate(null);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
    setSelectedDate(null);
  };

  // ── Book with payment
  const handleBook = async () => {
    if (!selectedDate) return alert("Please select a date");
    if (!selectedSlot) return alert("Please select a time slot");
    setBooking(true);
    try {
      if (doctor?.fees && doctor.fees > 0) {
        await bookWithPayment();
      } else {
        await bookDirectly();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
      setBooking(false);
    }
  };

  const bookDirectly = async () => {
    await API.post("/appointment/book", {
      doctorId: id, date: selectedDate, time: selectedSlot,
      symptoms: symptoms || "General checkup", paid: false, amount: 0,
    });
    alert("✅ Appointment booked!");
    navigate("/my");
  };

  const loadRazorpay = () => new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const bookWithPayment = async () => {
    const loaded = await loadRazorpay();
    if (!loaded) { alert("Failed to load payment gateway."); setBooking(false); return; }

    const orderRes = await API.post("/payment/create-order", { amount: doctor.fees, doctorName: doctor.name });
    const { orderId, amount, currency, keyId } = orderRes.data;

    const options = {
      key: keyId, amount, currency,
      name: "DocMeet",
      description: `Appointment with Dr. ${doctor.name}`,
      order_id: orderId,
      prefill: { name: user.name, email: user.email },
      theme: { color: "#2563eb" },
      handler: async (response) => {
        try {
          await API.post("/payment/verify", {
            razorpay_order_id:   response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature:  response.razorpay_signature,
          });
          await API.post("/appointment/book", {
            doctorId: id, date: selectedDate, time: selectedSlot,
            symptoms: symptoms || "General checkup",
            paymentId: response.razorpay_payment_id, paid: true, amount: doctor.fees,
          });
          alert("✅ Payment successful! Appointment confirmed.");
          navigate("/my");
        } catch { alert("Payment done but booking failed. Contact support."); setBooking(false); }
      },
      modal: { ondismiss: () => { alert("Payment cancelled."); setBooking(false); } },
    };
    new window.Razorpay(options).open();
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  const formatSelected = (d) => d
    ? new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    : "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">

        <button onClick={() => navigate("/doctors")}
          className="text-blue-600 hover:underline text-sm mb-6 flex items-center gap-1">
          ← Back to Doctors
        </button>

        {/* Doctor info */}
        {doctor && (
          <div className="bg-white rounded-2xl shadow p-5 mb-6 flex items-center gap-4">
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
            {doctor.fees > 0 && (
              <div className="text-right">
                <p className="text-xl font-extrabold text-green-600">₹{doctor.fees}</p>
                <p className="text-xs text-gray-400">Consultation</p>
              </div>
            )}
          </div>
        )}

        {/* ── VISUAL CALENDAR ── */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-5">
            <button onClick={prevMonth}
              className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold flex items-center justify-center transition">‹</button>
            <h3 className="text-lg font-bold text-gray-800">{MONTHS[month]} {year}</h3>
            <button onClick={nextMonth}
              className="w-9 h-9 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold flex items-center justify-center transition">›</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array(firstDay).fill(null).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
              const dateStr = toDateStr(year, month, day);
              const past = isPast(year, month, day);
              const isBlocked = blockedDates.includes(dateStr);
              const isSelected = selectedDate === dateStr;
              const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());
              const disabled = past || isBlocked;

              return (
                <button key={day}
                  onClick={() => { if (!disabled) setSelectedDate(dateStr === selectedDate ? null : dateStr); }}
                  disabled={disabled}
                  title={isBlocked ? "Doctor unavailable" : past ? "Past date" : ""}
                  className={`
                    relative aspect-square rounded-xl text-sm font-semibold flex items-center justify-center transition
                    ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
                    ${past ? "text-gray-200" : ""}
                    ${isBlocked && !past ? "bg-red-50 text-red-300 line-through" : ""}
                    ${isSelected ? "bg-blue-600 text-white shadow-lg scale-105" : ""}
                    ${isToday && !isSelected && !isBlocked ? "border-2 border-blue-400 text-blue-600 font-extrabold" : ""}
                    ${!disabled && !isSelected ? "hover:bg-blue-50 hover:text-blue-700" : ""}
                    ${!disabled && !isBlocked && !isSelected && !isToday ? "text-gray-700" : ""}
                  `}
                >
                  {day}
                  {isBlocked && !past && (
                    <span className="absolute top-0.5 right-0.5 text-[8px]">🚫</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-400">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-600 rounded"></span> Selected</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 border-2 border-blue-400 rounded"></span> Today</span>
            <span className="flex items-center gap-1"><span className="text-[10px]">🚫</span> Unavailable</span>
          </div>
        </div>

        {/* Selected date display */}
        {selectedDate && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl px-5 py-3 mb-4 text-blue-700 text-sm font-semibold">
            📅 {formatSelected(selectedDate)}
          </div>
        )}

        {/* ── TIME SLOTS ── */}
        {selectedDate && (
          <div className="bg-white rounded-2xl shadow p-5 mb-4">
            <h3 className="text-sm font-bold text-gray-600 mb-3">🕐 Available Time Slots</h3>
            {loadingSlots ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-blue-500"></div>
              </div>
            ) : fullyBlocked ? (
              <div className="text-center py-4">
                <p className="text-4xl mb-2">🚫</p>
                <p className="text-red-500 font-semibold text-sm">Doctor is unavailable on this day</p>
                <p className="text-gray-400 text-xs mt-1">Please select a different date</p>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-4xl mb-2">📭</p>
                <p className="text-gray-500 font-semibold text-sm">No slots available for this date</p>
                <p className="text-gray-400 text-xs mt-1">All slots are booked — try another date</p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                      selectedSlot === slot
                        ? "bg-blue-600 text-white shadow-md scale-105"
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
        <div className="bg-white rounded-2xl shadow p-5 mb-6">
          <h3 className="text-sm font-bold text-gray-600 mb-2">📝 Symptoms (optional)</h3>
          <textarea placeholder="Describe your symptoms or reason for visit..."
            value={symptoms} onChange={(e) => setSymptoms(e.target.value)}
            rows={3} className="border border-gray-200 rounded-xl p-3 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none" />
        </div>

        {/* Payment summary */}
        {doctor?.fees > 0 && selectedSlot && (
          <div className="bg-green-50 border border-green-200 rounded-2xl p-4 mb-4">
            <p className="text-sm font-semibold text-green-700 mb-2">💳 Payment Summary</p>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Consultation fee</span><span className="font-semibold">₹{doctor.fees}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Platform fee</span><span>₹0</span>
            </div>
            <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-green-700">
              <span>Total</span><span>₹{doctor.fees}</span>
            </div>
          </div>
        )}

        {/* Book button */}
        <button onClick={handleBook} disabled={booking || !selectedDate || !selectedSlot}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-50 text-lg shadow-lg">
          {booking ? "Processing..." : doctor?.fees > 0
            ? `💳 Pay ₹${doctor.fees} & Confirm`
            : `✅ Confirm Booking${selectedSlot ? ` at ${selectedSlot}` : ""}`
          }
        </button>

        <p className="text-center text-xs text-gray-400 mt-3">
          {doctor?.fees > 0 ? "Secured by Razorpay • UPI, Cards, Net Banking" : "Free consultation"}
        </p>
      </div>
    </div>
  );
}