import { v4 as uuid } from "uuid";
import * as d3 from "d3";
import type { DashboardWidget } from "@/lib/types/dashboard";

function isTargetNotNull<T>(t: T | null): t is T {
    return t !== null;
}

export function generateComparisonWidget({
  stationId,
  selectedParams,
  allParameters,
  timeRange,
  interval,
  timeLabel,
  timeStep,
  horizon,
  anomalyEnabled,
  forecastEnabled,
}: {
  stationId: number;
  selectedParams: string[];
  allParameters: { id: number; name: string }[];
  timeRange: { from: Date | string, to: Date | string };
  interval: number;
  timeLabel: string | null;
  timeStep: number;
  horizon: number;
  anomalyEnabled: boolean;
  forecastEnabled: boolean;
}): DashboardWidget {
  const targets = selectedParams
    .map((name, index) => {
    const param = allParameters.find((p) => p.name === name);
    if (!param) return null;
    return {
      refId: String.fromCharCode(65 + index),
      target_type: "station",
      target_id: stationId,
      metric_id: param.id,
      display_name: param.name,
      color: d3.schemeCategory10[index % 10],
    };
    })
    .filter(isTargetNotNull);

  console.log("targets", targets);

  return {
    id: uuid(),
    title: "Biểu đồ so sánh",
    type: "line_chart",
    gridPos: { x: 0, y: 0, w: 6, h: 4 },
    targets,
    timeRange,
    interval,
    timeLabel,
    timeStep,
    horizon,
    anomalyEnabled,
    forecastEnabled,
  };
}