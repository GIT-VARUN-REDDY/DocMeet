import React, { useState } from "react";

// Display-only star rating
export function StarDisplay({ rating, total, size = "sm" }) {
  const stars = Math.round(rating);
  const sizes = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };

  return (
    <div className="flex items-center gap-1">
      <div className={`flex ${sizes[size]}`}>
        {[1,2,3,4,5].map((s) => (
          <span key={s} className={s <= stars ? "text-yellow-400" : "text-gray-200"}>★</span>
        ))}
      </div>
      {total !== undefined && (
        <span className="text-xs text-gray-400 ml-1">
          {rating > 0 ? `${rating} (${total})` : "No reviews yet"}
        </span>
      )}
    </div>
  );
}

// Interactive star picker
export function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button
          key={s}
          type="button"
          onClick={() => onChange(s)}
          onMouseEnter={() => setHovered(s)}
          onMouseLeave={() => setHovered(0)}
          className={`text-3xl transition-transform hover:scale-110 ${
            s <= (hovered || value) ? "text-yellow-400" : "text-gray-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

export default StarDisplay;