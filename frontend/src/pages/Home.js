import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const SPECIALTIES = [
  { icon: "❤️", name: "Cardiologist", desc: "Heart & blood vessels" },
  { icon: "🧠", name: "Neurologist", desc: "Brain & nervous system" },
  { icon: "🦷", name: "Dermatologist", desc: "Skin, hair & nails" },
  { icon: "🦴", name: "Orthopedic", desc: "Bones & joints" },
  { icon: "👶", name: "Pediatrician", desc: "Children's health" },
  { icon: "👁️", name: "Ophthalmologist", desc: "Eyes & vision" },
  { icon: "🧬", name: "General Physician", desc: "Overall health" },
  { icon: "🧘", name: "Psychiatrist", desc: "Mental health" },
];

const STATS = [
  { value: "500+", label: "Verified Doctors" },
  { value: "10K+", label: "Happy Patients" },
  { value: "50+", label: "Specializations" },
  { value: "24/7", label: "Support" },
];

const HOW_IT_WORKS = [
  { step: "01", icon: "🔍", title: "Find a Doctor", desc: "Search by specialty, hospital, city or symptom." },
  { step: "02", icon: "📅", title: "Book a Slot", desc: "Pick a date and time from available schedule." },
  { step: "03", icon: "✅", title: "Get Confirmed", desc: "Receive instant email confirmation." },
];

const FEATURES = [
  { icon: "🩺", title: "Symptom Checker", desc: "Describe your symptoms and get guided to the right specialist.", action: "Check Symptoms", path: "/symptoms" },
  { icon: "📋", title: "Book Appointment", desc: "Browse doctors by specialty, hospital, or city and book instantly.", action: "Find Doctors", path: "/doctors" },
  { icon: "📊", title: "My Appointments", desc: "View all your confirmed bookings and manage them in one place.", action: "View Appointments", path: "/my" },
];

const TESTIMONIALS = [
  { name: "Priya S.", text: "Found a great cardiologist within minutes. The booking was seamless!", rating: 5 },
  { name: "Rahul M.", text: "The symptom checker helped me figure out I needed a neurologist. Brilliant!", rating: 5 },
  { name: "Ananya K.", text: "Got my appointment confirmed instantly with an email. Very professional.", rating: 5 },
];

export default function Home() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial((p) => (p + 1) % TESTIMONIALS.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div className="min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white overflow-hidden">
        <div className="absolute top-[-80px] right-[-80px] w-96 h-96 bg-blue-400 opacity-20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-60px] left-[-60px] w-72 h-72 bg-blue-300 opacity-20 rounded-full blur-2xl" />

        <div className="relative max-w-6xl mx-auto px-8 py-20 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 text-center md:text-left">
            {token && (
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur px-4 py-2 rounded-full text-sm font-medium mb-6">
                👋 Welcome back, {user.name?.split(" ")[0]}!
              </div>
            )}
            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
              Your Health,<br />
              <span className="text-yellow-300">Our Priority</span>
            </h1>
            <p className="text-blue-100 text-lg mb-8 max-w-md">
              Book appointments with top-rated doctors, check your symptoms, and manage your health — all in one place.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mb-5">
              <input
                type="text"
                placeholder="Search doctors, specialties, hospitals, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-5 py-3.5 rounded-xl text-gray-800 text-sm focus:outline-none shadow-lg"
              />
              <button type="submit" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-6 py-3.5 rounded-xl transition shadow-lg whitespace-nowrap">
                Search
              </button>
            </form>

            <div className="flex flex-wrap gap-3">
              <button onClick={() => navigate("/doctors")} className="bg-white text-blue-700 font-semibold px-6 py-3 rounded-xl hover:bg-blue-50 transition shadow">
                📋 Book Appointment
              </button>
              <button onClick={() => navigate("/symptoms")} className="bg-white/20 backdrop-blur border border-white/30 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/30 transition">
                🩺 Check Symptoms
              </button>
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 bg-white/10 backdrop-blur rounded-3xl flex items-center justify-center text-8xl shadow-2xl border border-white/20">
                🏥
              </div>
              <div className="absolute -top-4 -left-8 bg-white text-gray-800 px-4 py-2 rounded-xl shadow-xl text-sm font-semibold animate-bounce">
                ✅ Appointment Confirmed!
              </div>
              <div className="absolute -bottom-4 -right-6 bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl shadow-xl text-sm font-semibold">
                500+ Doctors Online
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="bg-blue-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-extrabold text-yellow-300">{s.value}</p>
              <p className="text-blue-200 text-sm mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Everything You Need</h2>
            <p className="text-gray-400 max-w-md mx-auto">From finding the right doctor to understanding your symptoms.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 p-7 flex flex-col">
                <div className="text-5xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm flex-1 mb-5">{f.desc}</p>
                <button
                  onClick={() => navigate(f.path === "/my" && !token ? "/login" : f.path)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition text-sm"
                >
                  {f.action} →
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SPECIALTIES ── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">Browse by Specialty</h2>
            <p className="text-gray-400">Find the right specialist for your needs</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SPECIALTIES.map((s) => (
              <button
                key={s.name}
                onClick={() => navigate(`/doctors?specialty=${encodeURIComponent(s.name)}`)}
                className="bg-blue-50 hover:bg-blue-100 border border-blue-100 hover:border-blue-300 rounded-2xl p-5 text-center transition-all group"
              >
                <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{s.icon}</div>
                <p className="font-semibold text-gray-800 text-sm">{s.name}</p>
                <p className="text-gray-400 text-xs mt-0.5">{s.desc}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 bg-gradient-to-br from-blue-50 to-blue-100">
        <div className="max-w-5xl mx-auto px-8">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-3">How It Works</h2>
            <p className="text-gray-400">Book your appointment in 3 simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((h, i) => (
              <div key={h.step} className="relative text-center">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 bg-blue-200 z-0" />
                )}
                <div className="relative z-10 w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4 shadow-lg">
                  {h.icon}
                </div>
                <span className="text-xs font-bold text-blue-400 tracking-widest">{h.step}</span>
                <h3 className="text-lg font-bold text-gray-900 mt-1 mb-2">{h.title}</h3>
                <p className="text-gray-400 text-sm">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SYMPTOM PROMO ── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-8">
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-3xl p-10 flex flex-col md:flex-row items-center gap-8 text-white shadow-xl">
            <div className="text-8xl">🩺</div>
            <div className="flex-1">
              <h2 className="text-3xl font-extrabold mb-2">Not Sure What's Wrong?</h2>
              <p className="text-teal-100 mb-5">Use our symptom checker to understand your condition and get directed to the right specialist before you book.</p>
              <button onClick={() => navigate("/symptoms")} className="bg-white text-teal-600 font-bold px-8 py-3 rounded-xl hover:bg-teal-50 transition shadow-md">
                Check My Symptoms →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-12">What Patients Say</h2>
          <div className="bg-white rounded-3xl shadow-lg p-10 flex flex-col justify-center min-h-[180px]">
            <p className="text-gray-600 text-lg italic mb-6">"{TESTIMONIALS[activeTestimonial].text}"</p>
            <div className="flex items-center justify-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                {TESTIMONIALS[activeTestimonial].name[0]}
              </div>
              <div className="text-left">
                <p className="font-semibold text-gray-800 text-sm">{TESTIMONIALS[activeTestimonial].name}</p>
                <p className="text-yellow-400 text-xs">{"★".repeat(TESTIMONIALS[activeTestimonial].rating)}</p>
              </div>
            </div>
            <div className="flex justify-center gap-2 mt-6">
              {TESTIMONIALS.map((_, i) => (
                <button key={i} onClick={() => setActiveTestimonial(i)} className={`w-2.5 h-2.5 rounded-full transition ${i === activeTestimonial ? "bg-blue-600" : "bg-gray-200"}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      {!token && (
        <section className="py-20 bg-blue-700 text-white text-center">
          <div className="max-w-2xl mx-auto px-8">
            <h2 className="text-4xl font-extrabold mb-4">Ready to Take Control of Your Health?</h2>
            <p className="text-blue-200 mb-8">Join thousands of patients who trust DocMeet for their healthcare needs.</p>
            <div className="flex gap-4 justify-center">
              <button onClick={() => navigate("/register")} className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold px-8 py-3.5 rounded-xl transition shadow-lg">
                Get Started Free
              </button>
              <button onClick={() => navigate("/login")} className="bg-white/20 border border-white/30 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/30 transition">
                Login
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 text-gray-400 py-10 text-center text-sm">
        <p className="text-white font-bold text-lg mb-2">🩺 DocMeet</p>
        <p>Your trusted healthcare booking platform</p>
        <p className="mt-4">© 2026 DocMeet. All rights reserved.</p>
      </footer>
    </div>
  );
}