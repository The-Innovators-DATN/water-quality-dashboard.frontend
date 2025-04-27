import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { DashboardWidget } from "@/lib/types/dashboard";
import { useAuthStore } from "@/lib/stores/useAuthStore";

interface DashboardState {
  widgets: DashboardWidget[];
  title: string;
  interval: number;
  version: number;
  timeRange: { from: string; to: string };
  setWidgets: (widgets: DashboardWidget[] | ((prev: DashboardWidget[]) => DashboardWidget[])) => void;
  setTitle: (title: string) => void;
  setInterval: (interval: number) => void;
  setTimeRange: (range: { from: string; to: string }) => void;
  addWidget: (widget: DashboardWidget) => void;
  updateWidget: (updated: DashboardWidget) => void;
  removeWidget: (id: string) => void;
  reset: () => void;
  saveDashboard: (params: {
    uid?: string;
    title: string;
    interval: number;
    timeRange: { from: Date; to: Date };
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
      timeRange: { from: new Date().toISOString(), to: new Date().toISOString() },

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

      addWidget: (widget) =>
        set((state) => ({ widgets: [...state.widgets, widget] })),

      updateWidget: (updated) =>
        set((state) => ({
          widgets: state.widgets.map((w) =>
            w.id === updated.id ? updated : w
          ),
        })),

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
          timeRange: { from: new Date().toISOString(), to: new Date().toISOString() },
          version: 1,
        })
      },

      saveDashboard: async ({ uid, title, interval, timeRange, created_by }) => {
        const widgets = get().widgets;
        const currentVersion = get().version;
      
        const userId = useAuthStore.getState().getUserId?.();
        if (!userId) throw new Error("Không tìm thấy userId từ Auth Store");
      
        const from = typeof timeRange.from === "string"
          ? timeRange.from
          : timeRange.from?.toISOString();
        const to = typeof timeRange.to === "string"
          ? timeRange.to
          : timeRange.to?.toISOString();
      
        const nextVersion = uid ? currentVersion + 1 : 1;
      
        const payload = {
          ...(uid ? { uid } : {}),
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
                options: w.options,
              })),
            },
            created_by: created_by ?? userId,
            version: nextVersion,
            status: "active",
          },
        };
      
        const res = await fetch(
          uid ? `/api/dashboard/dashboards/${uid}` : "/api/dashboard/dashboards",
          {
            method: uid ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify(payload),
          }
        );
      
        if (!res.ok) {
          const result = await res.json();
          throw new Error(result?.message || "Lỗi khi lưu dashboard");
        }
      
        set({ version: nextVersion });

        useDashboardStore.getState().reset();
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
        const refresh = parseInt(layout.refresh?.replace("s", "") || "300");

        useDashboardStore.getState().reset();

        set({
          title: dashboard.name,
          interval: refresh,
          version: dashboard.version ?? 1,
          timeRange: {
            from: layout.time?.from ?? "",
            to: layout.time?.to ?? "",
          },
          widgets: layout.panels.map((panel: any, idx: number) => ({
            id: `widget-${idx}`,
            title: panel.title,
            type: panel.type,
            gridPos: panel.gridPos,
            targets: panel.targets,
            options: panel.options,
            interval: refresh,
            timeRange: {
              from: layout.time?.from ?? "",
              to: layout.time?.to ?? "",
            },
          })),
        });
      },
    }),
    {
      name: "dashboard-draft",
    }
  )
);