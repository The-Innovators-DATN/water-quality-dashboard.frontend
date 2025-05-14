"use client";

import type { Layout } from "react-grid-layout";
import {
  useEffect,
  useState,
  useCallback,
  Fragment,
  useRef,
} from "react";
import { toast } from "sonner";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

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
  const contentRef = useRef(null);

  const generatePDF = () => {
    const element = contentRef.current;

    if (element) {
      html2canvas(element).then((canvas) => {
        const doc = new jsPDF({
          unit: "mm",
          format: [canvas.width, canvas.height],
          orientation: "landscape",
        });

        const imgData = canvas.toDataURL("image/png");

        const imgWidth = doc.internal.pageSize.width;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        
        doc.setFontSize(80);
        const titleWidth = doc.getTextWidth(title);
        const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
        doc.text(title, titleX, 50);

        doc.addImage(imgData, "PNG", 0, 80, imgWidth, imgHeight);

        doc.save("dashboard.pdf");
      });
    }
  };

  const router = useRouter();
  const userId = useAuthStore.getState().getUserId();
  const {
    widgets, setWidgets, addWidget, updateWidget, removeWidget, reset,
    title, setTitle, interval, setInterval, timeRange, setTimeRange,
    timeLabel, setTimeLabel, timeStep, setTimeStep, horizon, setHorizon,
    anomalyEnabled, setAnomalyEnabled, forecastEnabled, setForecastEnabled,
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEditMode && dashboardUid) {
      loadDashboard(dashboardUid).catch(err => console.error("Không thể tải dashboard:", err));
    }
  }, [isEditMode, dashboardUid]);

  useEffect(() => {
    const widgetStr = localStorage.getItem("compare:widget");
    if (widgetStr) {
      try {
        const widget = JSON.parse(widgetStr);
        if (widget) {
          reset();

          addWidget({
            ...widget,
            id: `widget-${Date.now()}`,
            gridPos: getNextGridPosition([]),
            timeRange: widget.timeRange,
            interval: widget.interval,
            targets: widget.targets,
            timeLabel: widget.timeLabel,
            timeStep: widget.timeStep,
            horizon: widget.horizon,
            anomalyEnabled: widget.anomalyEnabled,
            forecastEnabled: widget.forecastEnabled,
          });
          setTimeRange(widget.timeRange);
          setInterval(widget.interval);
          setTimeLabel(widget.timeLabel);
          setTimeStep(widget.timeStep);
          setHorizon(widget.horizon);
          setAnomalyEnabled(widget.anomalyEnabled);
          setForecastEnabled(widget.forecastEnabled);
        }
        localStorage.removeItem("compare:widget");
      } catch (err) {
        console.error("Lỗi parse widget từ localStorage:", err);
      }
    }
  }, []);

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
      setIsSaving(true);
      await saveDashboard({
        uid: isEditMode ? dashboardUid : undefined,
        title,
        interval,
        timeRange,
        timeLabel,
        timeStep,
        horizon,
        anomalyEnabled,
        forecastEnabled,
        created_by: userId!,
      });

      if (!dashboardUid) {
        useDashboardStore.getState().reset();
        router.push("/dashboard");
      }

      toast.success("Đã lưu dashboard thành công!");
    } catch (err) {
      console.error("Lỗi khi lưu dashboard:", err);
      toast.error("Lỗi khi lưu dashboard");
    } finally {
      setIsSaving(false);
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
      timeRange,
      interval,
      timeLabel: null,
      timeStep: 3600,
      horizon: 1,
      anomalyEnabled: true,
      forecastEnabled: true,
    };
    setEditingWidget(newWidget);
    setShowDialog(true);
  };

  return (
    <div className="w-full h-screen overflow-y-auto">
      <div className="w-full flex justify-between items-center mb-4 sticky top-0 z-10 bg-white shadow px-4 py-2">
        <div className="w-1/3 flex items-center gap-2">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-[200px] text-xl font-bold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <button onClick={() => {
            handleSaveDashboard();
            generatePDF();
          }} className="p-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm">
            Lưu dashboard
          </button>
        </div>
        <div className="w-2/3 flex gap-2 items-center">
          <ChartToolbar
            interval={interval}
            timeRange={timeRange}
            timeLabel={timeLabel}
            timeStep={timeStep}
            horizon={horizon}
            anomalyEnabled={anomalyEnabled}
            predictionEnabled={forecastEnabled}
            onChangeTimeLabel={(val) => {
              setTimeLabel(val);
              setWidgets((prev) =>
                prev.map((w) => ({
                  ...w,
                  timeLabel: val,
                }))
              );
            }}
            onIntervalChange={(val) => {
              setInterval(val);
              setWidgets((prev) =>
                prev.map((w) => ({
                  ...w,
                  interval: val,
                }))
              );
            }}
            onTimeStepChange={(val) => {
              setTimeStep(val);
              setWidgets((prev) =>
                prev.map((w) => ({
                  ...w,
                  timeStep: val,
                }))
              );
            }}
            onHorizonChange={(val) => {
              setHorizon(val);
              setWidgets((prev) =>
                prev.map((w) => ({
                  ...w,
                  horizon: val,
                }))
              );
            }}
            onToggleAnomaly={(val) => {
              setAnomalyEnabled(val);
              setWidgets((prev) =>
                prev.map((w) => ({
                  ...w,
                  anomalyEnabled: val,
                }))
              );
            }}
            onTogglePrediction={(val) => {
              setForecastEnabled(val);
              setWidgets((prev) =>
                prev.map((w) => ({
                  ...w,
                  forecastEnabled: val,
                }))
              );
            }}
            onManualRefresh={() => {
              setWidgets((prev) =>
                prev.map((w) => ({ ...w, refreshToken: Date.now() }))
              );
            }}
            onTimeRangeChange={(from, to) => {
              setTimeRange({ from, to });
              setWidgets((prev) =>
                prev.map((w) => ({
                  ...w,
                  timeRange: { from, to },
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
            <div className={`w-16 h-8 flex items-center rounded-full p-1 transition-colors duration-300 ${isEditing ? "bg-green-500" : "bg-red-500"}`}>
              <div className={`w-6 h-6 bg-white rounded-full shadow-md transform transition-transform duration-300 ${isEditing ? "translate-x-8" : "translate-x-0"}`} />
              <span className={`absolute left-2 text-xs font-semibold text-white ${isEditing ? "opacity-100" : "opacity-0"}`}>Tắt</span>
              <span className={`absolute right-2 text-xs font-semibold text-white ${isEditing ? "opacity-0" : "opacity-100"}`}>Bật</span>
            </div>
          </label>

          <button onClick={handleAddWidget} className="w-40 p-2 rounded border bg-blue-500 text-white text-sm font-medium">
            Thêm biểu đồ
          </button>
        </div>
      </div>

      <div ref={contentRef} className="w-full h-full overflow-y-auto">
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
              <ChartRenderer key={w.refreshToken ?? w.id} widget={w} />
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
      </div>

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
      {isSaving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}