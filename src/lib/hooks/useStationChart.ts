import { useEffect, useState } from "react";
import type { Dataset } from "@/lib/types/chartType";
import * as d3 from "d3";
import { point } from "leaflet";

export interface Parameter {
  id: number;
  name: string;
  parameterGroup?: string;
}

function parseRelativeTimeString(relativeStr: string): Date {
  const now = new Date();
  if (relativeStr === "now") return now;

  const match = relativeStr.match(/^now-(\d+)([smhdMy])$/);
  if (!match) return now;

  const [, amountStr, unit] = match;
  const amount = parseInt(amountStr, 10);

  switch (unit) {
    case "s": now.setSeconds(now.getSeconds() - amount); break;
    case "m": now.setMinutes(now.getMinutes() - amount); break;
    case "h": now.setHours(now.getHours() - amount); break;
    case "d": now.setDate(now.getDate() - amount); break;
    case "M": now.setMonth(now.getMonth() - amount); break;
    case "y": now.setFullYear(now.getFullYear() - amount); break;
  }

  return now;
}

export function useStationChart({
  stationId,
  parameters,
  selectedParams,
  selectedInterval,
  timeRange,
  forecastEnabled,
  timeStep,
  horizon,
  setForecastEnabled,
  setSelectedParams,
  setSelectedInterval,
  setTimeRange,
  anomalyEnabled,
  setAnomalyEnabled,
  localError,
  setLocalError
}: {
  stationId: number;
  parameters: Parameter[];
  selectedParams: string[];
  selectedInterval: number;
  timeRange: { from: Date | string; to: Date | string };
  forecastEnabled: boolean;
  anomalyEnabled: boolean;
  timeStep: number;
  horizon: number;
  localError: number;
  setForecastEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedParams: React.Dispatch<React.SetStateAction<string[]>>;
  setSelectedInterval: React.Dispatch<React.SetStateAction<number>>;
  setTimeRange: React.Dispatch<React.SetStateAction<{ from: Date | string; to: Date | string }>>;
  setAnomalyEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  setLocalError: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [triggerFetch, setTriggerFetch] = useState(false);

  const fetchChartData = async () => {
    if (!selectedParams.length) return;

    setIsLoading(true);
    try {
      const selected = selectedParams
        .map((name, index) => {
          const param = parameters.find((p) => p.name === name);

          return param
            ? {
                ref_id: String.fromCharCode(65 + index),
                metric_id: param.id,
                display_name: param.name,
                color: d3.schemeCategory10[index % 10],
              }
            : null;
        })
        .filter(Boolean) as {
          ref_id: string;
          metric_id: number;
          display_name: string;
          color: string;
        }[];

      const payload = {
        chart_type: "line_chart",
        time_range: {
          from: typeof timeRange.from === 'string' ? parseRelativeTimeString(timeRange.from) : timeRange.from.toISOString(),
          to: typeof timeRange.to === 'string' ? parseRelativeTimeString(timeRange.to) : timeRange.to.toISOString(),
        },
        step_seconds: 1,

        forecast: {
          enabled: forecastEnabled,
          time_step: timeStep,
          horizon: horizon,
        },
        anomaly: {
          enabled: anomalyEnabled,
          local_error_threshold: localError / 100,
        },
        series: selected.map((s) => ({
          ref_id: s.ref_id,
          target_type: 1,
          target_id: stationId,
          metric_id: s.metric_id,
        })),
      };

      const res = await fetch("/api/dashboard/metric_series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      const results = result.results || [];

      const final: Dataset[] = selected.map((s) => {
        const found = results.find((r: any) => r.refId === s.ref_id);
        return {
          label: s.display_name,
          color: s.color,
          actual:
            found?.series?.map((d: any) => ({
              datetime: new Date(d.datetime),
              value: d.value,
              trendAnomaly: d.trendAnomaly,
              pointAnomaly: d.pointAnomaly,
              label: s.display_name,
              color: s.color,
            })) || [],
          forecast:
            found?.forecast?.map((d: any) => ({
              datetime: new Date(d.datetime),
              value: d.value,
              label: s.display_name,
              color: s.color,
            })) || [],
        };
      });

      setDatasets(final);
    } catch (err) {
      console.error("Lỗi khi fetch dữ liệu:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedParams.length && stationId) {
      fetchChartData();
    }
  }, [selectedParams, selectedInterval, timeRange, triggerFetch, stationId, forecastEnabled]);

  useEffect(() => {
    if (!selectedParams.length || selectedInterval <= 0) return;

    const interval = setInterval(() => {
      fetchChartData();
    }, selectedInterval * 1000);

    return () => clearInterval(interval);
  }, [selectedParams, selectedInterval, timeRange, stationId, forecastEnabled]);

  return {
    datasets,
    isLoading,
    selectedParams,
    setSelectedParams,
    selectedInterval,
    setSelectedInterval,
    timeRange,
    setTimeRange,
    refresh: () => setTriggerFetch((prev) => !prev),
    forecastEnabled,
    setForecastEnabled,
  };
}