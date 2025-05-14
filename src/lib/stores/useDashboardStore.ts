import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardWidget } from "@/lib/types/dashboard";
import { useAuthStore } from "@/lib/stores/useAuthStore";

interface DashboardState {
  widgets: DashboardWidget[];
  title: string;
  interval: number;
  version: number;
  timeRange: { from: Date | string, to: Date | string };
  timeLabel: string | null;
  timeStep: number;
  horizon: number;
  anomalyEnabled: boolean;
  forecastEnabled: boolean;
  setWidgets: (widgets: DashboardWidget[] | ((prev: DashboardWidget[]) => DashboardWidget[])) => void;
  setTitle: (title: string) => void;
  setInterval: (interval: number) => void;
  setTimeRange: (range: { from: Date | string, to: Date | string }) => void;
  setTimeLabel: (timeLabel: string | null) => void;
  setTimeStep: (timeStep: number) => void;
  setHorizon: (horizon: number) => void;
  setAnomalyEnabled: (anomalyEnabled: boolean) => void;
  setForecastEnabled: (forecastEnabled: boolean) => void;
  addWidget: (widget: DashboardWidget) => void;
  updateWidget: (updated: DashboardWidget) => void;
  removeWidget: (id: string) => void;
  reset: () => void;
  saveDashboard: (params: {
    uid?: string;
    title: string;
    interval: number;
    timeRange: { from: Date | string, to: Date | string };
    timeLabel: string | null;
    timeStep: number;
    horizon: number;
    anomalyEnabled: boolean;
    forecastEnabled: boolean;
    created_by?: number;
  }) => Promise<void>;
  loadDashboard: (uid: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      widgets: [],
      title: "Bảng điều khiển mới",
      interval: 0,
      version: 1,
      timeRange: { from: new Date(), to: new Date() },
      timeLabel: null,
      timeStep: 3600,
      horizon: 1,
      anomalyEnabled: false,
      forecastEnabled: false,

      setWidgets: (widgetsOrFn) => {
        const current = get().widgets;
        const newWidgets =
          typeof widgetsOrFn === "function"
            ? widgetsOrFn(current)
            : widgetsOrFn;
        set({ widgets: newWidgets });
      },

      setTitle: (title) => set({ title }),
      setInterval: (interval) => set({ interval }),
      setTimeRange: (range) => set({ timeRange: range }),
      setTimeLabel: (timeLabel) => set({ timeLabel }),
      setTimeStep: (timeStep) => set({ timeStep }),
      setHorizon: (horizon) => set({ horizon }),
      setAnomalyEnabled: (anomalyEnabled) => set({ anomalyEnabled }),
      setForecastEnabled: (forecastEnabled) => set({ forecastEnabled }),

      addWidget: (widget) =>
        set((state) => ({ widgets: [...state.widgets, widget] })),

      updateWidget: (updated) => {
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === updated.id ? updated : w
          ),
        }))
      },

      removeWidget: (id) =>
        set((state) => ({
          widgets: state.widgets.filter((w) => w.id !== id),
        })),

      reset: () => {
        localStorage.removeItem("dashboard-draft");
        set({
          widgets: [],
          title: "",
          interval: 0,
          timeRange: { from: new Date(), to: new Date() },
          version: 1,
        })
      },

      saveDashboard: async ({ uid, title, interval, timeRange }) => {
        const widgets = get().widgets;
        const currentVersion = get().version;
      
        const userId = useAuthStore.getState().getUserId?.();
        if (!userId) throw new Error("Không tìm thấy userId từ Auth Store");
      
        const from = typeof timeRange.from === "string"? timeRange.from: timeRange.from.toISOString();
        const to = typeof timeRange.to === "string"? timeRange.to: timeRange.to.toISOString();
      
        const nextVersion = uid ? currentVersion + 1 : 1;
      
        const createPayload = {
          dashboard: {
            name: title || "Bảng điều khiển mới",
            description: "Mô tả bảng điều khiển",
            layout_configuration: {
              time: { from, to },
              refresh: `${interval}s`,
              panels: widgets.map((w, idx) => ({
                id: typeof w.id === "number" ? w.id : idx + 1,
                title: w.title,
                type: w.type,
                gridPos: w.gridPos,
                targets: w.targets,
                timeLabel: w.timeLabel,
                timeStep: w.timeStep,
                horizon: w.horizon,
                anomalyEnabled: w.anomalyEnabled,
                forecastEnabled: w.forecastEnabled,
              })),
            },
            status: "active",
            created_by: userId,
          }
        };

        const updatePayload = {
          dashboard: {
            name: title || "Bảng điều khiển mới",
            description: "Mô tả bảng điều khiển",
            layout_configuration: {
              time: { from, to },
              refresh: `${interval}s`,
              panels: widgets.map((w, idx) => ({
                id: typeof w.id === "number" ? w.id : idx + 1,
                title: w.title,
                type: w.type,
                gridPos: w.gridPos,
                targets: w.targets,
                timeLabel: w.timeLabel,
                timeStep: w.timeStep,
                horizon: w.horizon,
                anomalyEnabled: w.anomalyEnabled,
                forecastEnabled: w.forecastEnabled,
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

        uid ? useDashboardStore.getState().loadDashboard(uid): useDashboardStore.getState().reset();
      },  

      loadDashboard: async (uid: string) => {
        const userId = useAuthStore.getState().getUserId();
        const res = await fetch(`/api/dashboard/dashboards/${uid}?created_by=${userId}`, {
          credentials: "include",
        });
        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.message || "Lỗi khi tải dashboard");
        }

        const dashboard = result.data;

        const layout = dashboard.layoutConfiguration;
        const refresh = parseInt(layout.refresh.replace("s", "") ?? "0");

        useDashboardStore.getState().reset();

        set({
          title: dashboard.name,
          interval: refresh,
          version: dashboard.version ?? 1,
          timeRange: layout.time,
          widgets: layout.panels.map((panel: any, idx: number) => ({
            id: `widget-${idx}`,
            title: panel.title,
            type: panel.type,
            gridPos: panel.gridPos,
            targets: panel.targets,
            options: panel.options,
            interval: refresh,
            timeRange: layout.time,
          })),
        });
      },
    }),
    {
      name: "dashboard-draft",
    }
  )
);