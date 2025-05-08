import { useEffect, useState } from "react";
import { subHours } from "date-fns";
import { parseTimeRange } from "@/lib/utils/timeHelpers";
import type { Dataset } from "@/lib/types/chartType";
import * as d3 from "d3";

export function useStationChart(stationId: number, parameters: any[]) {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedParams, setSelectedParams] = useState<string[]>([]);
  const [selectedInterval, setSelectedInterval] = useState(0);
  const [selectedRange, setSelectedRange] = useState("now-24h");
  const [timeRange, setTimeRange] = useState<{ from: Date | string, to: Date | string }>({
    from: subHours(new Date(), 24),
    to: new Date(),
  });
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
          from: typeof timeRange.from === "string"? timeRange.from: timeRange.from.toISOString(),
          to: typeof timeRange.to === "string"? timeRange.to: timeRange.to.toISOString(),
        },
        step_seconds: selectedInterval,
        forecast: {
          enabled: true,
          time_step: 3600,
          horizon: 5,
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
              timestamp: new Date(d.datetime),
              value: d.value,
              anomaly: d.trendAnomaly,
              forecast: false,
              label: s.display_name,
              color: s.color,
            })) || [],
          forecast:
            found?.forecast?.map((d: any) => ({
              timestamp: new Date(d.datetime),
              value: d.value,
              anomaly: d.trendAnomaly,
              forecast: true,
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
  }, [selectedParams, selectedInterval, timeRange, triggerFetch, stationId]);

  useEffect(() => {
    if (!selectedParams.length || selectedInterval <= 0) return;

    const interval = setInterval(() => {
      fetchChartData();
    }, selectedInterval * 1000);

    return () => clearInterval(interval);
  }, [selectedParams, selectedInterval, timeRange, stationId]);

  useEffect(() => {
    const { from, to } = parseTimeRange(selectedRange);
    setTimeRange({ from, to });
  }, [selectedRange]);

  return {
    datasets,
    isLoading,
    selectedParams,
    setSelectedParams,
    selectedInterval,
    setSelectedInterval,
    selectedRange,
    setSelectedRange,
    timeRange,
    setTimeRange,
    refresh: () => setTriggerFetch((prev) => !prev),
  };
}