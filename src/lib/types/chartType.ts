export interface ChartPoint {
    timestamp: Date;
    value: number;
    anomaly: boolean;
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
  