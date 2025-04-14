import { create } from "zustand";

export type StationType = "Sông" | "Hồ" | "Biển" | "Nước ngầm";
export type StationStatus = "Đang hoạt động" | "Tạm dừng" | "Bảo trì";

export interface Station {
  id: number;
  name: string;
  type: StationType;
  lastUpdateTime: string;
  status: StationStatus;
  location: string;
  provider: string;
}

interface StationState {
  stations: Station[];
  selectedStations: number[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchStations: () => Promise<void>;
  addStation: (station: Omit<Station, "id">) => Promise<void>;
  updateStation: (id: number, data: Partial<Station>) => Promise<void>;
  deleteStation: (id: number) => Promise<void>;
  selectStation: (id: number) => void;
  deselectStation: (id: number) => void;
  selectAllStations: () => void;
  deselectAllStations: () => void;
  toggleSelectStation: (id: number) => void;
}

export const useStationStore = create<StationState>((set, get) => ({
  stations: [
    {
      id: 1,
      name: "Trạm Đồng Tháp",
      type: "Sông",
      lastUpdateTime: "31-12-2024 22:25:59",
      status: "Đang hoạt động",
      location: "Đồng Tháp, Việt Nam",
      provider: "Bách Khoa"
    }
  ],
  selectedStations: [],
  isLoading: false,
  error: null,

  fetchStations: async () => {
    set({ isLoading: true, error: null });
    try {
      // Trong thực tế sẽ gọi API ở đây
      // const response = await fetch("/api/stations");
      // const data = await response.json();
      // set({ stations: data, isLoading: false });
      
      // Mô phỏng cho demo
      setTimeout(() => {
        set({
          stations: [
            {
              id: 1,
              name: "Trạm Đồng Tháp",
              type: "Sông",
              lastUpdateTime: "31-12-2024 22:25:59",
              status: "Đang hoạt động",
              location: "Đồng Tháp, Việt Nam",
              provider: "Bách Khoa"
            },
            {
              id: 2,
              name: "Trạm Cần Thơ",
              type: "Sông",
              lastUpdateTime: "31-12-2024 21:15:30",
              status: "Đang hoạt động",
              location: "Cần Thơ, Việt Nam",
              provider: "Viện Môi Trường"
            },
            {
              id: 3,
              name: "Trạm Hồ Tây",
              type: "Hồ",
              lastUpdateTime: "31-12-2024 20:05:12",
              status: "Bảo trì",
              location: "Hà Nội, Việt Nam",
              provider: "Đại học Thủy Lợi"
            }
          ],
          isLoading: false
        });
      }, 500);
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi tải dữ liệu", 
        isLoading: false 
      });
    }
  },

  addStation: async (station) => {
    set({ isLoading: true, error: null });
    try {
      // Trong thực tế sẽ gọi API POST ở đây
      // const response = await fetch("/api/stations", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(station)
      // });
      // const newStation = await response.json();
      
      // Mô phỏng cho demo
      const { stations } = get();
      const newId = Math.max(0, ...stations.map(s => s.id)) + 1;
      const newStation = {
        ...station,
        id: newId
      };
      
      set({
        stations: [...stations, newStation],
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi thêm trạm mới", 
        isLoading: false 
      });
    }
  },

  updateStation: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      // Trong thực tế sẽ gọi API PUT ở đây
      // await fetch(`/api/stations/${id}`, {
      //   method: "PUT",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(data)
      // });
      
      // Cập nhật local
      const { stations } = get();
      const updatedStations = stations.map(station => 
        station.id === id ? { ...station, ...data } : station
      );
      
      set({
        stations: updatedStations,
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi cập nhật trạm", 
        isLoading: false 
      });
    }
  },

  deleteStation: async (id) => {
    set({ isLoading: true, error: null });
    try {
      // Trong thực tế sẽ gọi API DELETE ở đây
      // await fetch(`/api/stations/${id}`, {
      //   method: "DELETE"
      // });
      
      // Cập nhật local
      const { stations, selectedStations } = get();
      
      set({
        stations: stations.filter(station => station.id !== id),
        selectedStations: selectedStations.filter(stationId => stationId !== id),
        isLoading: false
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : "Đã xảy ra lỗi khi xóa trạm", 
        isLoading: false 
      });
    }
  },

  selectStation: (id) => {
    const { selectedStations } = get();
    if (!selectedStations.includes(id)) {
      set({ selectedStations: [...selectedStations, id] });
    }
  },

  deselectStation: (id) => {
    const { selectedStations } = get();
    set({ 
      selectedStations: selectedStations.filter(stationId => stationId !== id) 
    });
  },

  selectAllStations: () => {
    const { stations } = get();
    set({ 
      selectedStations: stations.map(station => station.id) 
    });
  },

  deselectAllStations: () => {
    set({ selectedStations: [] });
  },

  toggleSelectStation: (id) => {
    const { selectedStations } = get();
    if (selectedStations.includes(id)) {
      set({ 
        selectedStations: selectedStations.filter(stationId => stationId !== id) 
      });
    } else {
      set({ 
        selectedStations: [...selectedStations, id] 
      });
    }
  }
}));