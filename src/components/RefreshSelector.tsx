"use client";

import { useState } from "react";
import { RotateCcw, ChevronDown } from "lucide-react";

const intervals = [
  { label: "Off", value: 0 },
  { label: "5s", value: 5 },
  { label: "10s", value: 10 },
  { label: "30s", value: 30 },
  { label: "1m", value: 60 },
  { label: "5m", value: 300 },
  { label: "15m", value: 900 },
  { label: "1h", value: 3600 },
];

export default function RefreshControl({ onRefresh, onIntervalChange }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selected, setSelected] = useState(intervals[1]); // Default: 5s

  return (
    <div className="flex items-center gap-2">
      <button
        className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-100"
        onClick={() => onRefresh()}
      >
        <RotateCcw size={16} />
        <span>Refresh</span>
      </button>

      <div className="relative">
        <button
          className="flex items-center gap-1 px-3 py-1 border rounded hover:bg-gray-100"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <span>{selected.label}</span>
          <ChevronDown size={16} />
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-1 bg-white border rounded shadow text-sm z-50 w-28">
            {intervals.map((item, idx) => (
              <div
                key={idx}
                className={`px-3 py-1 hover:bg-gray-100 cursor-pointer ${
                  selected.value === item.value ? "text-blue-600 font-medium" : ""
                }`}
                onClick={() => {
                  setSelected(item);
                  setShowDropdown(false);
                  onIntervalChange(item.value);
                }}
              >
                {item.label}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
