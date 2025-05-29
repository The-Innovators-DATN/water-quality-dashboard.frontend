"use client";

import { DashboardPanel } from "@/lib/types/dashboard";
import LineChart from "../charts/LineChart";
import { usePanelChart } from "@/lib/hooks/usePanelChart";

interface Props {
  panel: DashboardPanel;
  timeRange: { from: Date | string; to: Date | string };
  refresh: number;
  options: {
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
}

export default function ChartRenderer({ panel, timeRange, refresh, options }: Props) {
  const { data, loading } = usePanelChart(panel, timeRange, refresh, options);

  if (loading) return <p>Đang tải biểu đồ...</p>;
  if (!data.length) return <p>Không có dữ liệu biểu đồ.</p>;
  if (panel.type === "line_chart") return <LineChart datasets={data} timeRange={timeRange} />;

  return <p>Biểu đồ chưa hỗ trợ: {panel.type}</p>;
}