import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const SYMPTOM_MAP = {
  // Cardiology
  "chest pain": "Cardiologist", "chest tightness": "Cardiologist", "palpitations": "Cardiologist",
  "shortness of breath": "Cardiologist", "irregular heartbeat": "Cardiologist", "heart": "Cardiologist",
  // Neurology
  "headache": "Neurologist", "migraine": "Neurologist", "dizziness": "Neurologist",
  "seizure": "Neurologist", "numbness": "Neurologist", "memory loss": "Neurologist",
  "confusion": "Neurologist", "tremor": "Neurologist",
  // Dermatology
  "rash": "Dermatologist", "acne": "Dermatologist", "skin": "Dermatologist",
  "itching": "Dermatologist", "eczema": "Dermatologist", "hair loss": "Dermatologist",
  "nail": "Dermatologist",
  // Orthopedic
  "joint pain": "Orthopedic", "back pain": "Orthopedic", "bone pain": "Orthopedic",
  "fracture": "Orthopedic", "swollen joint": "Orthopedic", "knee pain": "Orthopedic",
  "shoulder pain": "Orthopedic", "arthritis": "Orthopedic",
  // Pediatrics
  "child": "Pediatrician", "baby": "Pediatrician", "infant": "Pediatrician",
  "toddler": "Pediatrician", "kid": "Pediatrician",
  // Ophthalmology
  "eye pain": "Ophthalmologist", "blurred vision": "Ophthalmologist", "vision": "Ophthalmologist",
  "red eye": "Ophthalmologist", "eye": "Ophthalmologist",
  // Psychiatry
  "anxiety": "Psychiatrist", "depression": "Psychiatrist", "stress": "Psychiatrist",
  "insomnia": "Psychiatrist", "panic": "Psychiatrist", "mood": "Psychiatrist",
  "mental": "Psychiatrist",
  // General
  "fever": "General Physician", "cold": "General Physician", "cough": "General Physician",
  "fatigue": "General Physician", "weakness": "General Physician", "vomiting": "General Physician",
  "nausea": "General Physician", "diarrhea": "General Physician", "weight loss": "General Physician",
  // ENT
  "ear pain": "ENT Specialist", "hearing loss": "ENT Specialist", "sore throat": "ENT Specialist",
  "nose bleed": "ENT Specialist", "blocked nose": "ENT Specialist", "tonsil": "ENT Specialist",
  // Gynecology
  "menstrual": "Gynecologist", "pregnancy": "Gynecologist", "pelvic pain": "Gynecologist",
  "irregular period": "Gynecologist",
};

const SPECIALTY_INFO = {
  "Cardiologist":      { icon: "❤️", tip: "Avoid heavy exertion. If you have severe chest pain, call emergency services immediately." },
  "Neurologist":       { icon: "🧠", tip: "Note when symptoms started and if they come and go. Avoid driving if dizzy." },
  "Dermatologist":     { icon: "🦷", tip: "Avoid scratching. Take photos of skin changes to show your doctor." },
  "Orthopedic":        { icon: "🦴", tip: "Rest the affected area. Apply ice to reduce swelling." },
  "Pediatrician":      { icon: "👶", tip: "Monitor temperature and hydration. Bring vaccination records to the appointment." },
  "Ophthalmologist":   { icon: "👁️", tip: "Avoid rubbing your eyes. In case of sudden vision loss, seek emergency care." },
  "Psychiatrist":      { icon: "🧘", tip: "You are not alone. Mental health is just as important as physical health." },
  "General Physician": { icon: "🧬", tip: "Stay hydrated, rest well. A general check-up is a great starting point." },
  "ENT Specialist":    { icon: "👂", tip: "Avoid loud noises. Don't insert anything into your ear." },
  "Gynecologist":      { icon: "🌸", tip: "Track your cycle dates. Note any unusual discharge or pain." },
};

const QUICK_SYMPTOMS = [
  "Headache", "Fever", "Chest pain", "Back pain", "Skin rash",
  "Eye pain", "Anxiety", "Sore throat", "Joint pain", "Fatigue",
];

export default function Symptoms() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [checked, setChecked] = useState([]);
  const navigate = useNavigate();

  const analyze = (text) => {
    const lower = text.toLowerCase();
    const scores = {};

    Object.entries(SYMPTOM_MAP).forEach(([symptom, doctor]) => {
      if (lower.includes(symptom)) {
        scores[doctor] = (scores[doctor] || 0) + 1;
      }
    });

    if (Object.keys(scores).length === 0) {
      setResult({
        doctor: "General Physician",
        confidence: "Low",
        matched: [],
        message: "We couldn't identify a specific condition. A General Physician is a good starting point.",
      });
      return;
    }

    const bestDoctor = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
    const matched = Object.entries(SYMPTOM_MAP)
      .filter(([sym, doc]) => doc === bestDoctor && lower.includes(sym))
      .map(([sym]) => sym);

    setResult({
      doctor: bestDoctor,
      confidence: scores[bestDoctor] >= 3 ? "High" : scores[bestDoctor] === 2 ? "Medium" : "Low",
      matched,
      message: `Based on your symptoms, you should consult a ${bestDoctor}.`,
    });
  };

  const toggleQuick = (symptom) => {
    const updated = checked.includes(symptom)
      ? checked.filter((s) => s !== symptom)
      : [...checked, symptom];
    setChecked(updated);
    const combined = [input, ...updated].filter(Boolean).join(", ");
    if (updated.length > 0 || input) analyze(combined);
    else setResult(null);
  };

  const handleAnalyze = () => {
    const combined = [input, ...checked].filter(Boolean).join(", ");
    if (!combined.trim()) return alert("Please describe your symptoms or select from the list");
    analyze(combined);
  };

  const info = result ? SPECIALTY_INFO[result.doctor] : null;

  const confidenceColor = {
    High: "text-green-600 bg-green-50 border-green-200",
    Medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
    Low: "text-gray-500 bg-gray-50 border-gray-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 p-8">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-6xl mb-3">🩺</p>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Symptom Checker</h1>
          <p className="text-gray-400">Describe your symptoms and we'll guide you to the right specialist</p>
          <p className="text-xs text-gray-300 mt-1">⚠️ This is for guidance only — not a medical diagnosis</p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl p-8">

          {/* Quick select */}
          <p className="text-sm font-semibold text-gray-600 mb-3">Quick select symptoms:</p>
          <div className="flex flex-wrap gap-2 mb-5">
            {QUICK_SYMPTOMS.map((s) => (
              <button
                key={s}
                onClick={() => toggleQuick(s.toLowerCase())}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition border ${
                  checked.includes(s.toLowerCase())
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-gray-50 text-gray-600 border-gray-200 hover:border-teal-400"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Text input */}
          <p className="text-sm font-semibold text-gray-600 mb-2">Or describe in detail:</p>
          <textarea
            placeholder="e.g. I have a severe headache, fever since 2 days, and feel dizzy..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={4}
            className="w-full border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm resize-none mb-4"
          />

          <button
            onClick={handleAnalyze}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-xl font-semibold transition"
          >
            Analyze Symptoms →
          </button>

          {/* Result */}
          {result && info && (
            <div className="mt-6 border border-teal-100 rounded-2xl overflow-hidden">
              {/* Top */}
              <div className="bg-teal-50 p-5 text-center border-b border-teal-100">
                <p className="text-4xl mb-2">{info.icon}</p>
                <p className="text-sm text-gray-400 font-medium">Suggested Specialist</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{result.doctor}</p>
                <span className={`inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full border ${confidenceColor[result.confidence]}`}>
                  {result.confidence} Confidence
                </span>
              </div>

              {/* Details */}
              <div className="p-5 space-y-4">
                {result.matched.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Symptoms Detected</p>
                    <div className="flex flex-wrap gap-2">
                      {result.matched.map((m) => (
                        <span key={m} className="bg-red-50 text-red-500 text-xs px-3 py-1 rounded-full border border-red-100 capitalize">
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-sm text-yellow-700">
                  <p className="font-semibold mb-1">💡 What to do now</p>
                  <p>{info.tip}</p>
                </div>

                <button
                  onClick={() => navigate(`/doctors?specialty=${encodeURIComponent(result.doctor)}`)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold transition"
                >
                  Find {result.doctor}s Near You →
                </button>

                <p className="text-xs text-center text-gray-300">
                  This is not a medical diagnosis. Always consult a qualified doctor.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}