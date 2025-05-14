export interface TimeRangeOption {
    label: string;
    from: string;
    to: string;
}

export interface TimeIntervalOption {
    label: string;
    value: number;
}
  
export const timeRanges: TimeRangeOption[] = [
    { label: "5 phút trước", from: "now-5m", to: "now" },
    { label: "15 phút trước", from: "now-15m", to: "now" },
    { label: "30 phút trước", from: "now-30m", to: "now" },
    { label: "1 giờ trước", from: "now-1h", to: "now" },
    { label: "3 giờ trước", from: "now-3h", to: "now" },
    { label: "6 giờ trước", from: "now-6h", to: "now" },
    { label: "12 giờ trước", from: "now-12h", to: "now" },
    { label: "1 ngày trước", from: "now-1d", to: "now" },
    { label: "2 ngày trước", from: "now-2d", to: "now" },
    { label: "7 ngày trước", from: "now-7d", to: "now" },
    { label: "30 ngày trước", from: "now-30d", to: "now" },
    { label: "90 ngày trước", from: "now-90d", to: "now" },
    { label: "6 tháng trước", from: "now-6M", to: "now" },
    { label: "1 năm trước", from: "now-1y", to: "now" },
    { label: "2 năm trước", from: "now-2y", to: "now" },
    { label: "5 năm trước", from: "now-5y", to: "now" },
];
  
export const timeIntervals: TimeIntervalOption[] = [
    { label: "Tắt", value: 0 },
    { label: "5 giây", value: 5 },
    { label: "10 giây", value: 10 },
    { label: "30 giây", value: 30 },
    { label: "1 phút", value: 60 },
    { label: "5 phút", value: 300 },
    { label: "15 phút", value: 900 },
    { label: "30 phút", value: 1800 },
    { label: "1 giờ", value: 3600 },
    { label: "2 giờ", value: 7200 },
    { label: "1 ngày", value: 86400 },
];

export function getTimeRangeFromLabel(label: string): { from: string; to: string } {
    const timeRange = timeRanges.find(range => range.label === label);

    return { from: timeRange?.from ?? "now-1d", to: timeRange?.to ?? "now" };
}