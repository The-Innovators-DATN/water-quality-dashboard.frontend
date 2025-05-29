import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardPanel } from "@/lib/types/dashboard";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import { getTimeRangeFromLabel } from "@/components/water/chart/timeOptions";

interface DashboardState {
  layoutConfiguration: {
    options: {
      anomaly: {
        enabled: boolean;
        local_error_threshold: number;
      },
      forecast: {
        enabled: boolean;
        horizon: number;
        time_step: number;
      },
    },
    panels: DashboardPanel[],
    refresh: number,
    time: {
      timeRange: {
        from: Date | string;
        to: Date | string;
      },
      timeLabel: string | null;
    }
  };
  name: string;
  version: number;
  status: "active" | "inactive" | "deleted";
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;

  updateLayoutConfiguration: (key: string, value: any) => void;

  setName: (name: string) => void;
  setStatus: (status: "active" | "inactive" | "deleted") => void;
  addPanel: (panel: DashboardPanel) => void;
  updatePanel: (updated: DashboardPanel) => void;
  removePanel: (id: string) => void;
  reset: () => void;
  saveDashboard: (uid?: string) => Promise<void>;
  loadDashboard: (uid: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      layoutConfiguration: {
        options: {
          anomaly: {
            enabled: false,
            local_error_threshold: 0,
          },
          forecast: {
            enabled: false,
            horizon: 1,
            time_step: 3600,
          },
        },
        panels: [],
        refresh: 0,
        time: {
          timeRange: { from: new Date(), to: new Date() },
          timeLabel: null,
        },
      },
      name: "Bảng điều khiển mới",
      version: 1,
      status: "active",
      createdBy: useAuthStore.getState().getUserId?.(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),

      updateLayoutConfiguration: (key: string, value: any) => set((state) => {
        if (key === 'options') {
          return { layoutConfiguration: { ...state.layoutConfiguration, options: value } };
        }
        if (key === 'panels') {
          return { layoutConfiguration: { ...state.layoutConfiguration, panels: value } };
        }
        if (key === 'time') {
          return { layoutConfiguration: { ...state.layoutConfiguration, time: value } };
        }
        if (key === 'refresh') {
          return { layoutConfiguration: { ...state.layoutConfiguration, refresh: value } };
        }
        return state;
      }),

      // Set the name of the dashboard
      setName: (name: string) => set({ name }),

      // Set the status of the dashboard
      setStatus: (status: "active" | "inactive" | "deleted") => set({ status }),

      // Add a new panel
      addPanel: (panel: DashboardPanel) =>
        set((state) => ({ layoutConfiguration: { ...state.layoutConfiguration, panels: [...state.layoutConfiguration.panels, panel] } })),

      // Update an existing panel
      updatePanel: (updated: DashboardPanel) => {
        set((state) => ({
          layoutConfiguration: {
            ...state.layoutConfiguration,
            panels: state.layoutConfiguration.panels.map((panel) =>
              panel.id === updated.id ? updated : panel
            ),
          },
        }));
      },

      // Remove a panel
      removePanel: (id: string) =>
        set((state) => ({
          layoutConfiguration: {
            ...state.layoutConfiguration,
            panels: state.layoutConfiguration.panels.filter((panel) => panel.id !== id),
          },
        })),

      // Reset the dashboard state
      reset: () => {
        localStorage.removeItem("dashboard-draft");
      },

      // Save the dashboard to the backend
      saveDashboard: async (uid?: string) => {
        const currentVersion = get().version;
        const userId = useAuthStore.getState().getUserId?.();
        if (!userId) throw new Error("Không tìm thấy userId từ Auth Store");

        const nextVersion = currentVersion + 1;

        const createPayload = {
          dashboard: {
            name: get().name || "Bảng điều khiển mới",
            description: "Mô tả bảng điều khiển",
            layout_configuration: {
              time: get().layoutConfiguration.time,
              refresh: get().layoutConfiguration.refresh,
              options: get().layoutConfiguration.options,
              panels: get().layoutConfiguration.panels.map((w, idx) => ({
                id: typeof w.id === "number" ? w.id : idx + 1,
                title: w.title,
                type: w.type,
                gridPos: w.gridPos,
                targets: w.targets,
              })),
            },
            status: "active",
            created_by: userId,
          },
        };

        const updatePayload = {
          dashboard: {
            name: get().name || "Bảng điều khiển mới",
            description: "Mô tả bảng điều khiển",
            layout_configuration: {
              time: get().layoutConfiguration.time,
              refresh: get().layoutConfiguration.refresh,
              options: get().layoutConfiguration.options,
              panels: get().layoutConfiguration.panels.map((w, idx) => ({
                id: typeof w.id === "number" ? w.id : idx + 1,
                title: w.title,
                type: w.type,
                gridPos: w.gridPos,
                targets: w.targets,
              })),
            },
            status: "active",
          },
          created_by: userId,
        };

        const res = await fetch(
          uid ? `/api/dashboard/dashboards/${uid}` : "/api/dashboard/dashboards",
          {
            method: uid ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(uid ? updatePayload : createPayload),
          }
        );

        if (!res.ok) {
          const result = await res.json();
          throw new Error(result?.message || "Lỗi khi lưu dashboard");
        }

        set({ version: nextVersion });

        uid ? useDashboardStore.getState().loadDashboard(uid) : useDashboardStore.getState().reset();
      },

      loadDashboard: async (uid: string) => {
        const userId = useAuthStore.getState().getUserId() || 0;
        const res = await fetch(`/api/dashboard/dashboards/${uid}?created_by=${userId}`, {
          credentials: "include",
        });
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Lỗi khi tải dashboard");
        }

        const dashboard = result.data;
        const layout = dashboard.layoutConfiguration;
        const refresh = layout.refresh;

        useDashboardStore.getState().reset();

        const timeLabel = layout.time.timeLabel;

        if (timeLabel) {
          const { from, to } = getTimeRangeFromLabel(timeLabel);
          layout.time.timeRange = { from, to };
        }

        set({
          name: dashboard.name,
          version: dashboard.version ?? 1,
          layoutConfiguration: {
            time: {
              timeRange: layout.time.timeRange,
              timeLabel: layout.time.timeLabel,
            },
            refresh: refresh,
            options: {
              anomaly: {
                enabled: layout.options.anomaly.enabled,
                local_error_threshold: layout.options.anomaly.local_error_threshold,
              },
              forecast: {
                enabled: layout.options.forecast.enabled,
                time_step: layout.options.forecast.time_step,
                horizon: layout.options.forecast.horizon,
              },
            },
            panels: layout.panels.map((panel: any, idx: number) => ({
              id: panel.id,
              title: panel.title,
              type: panel.type,
              gridPos: panel.gridPos,
              targets: panel.targets,
            })),
          },
          status: dashboard.status,
          createdBy: dashboard.createdBy,
          createdAt: dashboard.createdAt,
          updatedAt: dashboard.updatedAt,
        });
      },
    }),
    {
      name: "dashboard-draft",
    }
  )
);