import { useEffect, useState } from "react";
import { parseTimeRange } from "@/lib/utils/timeHelpers";  // Import hàm parseTimeRange
import type { Dataset } from "@/lib/types/chartType";
import { DashboardWidget } from "@/lib/types/dashboard";

export function useWidgetChart(widget: DashboardWidget) {
  const [data, setData] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(false);

  const interval = widget.interval || 300;

  // Lấy timeRange từ widget và xử lý nếu là quick time range như 'now-7d'
  const { from, to } = widget.timeRange?.from ? parseTimeRange(widget.timeRange.from) : { from: new Date(), to: new Date() };

  const isValidDate = (date: Date | null) => date && !isNaN(date.getTime());

  const fetchChartData = async () => {
    if (!from || !to || !widget.targets.length || !isValidDate(from) || !isValidDate(to)) {
      console.error("Invalid time range values");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        chart_type: widget.type,
        time_range: {
          from: from.toISOString(),
          to: to.toISOString(),
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

  // Fetch ban đầu và khi widget thay đổi
  useEffect(() => {
    fetchChartData();
  }, [
    widget.timeRange?.from,
    widget.timeRange?.to,
    widget.interval,
    widget.targets,
    widget.type,
    widget.refreshToken,
  ]);

  // Auto fetch mỗi `interval` giây
  useEffect(() => {
    const auto = setInterval(() => {
      fetchChartData();
    }, interval * 1000);

    return () => clearInterval(auto);
  }, [interval, widget.targets, widget.timeRange?.from, widget.timeRange?.to]);

  return { data, loading };
}
