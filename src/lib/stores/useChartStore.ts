import { create } from "zustand";
import { persist } from "zustand/middleware";

// Định nghĩa kiểu dữ liệu cho TimeRange
type TimeRange = {
  from: Date;
  to: Date;
};

interface ChartStore {
  stationId: number | null;
  selectedParams: string[];
  selectedInterval: number;
  timeLabel: string | null;
  timeRange: TimeRange;
  forecastEnabled: boolean;
  anomalyEnabled: boolean;
  horizon: number;
  timeStep: number;
  setSelectedParams: (params: string[]) => void;
  setSelectedInterval: (interval: number) => void;
  setTimeLabel: (timeLabel: string | null) => void;
  setTimeRange: (range: TimeRange) => void;
  setForecastEnabled: (enabled: boolean) => void;
  setAnomalyEnabled: (enabled: boolean) => void;
  setHorizon: (h: number) => void;
  setTimeStep: (s: number) => void;
  loadStationData: () => void;
  saveStationData: () => void;
  updateStationData: (newData: any) => void;
}

// Lấy dữ liệu của trạm từ localStorage
const loadStationDataFromLocalStorage = (stationId: number) => {
  const allStationsData = localStorage.getItem('stations-data');
  if (allStationsData) {
    const stations = JSON.parse(allStationsData);
    return stations[stationId] || null;
  }
  return null;
};

export const useChartStore = create<ChartStore>()(
  persist(
    (set, get) => ({
      stationId: null, 
      selectedParams: [],
      selectedInterval: 0,
      timeLabel: "1 ngày trước",
      timeRange: { from: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), to: new Date() },
      forecastEnabled: false,
      anomalyEnabled: false,
      horizon: 5,
      timeStep: 3600,
      setSelectedParams: (params) => set({ selectedParams: params }),
      setSelectedInterval: (interval) => set({ selectedInterval: interval }),
      setTimeLabel: (timeLabel) => set({ timeLabel }),
      setTimeRange: (range) => set({ timeRange: range }),
      setForecastEnabled: (enabled) => set({ forecastEnabled: enabled }),
      setAnomalyEnabled: (enabled) => set({ anomalyEnabled: enabled }),
      setHorizon: (h) => set({ horizon: h }),
      setTimeStep: (s) => set({ timeStep: s }),

      // Lấy dữ liệu trạm từ localStorage
      loadStationData: () => {
        const stationId = get().stationId;
        const loadedData = loadStationDataFromLocalStorage(stationId!);
      
        if (loadedData) {
          const timeRange = loadedData.timeRange ? {
            from: new Date(loadedData.timeRange.from),
            to: new Date(loadedData.timeRange.to)
          } : { from: new Date(), to: new Date() };
      
          set({
            selectedParams: loadedData.selectedParams || [],
            selectedInterval: loadedData.selectedInterval || 0,
            timeLabel: loadedData.timeLabel || "1 ngày trước",
            timeRange: timeRange,
            forecastEnabled: loadedData.forecastEnabled || false,
            anomalyEnabled: loadedData.anomalyEnabled || false,
            horizon: loadedData.horizon || 5,
            timeStep: loadedData.timeStep || 3600,
          });
        } else {
          const defaultData = {
            selectedParams: [],
            selectedInterval: 0,
            timeLabel: "1 ngày trước",
            timeRange: { from: new Date(new Date().getTime() - 24 * 60 * 60 * 1000), to: new Date() },
            forecastEnabled: false,
            anomalyEnabled: false,
            horizon: 5,
            timeStep: 3600,
          };
          
          set(defaultData);
        }
      },

      // Lưu dữ liệu trạm vào localStorage
      saveStationData: () => {
        const stationId = get().stationId;
        const data = {
          selectedParams: get().selectedParams,
          selectedInterval: get().selectedInterval,
          timeLabel: get().timeLabel,
          timeRange: get().timeRange,
          forecastEnabled: get().forecastEnabled,
          anomalyEnabled: get().anomalyEnabled,
          horizon: get().horizon,
          timeStep: get().timeStep,
        };
      
        // Lấy tất cả dữ liệu trạm hiện tại từ localStorage
        const allStationsData = JSON.parse(localStorage.getItem('stations-data') || '{}');
        
        // Nếu chưa có dữ liệu cho trạm hiện tại, thêm vào
        allStationsData[stationId!] = data;
      
        // Lưu lại tất cả dữ liệu trạm vào localStorage mà không làm mất dữ liệu của các trạm khác
        localStorage.setItem('stations-data', JSON.stringify(allStationsData));
      },

      // Cập nhật dữ liệu cho trạm hiện tại
      updateStationData: (newData) => {
        const stationId = get().stationId;
      
        // Lấy tất cả dữ liệu trạm hiện tại từ localStorage
        const allStationsData = JSON.parse(localStorage.getItem('stations-data') || '{}');
        
        // Cập nhật dữ liệu cho trạm hiện tại mà không xóa dữ liệu của các trạm khác
        allStationsData[stationId!] = { ...allStationsData[stationId!], ...newData };
      
        // Lưu lại tất cả dữ liệu trạm vào localStorage
        localStorage.setItem('stations-data', JSON.stringify(allStationsData));
      },
    }),
    {
      name: "stations-data",  // Đảm bảo lưu trữ dữ liệu trạm trong localStorage
    }
  )
);