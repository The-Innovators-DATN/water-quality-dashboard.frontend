export interface DashboardWidget {
    id: string;
    title: string;
    type: "line_chart" | "box_plot" | "bar_chart";
    gridPos: {
      x: number;
      y: number;
      w: number;
      h: number;
    };
    targets: {
      refId: string;
      target_type: string;
      target_id: string | number;
      metric_id: string | number;
      display_name: string;
      color: string;
    }[];
    timeRange: { from: Date | string, to: Date | string };
    interval: number;
    refreshToken?: number;
    timeLabel: string | null;
    timeStep: number;
    horizon: number;
    anomalyEnabled: boolean;
    forecastEnabled: boolean;
}
  