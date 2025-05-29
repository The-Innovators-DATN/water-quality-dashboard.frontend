import { useEffect, useState, useMemo } from "react";
import type { Dataset } from "@/lib/types/chartType";
import { DashboardPanel } from "@/lib/types/dashboard";

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

type Options = {
  forecast: {
    enabled: boolean;
    time_step: number;
    horizon: number;
  };
  anomaly: {
    enabled: boolean;
    local_error_threshold: number;
  };
};

export function usePanelChart(panel: DashboardPanel, timeRange: { from: Date | string, to: Date | string }, refresh: number, options: Options) {
  const [data, setData] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchChartData = async () => {
    if (!timeRange.from || !timeRange.to) {
      console.error("Invalid time range values", { from: timeRange.from, to: timeRange.to, targets: panel.targets });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        chart_type: panel.type,
        time_range: {
          from: typeof timeRange.from === "string" ? parseRelativeTimeString(timeRange.from) : timeRange.from,
          to: typeof timeRange.to === "string" ? parseRelativeTimeString(timeRange.to) : timeRange.to,
        },
        step_seconds: 1,
        forecast: options.forecast ?? { enabled: false },
        anomaly: options.anomaly
          ? {
              ...options.anomaly,
              local_error_threshold: options.anomaly.local_error_threshold / 100,
            }
          : { enabled: false },
        series: panel.targets.map((t) => ({
          ref_id: t.refId,
          target_type: 1,
          target_id: t.target_id,
          metric_id: t.metric_id,
        })),
      };

      const res = await fetch("/api/dashboard/metric_series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      const results = result.results || [];

      const datasets: Dataset[] = panel.targets.map((t) => {
        const found = results.find((r: any) => r.refId === t.refId);
        return {
          label: t.display_name,
          color: t.color,
          actual: found?.series?.map((d: any) => ({
            datetime: new Date(d.datetime),
            value: d.value,
            trendAnomaly: d.trendAnomaly,
            pointAnomaly: d.pointAnomaly,
            forecast: false,
            label: t.display_name,
            color: t.color,
          })) || [],
          forecast: found?.forecast?.map((d: any) => ({
            datetime: new Date(d.datetime),
            value: d.value,
            trendAnomaly: d.trendAnomaly,
            pointAnomaly: d.pointAnomaly,
            forecast: true,
            label: t.display_name,
            color: t.color,
          })) || [],
        };
      });

      setData(datasets);
    } catch (err) {
      console.error("Lỗi fetch panel chart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [timeRange, refresh, options]);

  useEffect(() => {
    if (refresh <= 0) return;

    const interval = setInterval(() => {
      fetchChartData();
    }, refresh * 1000);

    return () => clearInterval(interval);
  }, [timeRange, refresh, options]);

  return { data, loading };
}
