import { create } from "zustand";
import { Station } from "@/lib/types/stationType";

interface StationStore {
  stations: Station[];
  isLoading: boolean;
  fetchStations: () => Promise<void>;
}

export const useStationStore = create<StationStore>((set) => ({
  stations: [],
  isLoading: false,

  fetchStations: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/dashboard/stations");
      const data = await res.json();
      set({ stations: data.stations || [] });
    } catch (error) {
      console.error("Error loading stations:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));