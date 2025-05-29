"use client";

import { useEffect, useState, useCallback, Fragment, useRef } from "react";
import { Save, Download } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Layout, WidthProvider } from "react-grid-layout";
import GridLayout from "react-grid-layout";
import { Dialog, Transition, DialogPanel, DialogTitle } from "@headlessui/react";
import { DashboardPanel } from "@/lib/types/dashboard";
import ChartToolbar from "@/components/water/chart/ChartToolbar";
import ChartConfigDialog from "@/components/dashboard/ChartConfigDialog";
import { useDashboardStore } from "@/lib/stores/useDashboardStore";
import { useAuthStore } from "@/lib/stores/useAuthStore";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const ChartRenderer = dynamic(() => import("@/components/dashboard/ChartRenderer"), { ssr: false });
const ResponsiveGridLayout = WidthProvider(GridLayout);

function getNextGridPosition(widgets: DashboardPanel[], cols = 12, w = 6, h = 4) {
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
  const router = useRouter();
  const userId = useAuthStore.getState().getUserId();

  const {
    layoutConfiguration, updateLayoutConfiguration, addPanel, updatePanel, removePanel, reset, name, setName, saveDashboard, loadDashboard
  } = useDashboardStore();

  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [editingWidget, setEditingWidget] = useState<DashboardPanel | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [widgetToDelete, setWidgetToDelete] = useState<DashboardPanel | null>(null);
  const [isEditing, setIsEditing] = useState(true);

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
    const layoutConfigurationStr = localStorage.getItem("compare:layoutConfiguration");
    if (layoutConfigurationStr) {
      try {
        const layoutConfiguration = JSON.parse(layoutConfigurationStr);
        if (layoutConfiguration) {
          reset();

          updateLayoutConfiguration("options", layoutConfiguration.options);
          updateLayoutConfiguration("panels", layoutConfiguration.panels);
          updateLayoutConfiguration("refresh", layoutConfiguration.refresh);
          updateLayoutConfiguration("time", layoutConfiguration.time);
        }
        localStorage.removeItem("compare:layoutConfiguration");
      } catch (err) {
        console.error("Lỗi parse layout configuration từ localStorage:", err);
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

  const generatePDF = () => {
    const element = contentRef.current;

    if (element) {
      setIsGeneratingPDF(true);

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
        const titleWidth = doc.getTextWidth(name);
        const titleX = (doc.internal.pageSize.width - titleWidth) / 2;
        doc.text(name, titleX, 50);

        doc.addImage(imgData, "PNG", 0, 80, imgWidth, imgHeight);

        doc.save("dashboard.pdf");
      }).finally(() => setIsGeneratingPDF(false));
    }
  };

  const handleSaveDashboard = async () => {
    try {
      setIsSaving(true);
      await saveDashboard(isEditMode ? dashboardUid : undefined);

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
      const updated = layoutConfiguration.panels.map((w) => {
        const pos = layout.find((l: any) => l.i === w.id);
        return pos ? { ...w, gridPos: { x: pos.x, y: pos.y, w: pos.w, h: pos.h } } : w;
      });
      updateLayoutConfiguration("panels", updated);
    },
    [isEditing, layoutConfiguration.panels]
  );

  const handleAddWidget = () => {
    const newWidget: DashboardPanel = {
      id: `widget-${Date.now()}`,
      title: "Biểu đồ mới",
      type: "line_chart",
      gridPos: getNextGridPosition(layoutConfiguration.panels),
      targets: [],
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
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-[200px] text-xl font-bold bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500"
          />
          <button onClick={handleSaveDashboard} className="p-2 rounded-lg border border-2">
            <Save size={16} />
          </button>
          <button onClick={generatePDF} className="p-2 rounded-lg border border-2">
            <Download size={16} />
          </button>
        </div>
        <div className="w-2/3 flex gap-2 justify-end">
          <ChartToolbar
            interval={layoutConfiguration.refresh}
            timeRange={layoutConfiguration.time.timeRange}
            timeLabel={layoutConfiguration.time.timeLabel}
            timeStep={layoutConfiguration.options.forecast.time_step}
            horizon={layoutConfiguration.options.forecast.horizon}
            anomalyEnabled={layoutConfiguration.options.anomaly.enabled}
            predictionEnabled={layoutConfiguration.options.forecast.enabled}
            localError={layoutConfiguration.options.anomaly.local_error_threshold}
            onChangeTime={(from, to, label) => {
              updateLayoutConfiguration("time", { ...layoutConfiguration.time, timeLabel: label, timeRange: { from, to } })
            }}
            onIntervalChange={(val) => updateLayoutConfiguration("refresh", val)}
            onOptionsChange={(val) => updateLayoutConfiguration("options", val)}
            onManualRefresh={() => updateLayoutConfiguration("panels", layoutConfiguration.panels.map((w) => ({ ...w, refreshToken: Date.now() })))}
          />
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isEditing}
              onChange={() => setIsEditing((prev) => !prev)}
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
          {layoutConfiguration.panels.map((w) => (
            <div key={w.id} data-grid={w.gridPos} className="w-full h-full border rounded bg-white shadow p-4 relative">
              <h2 className="font-semibold text-sm mb-2 truncate">{w.title}</h2>
              <ChartRenderer key={w.refreshToken ?? w.id} panel={w} timeRange={layoutConfiguration.time.timeRange} refresh={layoutConfiguration.refresh} options={layoutConfiguration.options} />
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
          panel={editingWidget}
          onSave={(p) => {
            const exists = layoutConfiguration.panels.some((x) => x.id === p.id);
            exists ? updatePanel(p) : addPanel(p);
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
                      removePanel(widgetToDelete.id);
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

      {(isSaving || isGeneratingPDF) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
}