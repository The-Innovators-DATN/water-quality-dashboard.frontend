import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Station } from "@/lib/types/stationType";

interface StationStore {
  stations: Station[];
  stationMap: Record<number, string>;
  isLoading: boolean;
  fetchStations: () => Promise<void>;
}

export const useStationStore = create<StationStore>()(
  persist(
    (set) => ({
      stations: [],
      stationMap: {},
      isLoading: false,
      fetchStations: async () => {
        set({ isLoading: true });
        try {
          const res = await fetch("/api/dashboard/stations");
          const data = await res.json();
          const stationMap: Record<number, string> = {};
          (data.stations || []).forEach((s: Station) => {
            stationMap[s.id] = s.name;
          });
          set({ stations: data.stations || [], stationMap });
        } catch (error) {
          console.error("Error loading stations:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "station-storage",
      partialize: (state) => ({ stationMap: state.stationMap }),
    }
  )
);