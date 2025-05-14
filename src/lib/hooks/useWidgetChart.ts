import { useEffect, useState, useMemo } from "react";
import type { Dataset } from "@/lib/types/chartType";
import { DashboardWidget } from "@/lib/types/dashboard";

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

export function useWidgetChart(widget: DashboardWidget) {
  const [data, setData] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);

  const interval = widget.interval || 0;

  const { from, to } = widget.timeRange;

  const fetchChartData = async () => {
    if (!from || !to) {
      console.error("Invalid time range values", { from, to, targets: widget.targets });
      return;
    }

    setLoading(true);
    try {
      const payload = {
        chart_type: widget.type,
        time_range: {
          from: typeof from === "string"? parseRelativeTimeString(from): from.toISOString(),
          to: typeof to === "string"? parseRelativeTimeString(to): to.toISOString(),
        },
        step_seconds: interval,
        forecast: widget.options?.forecast ?? { enabled: false },
        series: widget.targets.map((t) => ({
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

      const datasets: Dataset[] = widget.targets.map((t) => {
        const found = results.find((r: any) => r.refId === t.refId);
        return {
          label: t.display_name,
          color: t.color,
          actual: found?.series?.map((d: any) => ({
            timestamp: new Date(d.datetime),
            value: d.value,
            anomaly: d.trendAnomaly,
            forecast: false,
            label: t.display_name,
            color: t.color,
          })) || [],
          forecast: found?.forecast?.map((d: any) => ({
            timestamp: new Date(d.datetime),
            value: d.value,
            anomaly: d.trendAnomaly,
            forecast: true,
            label: t.display_name,
            color: t.color,
          })) || [],
        };
      });

      setData(datasets);
    } catch (err) {
      console.error("Lỗi fetch widget chart:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChartData();
  }, [
    from,
    to,
    interval,
    widget.type,
    widget.targets,
  ]);

  useEffect(() => {
    if (interval <= 0) return;

    const auto = setInterval(() => {
      fetchChartData();
    }, interval * 1000);

    return () => clearInterval(auto);
  }, [
    from,
    to,
    interval,
    widget.type,
    widget.targets,
  ]);

  return { data, loading };
}
