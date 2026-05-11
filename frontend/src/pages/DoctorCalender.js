import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function DoctorCalendar() {
  const navigate = useNavigate();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [blockedDates, setBlockedDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [doctorSlots, setDoctorSlots] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [slotBlockMap, setSlotBlockMap] = useState({}); // date -> [times]
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [bookedCounts, setBookedCounts] = useState({}); // date -> count

  // Load doctor's slots and availability
  useEffect(() => {
    const loadData = async () => {
      try {
        const [profileRes, availRes] = await Promise.all([
          API.get("/doctor/me/profile"),
          API.get("/availability/me/settings"),
        ]);
        const doc = profileRes.data?.doctor || profileRes.data;
        setDoctorSlots(doc.slots || []);
        setBlockedDates(availRes.data.blockedDates || []);
        setBlockedSlots(availRes.data.blockedSlots || []);

        // Build slot block map
        const map = {};
        (availRes.data.blockedSlots || []).forEach(({ date, time }) => {
          if (!map[date]) map[date] = [];
          map[date].push(time);
        });
        setSlotBlockMap(map);
      } catch (e) {
        console.error("Failed to load data", e);
      }
    };
    loadData();
  }, []);

  // Load booked appointment counts for visible month
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const res = await API.get("/appointment/doctor-bookings");
        const counts = {};
        res.data.forEach((a) => {
          if (a.date) counts[a.date] = (counts[a.date] || 0) + 1;
        });
        setBookedCounts(counts);
      } catch (e) {}
    };
    loadBookings();
  }, []);

  // Calendar helpers
  const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
  const getFirstDay = (y, m) => new Date(y, m, 1).getDay();
  const toDateStr = (y, m, d) => `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const isPast = (y, m, d) => new Date(y, m, d) < new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const prevMonth = () => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); setSelectedDate(null); };
  const nextMonth = () => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); setSelectedDate(null); };

  const toggleDate = (dateStr) => {
    if (isPast(year, month, parseInt(dateStr.split("-")[2]))) return;
    setBlockedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const toggleSlot = (time) => {
    if (!selectedDate) return;
    const current = slotBlockMap[selectedDate] || [];
    const updated = current.includes(time)
      ? current.filter((t) => t !== time)
      : [...current, time];
    setSlotBlockMap((prev) => ({ ...prev, [selectedDate]: updated }));
  };

  const saveAvailability = async () => {
    setSaving(true);
    setSuccess("");
    try {
      // Save blocked dates
      await API.put("/availability/block-dates", { blockedDates });

      // Save blocked slots for each date that has slot blocks
      for (const [date, slots] of Object.entries(slotBlockMap)) {
        await API.put("/availability/block-slots", { date, slots });
      }

      setSuccess("✅ Availability saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDay(year, month);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-teal-700">📅 Availability Calendar</h1>
            <p className="text-gray-400 text-sm mt-1">Block dates or specific slots for holidays and leave</p>
          </div>
          <button onClick={() => navigate("/dashboard")} className="text-teal-600 hover:underline text-sm font-semibold">
            ← Dashboard
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl mb-6 text-sm">{success}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── CALENDAR ── */}
          <div className="lg:col-span-2 bg-white rounded-3xl shadow-lg p-6">
            {/* Month navigation */}
            <div className="flex items-center justify-between mb-6">
              <button onClick={prevMonth} className="w-9 h-9 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-600 font-bold flex items-center justify-center transition">‹</button>
              <h2 className="text-xl font-bold text-gray-800">{MONTHS[month]} {year}</h2>
              <button onClick={nextMonth} className="w-9 h-9 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-600 font-bold flex items-center justify-center transition">›</button>
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
                const bookings = bookedCounts[dateStr] || 0;
                const hasPartialBlock = (slotBlockMap[dateStr]?.length || 0) > 0;
                const isToday = dateStr === toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

                return (
                  <button
                    key={day}
                    onClick={() => {
                      if (past) return;
                      setSelectedDate(dateStr === selectedDate ? null : dateStr);
                    }}
                    disabled={past}
                    className={`
                      relative aspect-square rounded-xl text-sm font-semibold flex flex-col items-center justify-center transition
                      ${past ? "text-gray-200 cursor-not-allowed" : "cursor-pointer"}
                      ${isBlocked && !past ? "bg-red-100 text-red-600 line-through" : ""}
                      ${isSelected ? "ring-2 ring-teal-500 bg-teal-50" : ""}
                      ${isToday && !isBlocked ? "border-2 border-teal-400 text-teal-700" : ""}
                      ${!isBlocked && !isSelected && !past ? "hover:bg-gray-50" : ""}
                    `}
                  >
                    <span>{day}</span>
                    {/* Booking dot */}
                    {bookings > 0 && !past && (
                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-400 rounded-full" />
                    )}
                    {/* Partial block indicator */}
                    {hasPartialBlock && !isBlocked && !past && (
                      <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-orange-400 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mt-5 pt-4 border-t border-gray-100 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-100 rounded border border-red-200"></span> Fully blocked</span>
              <span className="flex items-center gap-1.5"><span className="w-3 h-3 border-2 border-teal-400 rounded"></span> Today</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-400 rounded-full"></span> Has bookings</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-orange-400 rounded-full"></span> Partially blocked</span>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="space-y-4">

            {/* Selected date actions */}
            {selectedDate ? (
              <div className="bg-white rounded-3xl shadow-lg p-5">
                <h3 className="font-bold text-gray-800 mb-1">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                </h3>
                <p className="text-gray-400 text-xs mb-4">Manage this date</p>

                {/* Block entire day */}
                <button
                  onClick={() => toggleDate(selectedDate)}
                  className={`w-full py-2.5 rounded-xl font-semibold text-sm transition mb-4 ${
                    blockedDates.includes(selectedDate)
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-red-100 text-red-600 hover:bg-red-200"
                  }`}
                >
                  {blockedDates.includes(selectedDate) ? "✅ Unblock This Day" : "🚫 Block Entire Day"}
                </button>

                {/* Block individual slots */}
                {!blockedDates.includes(selectedDate) && (
                  <>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Block Specific Slots</p>
                    <div className="grid grid-cols-2 gap-2">
                      {doctorSlots.map((slot) => {
                        const isSlotBlocked = (slotBlockMap[selectedDate] || []).includes(slot);
                        const isBooked = false; // could check appointments too
                        return (
                          <button key={slot} onClick={() => toggleSlot(slot)}
                            className={`py-2 rounded-xl text-xs font-semibold transition ${
                              isSlotBlocked
                                ? "bg-red-100 text-red-600 line-through"
                                : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* Bookings on this day */}
                {(bookedCounts[selectedDate] || 0) > 0 && (
                  <div className="mt-4 bg-blue-50 rounded-xl p-3 text-sm text-blue-700">
                    📋 {bookedCounts[selectedDate]} appointment{bookedCounts[selectedDate] > 1 ? "s" : ""} booked on this day
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl shadow-lg p-5 text-center text-gray-400">
                <p className="text-3xl mb-2">👆</p>
                <p className="text-sm font-medium">Click a date to manage it</p>
                <p className="text-xs mt-1">Block entire days or specific time slots</p>
              </div>
            )}

            {/* Summary */}
            <div className="bg-white rounded-3xl shadow-lg p-5">
              <h3 className="font-bold text-gray-800 mb-3">📊 Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Blocked days</span>
                  <span className="font-bold text-red-600">{blockedDates.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Partial blocks</span>
                  <span className="font-bold text-orange-500">{Object.keys(slotBlockMap).filter(d => slotBlockMap[d]?.length > 0).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Total bookings</span>
                  <span className="font-bold text-blue-600">{Object.values(bookedCounts).reduce((a, b) => a + b, 0)}</span>
                </div>
              </div>
            </div>

            {/* Save button */}
            <button onClick={saveAvailability} disabled={saving}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl transition disabled:opacity-60 shadow-lg text-lg">
              {saving ? "Saving..." : "💾 Save Availability"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}