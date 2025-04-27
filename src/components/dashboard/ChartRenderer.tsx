"use client";

import { DashboardWidget } from "@/lib/types/dashboard";
import LineChart from "../charts/LineChart";
import { useWidgetChart } from "@/lib/hooks/useWidgetChart";

interface Props {
  widget: DashboardWidget;
}

export default function ChartRenderer({ widget }: Props) {
  const { data, loading } = useWidgetChart(widget);

  if (loading) return <p>Đang tải biểu đồ...</p>;
  if (!data.length) return <p>Không có dữ liệu biểu đồ.</p>;
  if (widget.type === "line_chart") return <LineChart datasets={data} />;

  return <p>Biểu đồ chưa hỗ trợ: {widget.type}</p>;
}