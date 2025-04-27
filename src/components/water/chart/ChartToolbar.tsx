"use client";

import { timeIntervals } from "@/components/water/chart/timeOptions";
import ChartTimeDropdown from "@/components/water/chart/ChartTimeDropdown";

interface ChartToolbarProps {
  interval: number;
  onIntervalChange: (val: number) => void;
  onManualRefresh: () => void;
  onTimeRangeChange: (from: Date, to: Date) => void;
}

export default function ChartToolbar({
  interval,
  onIntervalChange,
  onManualRefresh,
  onTimeRangeChange,
}: ChartToolbarProps) {
  return (
    <div className="flex items-center justify-end gap-2 px-2 py-1 text-sm">
      <ChartTimeDropdown
        onApply={(from, to) => onTimeRangeChange(from, to)}
      />

      <div className="flex items-center border">
        <button
          onClick={onManualRefresh}
          className="w-24 h-8 border-r px-3 py-1 hover:bg-gray-100 flex items-center gap-2"
        >
          <span>Tải lại</span>
        </button>

        <div className="px-2">
          <select
            className="text-sm"
            value={interval}
            onChange={(e) => onIntervalChange(Number(e.target.value))}
          >
            {timeIntervals.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}