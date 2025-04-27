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
    options?: any;
    timeRange: {
      from: string;
      to: string;
    };
    interval: number;
    refreshToken?: number;
}
  