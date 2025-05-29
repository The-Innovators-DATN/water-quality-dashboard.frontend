export interface ChartPoint {
    datetime: Date;
    value: number;
    trendAnomaly: boolean;
    pointAnomaly: boolean;
    forecast: boolean;
    label: string;
    color: string;
}
  
  export interface Dataset {
    label: string;
    color: string;
    actual: ChartPoint[];
    forecast: ChartPoint[];
}
  