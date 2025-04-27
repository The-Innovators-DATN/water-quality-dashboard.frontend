import { create } from "zustand";
import { persist } from "zustand/middleware";

// Định nghĩa kiểu dữ liệu cho từng parameter
export interface Parameter {
  id: number;
  name: string;
  parameterGroup?: string;
  unit?: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
}

// Trạng thái và các hàm hành động cho store
interface ParametersState {
  parameters: Parameter[];
  setParameters: (params: Parameter[]) => void;
  fetchAllParameters: () => Promise<void>;
}

// Store Zustand với middleware persist để lưu trữ local
export const useParametersStore = create<ParametersState>()(
  persist(
    (set) => ({
      parameters: [],

      setParameters: (params) => {
        set({ parameters: params });
      },

      fetchAllParameters: async () => {
        try {
          const response = await fetch("/api/dashboard/parameters", {
            credentials: "include",
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();

          // Giả sử API trả về { parameters: Parameter[] }
          const params: Parameter[] = data?.parameters || [];
          set({ parameters: params });
        } catch (error) {
          console.error("❌ Error fetching parameters:", error);
        }
      },
    }),
    {
      name: "parameters-store", // tên key lưu ở localStorage
    }
  )
);