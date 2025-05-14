export type StationStatus = "active" | "inactive";

export interface Station {
    id: number;
    name: string;
    description: string;
    lat: number;
    long: number;
    status: StationStatus;
    stationType: string;
    country: string;
    waterBodyId: number;
    stationManager: number;
    createdAt: string;
    updatedAt: string;
  }