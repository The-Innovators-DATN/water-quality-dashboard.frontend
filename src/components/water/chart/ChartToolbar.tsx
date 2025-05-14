"use client";

import { useState } from "react";
import { timeIntervals } from "@/components/water/chart/timeOptions";
import ChartTimeDropdown from "@/components/water/chart/ChartTimeDropdown";
import ChartSettingsDialog from "@/components/water/chart/ChartSettingsDialog";

interface ChartToolbarProps {
  interval: number;
  timeRange: { from: Date | string; to: Date | string };
  timeLabel: string | null;
  timeStep: number;
  horizon: number;
  onTimeStepChange: (val: number) => void;
  onHorizonChange: (val: number) => void;
  onChangeTimeLabel: (label: string | null) => void;
  onIntervalChange: (val: number) => void;
  onManualRefresh: () => void;
  onTimeRangeChange: (from: Date | string, to: Date | string) => void;
  predictionEnabled: boolean;
  onTogglePrediction: (enabled: boolean) => void;
  anomalyEnabled: boolean;
  onToggleAnomaly: (enabled: boolean) => void;
}

export default function ChartToolbar({
  interval,
  timeRange,
  timeLabel,
  timeStep,
  horizon,
  onTimeStepChange,
  onHorizonChange,
  onChangeTimeLabel,
  onIntervalChange,
  onManualRefresh,
  onTimeRangeChange,
  predictionEnabled,
  onTogglePrediction,
  anomalyEnabled,
  onToggleAnomaly,
}: ChartToolbarProps) {
  const [showPredictionDialog, setShowPredictionDialog] = useState(false);
  const [showAnomalyDialog, setShowAnomalyDialog] = useState(false);

  return (
    <div className="flex items-center gap-2 px-2 py-1 text-sm overflow-auto scrollbar-hide whitespace-nowrap">
      <ChartTimeDropdown
        value={timeRange}
        timeLabel={timeLabel}
        onApply={(from, to, label) => {
          onTimeRangeChange(from, to)
          onChangeTimeLabel(label)
        }}
      />

      <div className="flex items-center border">
        <button
          onClick={onManualRefresh}
          className="w-16 h-8 border-r px-3 py-1 hover:bg-gray-100 flex items-center gap-2"
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

      <button
        onClick={() => setShowPredictionDialog(true)}
        className={`h-8 border px-3 py-1 hover:bg-gray-100 flex items-center gap-2 ${
          predictionEnabled ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <span>Dự đoán</span>
        <div
          className={`w-3 h-3 rounded-full ${
            predictionEnabled ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </button>

      <button
        onClick={() => setShowAnomalyDialog(true)}
        className={`h-8 border px-3 py-1 hover:bg-gray-100 flex items-center gap-2 ${
          anomalyEnabled ? "bg-green-100" : "bg-red-100"
        }`}
      >
        <span>Bất thường</span>
        <div
          className={`w-3 h-3 rounded-full ${
            anomalyEnabled ? "bg-green-500" : "bg-red-500"
          }`}
        />
      </button>

      <ChartSettingsDialog
        open={showPredictionDialog}
        onClose={() => setShowPredictionDialog(false)}
        initialForecastEnabled={predictionEnabled}
        initialAnomalyEnabled={anomalyEnabled}
        initialHorizon={horizon}
        initialTimeStep={timeStep}
        onApply={({ forecastEnabled, horizon, timeStep }) => {
          onTogglePrediction(forecastEnabled!);
          onHorizonChange(horizon!);
          onTimeStepChange(timeStep!);
        }}
        mode="prediction"
      />

      <ChartSettingsDialog
        open={showAnomalyDialog}
        onClose={() => setShowAnomalyDialog(false)}
        initialForecastEnabled={predictionEnabled}
        initialAnomalyEnabled={anomalyEnabled}
        initialHorizon={horizon}
        initialTimeStep={timeStep}
        onApply={({ forecastEnabled, horizon, timeStep }) => {
          onTogglePrediction(forecastEnabled!);
          onHorizonChange(horizon!);
          onTimeStepChange(timeStep!);
        }}
        mode="anomaly"
      />
    </div>
  );
}
