import { DashboardWidget } from "@/lib/types/dashboard";

export function syncWidgetsTime(
    widgets: DashboardWidget[],
    timeRange: { from: Date; to: Date },
    interval: number
): DashboardWidget[] {
    const fromStr = timeRange.from.toISOString();
    const toStr = timeRange.to.toISOString();
  
    return widgets.map((w) => ({
        ...w,
        timeRange: w.timeRange ?? { from: fromStr, to: toStr },
        interval: w.interval ?? interval,
    }));
}