"use client";

import type { Layout } from "react-grid-layout";
import {
  useEffect,
  useState,
  useCallback,
  Fragment,
} from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { WidthProvider } from "react-grid-layout";
import GridLayout from "react-grid-layout";
import { Dialog, Transition, DialogPanel, DialogTitle } from "@headlessui/react";
import { DashboardWidget } from "@/lib/types/dashboard";
import ChartToolbar from "@/components/water/chart/ChartToolbar";
import ChartConfigDialog from "@/components/dashboard/ChartConfigDialog";
import { useDashboardStore } from "@/lib/stores/useDashboardStore";
import { useAuthStore } from "@/lib/stores/useAuthStore";

const ChartRenderer = dynamic(() => import("@/components/dashboard/ChartRenderer"), { ssr: false });
const ResponsiveGridLayout = WidthProvider(GridLayout);

function getNextGridPosition(widgets: DashboardWidget[], cols = 12, w = 6, h = 4) {
  const positions = widgets.map((wid) => wid.gridPos);
  const maxY = Math.max(0, ...positions.map((p) => p.y + p.h));
  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= cols - w; x++) {
      const overlap = positions.some(
        (p) => x < p.x + p.w && x + w > p.x && y < p.y + p.h && y + h > p.y
      );
      if (!overlap) return { x, y, w, h };
    }
  }
  return { x: 0, y: maxY, w, h };
}

type Props = {
  isEditMode: boolean;
  dashboardUid?: string;
};

export default function DashboardEditor({ isEditMode, dashboardUid }: Props) {
  const router = useRouter();
  const userId = useAuthStore.getState().getUserId();
  const {
    widgets, setWidgets, addWidget, updateWidget, removeWidget, reset,
    title, setTitle, interval, setInterval, timeRange, setTimeRange,
    saveDashboard, loadDashboard
  } = useDashboardStore();

  const [editingWidget, setEditingWidget] = useState<DashboardWidget | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState<DashboardWidget | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [stations, setStations] = useState<{ id: number; name: string }[]>([]);
  const [filteredStations, setFilteredStations] = useState<{ id: number; name: string }[]>([]);
  const [availableParameters, setAvailableParameters] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    if (isEditMode && dashboardUid) {
      loadDashboard(dashboardUid).catch(err => console.error("Không thể tải dashboard:", err));
    }
  }, [isEditMode, dashboardUid]);

  console.log("title", title);

  useEffect(() => {
    fetch("/api/dashboard/stations")
      .then(res => res.json())
      .then(data => {
        const list = data?.stations || [];
        setStations(list);
        setFilteredStations(list);
      })
      .catch(err => console.error("Lỗi fetch trạm:", err));
  }, []);

  const handleSaveDashboard = async () => {
    try {
      const result = await saveDashboard({
        uid: isEditMode ? dashboardUid : undefined,
        title,
        interval,
        timeRange: {
          from: new Date(timeRange.from),
          to: new Date(timeRange.to),
        },
        created_by: userId!,
      });

      alert("Đã lưu dashboard!");

      if (!dashboardUid) {
        useDashboardStore.getState().reset();
        router.push("/dashboard");
      }

    } catch (err) {
      console.error("Lỗi khi lưu dashboard:", err);
      alert("Lỗi khi lưu dashboard");
    }
  };

  const handleLayoutChange = useCallback(
    (layout: Layout[]) => {
      if (!isEditing) return;
      const updated = widgets.map((w) => {
        const pos = layout.find((l: any) => l.i === w.id);
        return pos ? { ...w, gridPos: { x: pos.x, y: pos.y, w: pos.w, h: pos.h } } : w;
      });
      setWidgets(updated);
    },
    [isEditing, widgets]
  );

  const handleAddWidget = () => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      title: "Biểu đồ mới",
      type: "line_chart",
      gridPos: getNextGridPosition(widgets),
      targets: [],
      options: { forecast: { enabled: true, time_step: 3600 } },
      timeRange: {
        from: timeRange.from,
        to: timeRange.to,
      },
      interval,
    };
    setEditingWidget(newWidget);
    setShowDialog(true);
  };

  return (
    <div className="w-full h-screen overflow-y-auto">
      <div className="flex justify-between items-center mb-4 sticky top-0 z-10 bg-white shadow px-4 py-2">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-[300px] text-xl font-bold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <button onClick={handleSaveDashboard} className="p-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
            Lưu dashboard
          </button>
        </div>
        <div className="flex gap-2 items-center">
          <ChartToolbar
            interval={interval}
            onIntervalChange={(val) => {
              setInterval(val);
              setWidgets((prev) =>
                prev.map((w) => ({
                  ...w,
                  interval: val,
                }))
              );
            }}
            onManualRefresh={() => {
              setWidgets((prev) =>
                prev.map((w) => ({ ...w, refreshToken: Date.now() }))
              );
            }}
            onTimeRangeChange={(from, to) => {
              setTimeRange({ from: from.toISOString(), to: to.toISOString() });
              setWidgets((prev) =>
                prev.map((w) => ({
                  ...w,
                  timeRange: {
                    from: from.toISOString(),
                    to: to.toISOString(),
                  },
                }))
              );
            }}
          />

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEditing}
              onChange={() => setIsEditing(prev => !prev)}
            />
            <div className={`w-28 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${isEditing ? "bg-green-500" : "bg-red-500"}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isEditing ? "translate-x-20" : "translate-x-0"}`} />
              <span className={`absolute left-2 text-xs font-semibold text-white ${isEditing ? "opacity-100" : "opacity-0"}`}>Chỉnh sửa</span>
              <span className={`absolute right-2 text-xs font-semibold text-white ${isEditing ? "opacity-0" : "opacity-100"}`}>Bình thường</span>
            </div>
          </label>

          <button onClick={handleAddWidget} className="p-2 rounded border bg-blue-500 text-white text-sm font-medium">
            Thêm biểu đồ
          </button>
        </div>
      </div>

      <ResponsiveGridLayout
        className="layout"
        cols={12}
        rowHeight={80}
        isDraggable={isEditing}
        isResizable={isEditing}
        onLayoutChange={handleLayoutChange}
        draggableCancel="button"
      >
        {widgets.map((w) => (
          <div key={w.id} data-grid={w.gridPos} className="w-full h-full border rounded bg-white shadow p-4 relative">
            <h2 className="font-semibold text-sm mb-2 truncate">{w.title}</h2>
            <ChartRenderer widget={w} />
            {isEditing && (
              <>
                <button
                  className="absolute top-2 right-10 text-xs text-gray-500 hover:text-blue-600"
                  onClick={() => {
                    setEditingWidget(w);
                    setShowDialog(true);
                  }}
                >
                  Tuỳ chỉnh
                </button>
                <button
                  className="absolute top-2 right-2 text-xs text-red-500 hover:text-red-700"
                  onClick={() => {
                    setWidgetToDelete(w);
                    setShowDeleteDialog(true);
                  }}
                >
                  Xoá
                </button>
              </>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>

      {editingWidget && (
        <ChartConfigDialog
          open={showDialog}
          onClose={() => setShowDialog(false)}
          widget={editingWidget}
          onSave={(w) => {
            const exists = widgets.some((x) => x.id === w.id);
            exists ? updateWidget(w) : addWidget(w);
            setShowDialog(false);
            setEditingWidget(null);
          }}
          stations={filteredStations}
          parameters={availableParameters}
        />
      )}

      {widgetToDelete && (
        <Transition appear show={showDeleteDialog} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setShowDeleteDialog(false)}>
            <div className="fixed inset-0 bg-black/30" />
            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <DialogPanel className="w-full max-w-md rounded bg-white p-6 text-left shadow-xl space-y-6">
                  <DialogTitle className="text-lg font-bold">Xác nhận xoá</DialogTitle>
                  <p>Bạn có chắc muốn xoá biểu đồ <strong>{widgetToDelete.title}</strong>?</p>
                  <div className="flex justify-end gap-2">
                    <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowDeleteDialog(false)}>Huỷ</button>
                    <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => {
                      removeWidget(widgetToDelete.id);
                      setShowDeleteDialog(false);
                      setWidgetToDelete(null);
                    }}>Xoá</button>
                  </div>
                </DialogPanel>
              </div>
            </div>
          </Dialog>
        </Transition>
      )}
    </div>
  );
}