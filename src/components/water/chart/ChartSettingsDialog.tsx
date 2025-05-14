"use client";

import { Dialog } from "@headlessui/react";
import { useState, useEffect } from "react";
import { Switch } from "@headlessui/react";

interface ChartSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  initialForecastEnabled: boolean;
  initialAnomalyEnabled: boolean;
  initialHorizon: number;
  initialTimeStep: number;
  mode: "prediction" | "anomaly";
  onApply: (settings: {
    forecastEnabled?: boolean;
    anomalyEnabled?: boolean;
    horizon?: number;
    timeStep?: number;
  }) => void;
}

export default function ChartSettingsDialog({
  open,
  onClose,
  initialForecastEnabled,
  initialAnomalyEnabled,
  initialHorizon,
  initialTimeStep,
  mode,
  onApply,
}: ChartSettingsDialogProps) {
  const [forecastEnabled, setForecastEnabled] = useState(initialForecastEnabled);
  const [anomalyEnabled, setAnomalyEnabled] = useState(initialAnomalyEnabled);
  const [horizon, setHorizon] = useState(initialHorizon);
  const [timeStep, setTimeStep] = useState(initialTimeStep);

  useEffect(() => {
    setForecastEnabled(initialForecastEnabled);
    setAnomalyEnabled(initialAnomalyEnabled);
    setHorizon(initialHorizon);
    setTimeStep(initialTimeStep);
  }, [open]);

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="w-full max-w-lg rounded bg-white p-6 space-y-4 shadow-xl text-sm">
          <Dialog.Title className="text-lg font-semibold">
            {mode === "prediction" ? "Cấu hình dự đoán" : "Cấu hình phát hiện bất thường"}
          </Dialog.Title>

          <div className="grid grid-cols-2 gap-4">
            {mode === "prediction" && (
              <>
                <div className="col-span-2 flex justify-between items-center">
                  <span>Bật dự đoán</span>
                  <Switch
                    checked={forecastEnabled}
                    onChange={setForecastEnabled}
                    className={`${
                      forecastEnabled ? "bg-green-500" : "bg-red-500"
                    } relative inline-flex h-6 w-12 items-center rounded-full transition-colors`}
                  >
                    <span
                      className={`${
                        forecastEnabled ? "translate-x-6" : "translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                    />
                  </Switch>
                </div>

                {forecastEnabled && (
                  <>
                    <div>
                      <label className="block font-medium">Dự đoán trong bao lâu (giờ)</label>
                      <input
                        type="number"
                        className="w-full border px-2 py-1 rounded"
                        value={horizon}
                        onChange={(e) => setHorizon(Number(e.target.value))}
                      />
                    </div>

                    <div>
                      <label className="block font-medium">Khoảng thời gian dự đoán (giây)</label>
                      <input
                        type="number"
                        className="w-full border px-2 py-1 rounded"
                        value={timeStep}
                        onChange={(e) => setTimeStep(Number(e.target.value))}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            {mode === "anomaly" && (
              <div className="col-span-2 flex justify-between items-center">
                <span>Bật phát hiện bất thường</span>
                <Switch
                  checked={anomalyEnabled}
                  onChange={setAnomalyEnabled}
                  className={`${
                    anomalyEnabled ? "bg-green-500" : "bg-red-500"
                  } relative inline-flex h-6 w-12 items-center rounded-full transition-colors`}
                >
                  <span
                    className={`${
                      anomalyEnabled ? "translate-x-6" : "translate-x-1"
                    } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                  />
                </Switch>
              </div>
            )}
          </div>

          <div className="text-right pt-4">
            <button
              className="mr-2 px-4 py-2 border rounded hover:bg-gray-100"
              onClick={onClose}
            >
              Hủy
            </button>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                if (mode === "prediction") {
                  onApply({
                    forecastEnabled,
                    horizon,
                    timeStep,
                  });
                } else {
                  onApply({
                    anomalyEnabled,
                  });
                }
                onClose();
              }}
            >
              Áp dụng
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
