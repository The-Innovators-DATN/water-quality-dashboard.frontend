"use client";

import { Dialog, DialogPanel, DialogTitle, Transition } from "@headlessui/react";
import { Fragment, useState, useEffect, useMemo } from "react";
import { DashboardWidget } from "@/lib/types/dashboard";
import MultiSelect from "@/components/ui/MultiSelect";

interface Props {
  open: boolean;
  onClose: () => void;
  widget: DashboardWidget;
  onSave: (updated: DashboardWidget) => void;
  stations: { id: number; name: string }[];
  parameters: { id: number; name: string }[];
}

const defaultColors = ["#ff5733", "#33c1ff", "#8e44ad", "#27ae60", "#f39c12"];

export default function ChartConfigDialog({
  open,
  onClose,
  widget,
  onSave,
  stations,
  parameters,
}: Props) {
  const [selectedStationIds, setSelectedStationIds] = useState<number[]>([]);
  const [selectedParamIds, setSelectedParamIds] = useState<number[]>([]);
  const [availableParameters, setAvailableParameters] = useState<{ id: number; name: string }[]>([]);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});
  const [title, setTitle] = useState(widget.title || "");

  // Derived station options
  const stationOptions = useMemo(() => stations.map(s => ({ label: s.name, value: s.id })), [stations]);

  const selectedStationObjs = useMemo(
    () => stationOptions.filter(opt => selectedStationIds.includes(opt.value)),
    [stationOptions, selectedStationIds]
  );

  const parameterOptions = useMemo(
    () => availableParameters.map(p => ({ label: p.name, value: p.id })),
    [availableParameters]
  );

  const selectedParamObjs = useMemo(
    () => parameterOptions.filter(opt => selectedParamIds.includes(Number(opt.value))),
    [parameterOptions, selectedParamIds]
  );

  // Init dialog state from widget
  useEffect(() => {
    if (!widget) return;

    const stationIds = Array.from(new Set(widget.targets.map(t => Number(t.target_id))));
    const paramIds = Array.from(new Set(widget.targets.map(t => Number(t.metric_id))));
    const initialColors: Record<string, string> = {};

    widget.targets.forEach(t => {
      const key = `${t.target_id}-${t.metric_id}`;
      initialColors[key] = t.color;
    });

    setSelectedStationIds(stationIds);
    setSelectedParamIds(paramIds);
    setColorMap(initialColors);
  }, [widget]);

  // Fetch params by selected stations
  useEffect(() => {
    const fetchParams = async () => {
      if (!selectedStationIds.length) {
        setAvailableParameters([]);
        return;
      }

      const paramSet = new Map<number, string>();

      await Promise.all(
        selectedStationIds.map(async stationId => {
          try {
            const res = await fetch("/api/dashboard/station_parameters/by_target", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ target_id: stationId }),
            });

            const result = await res.json();
            const params = result?.data?.parameters || [];
            params.forEach((p: any) => paramSet.set(p.id, p.name));
          } catch (err) {
            console.error("Lỗi khi lấy tham số:", err);
          }
        })
      );

      setAvailableParameters(
        Array.from(paramSet.entries()).map(([id, name]) => ({ id, name }))
      );
    };

    fetchParams();
  }, [selectedStationIds]);

  const handleColorChange = (stationId: number, paramId: number, color: string) => {
    const key = `${stationId}-${paramId}`;
    setColorMap(prev => ({ ...prev, [key]: color }));
  };

  const handleSave = () => {
    const newTargets = selectedStationIds.flatMap((sId, sIndex) =>
      selectedParamIds.map((pId, pIndex) => {
        const param = availableParameters.find(p => p.id === pId);
        const station = stations.find(s => s.id === sId);
        const key = `${sId}-${pId}`;
        const refId = `R${sId}_${pId}`;

        return {
          refId,
          target_type: "station",
          target_id: sId,
          metric_id: pId,
          display_name: `${param?.name} - ${station?.name}`,
          color: colorMap[key] || defaultColors[(sIndex + pIndex) % defaultColors.length],
        };
      })
    );

    onSave({
      ...widget,
      title: title || "Biểu đồ mới",
      targets: newTargets,
    });

    onClose();
  };

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <DialogPanel className="w-full max-w-2xl rounded bg-white p-6 text-left shadow-xl space-y-6">
              <DialogTitle className="text-lg font-bold">Cấu hình biểu đồ</DialogTitle>

              <div>
                <p className="text-sm font-medium mb-1">Tên biểu đồ</p>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full border rounded px-2 py-1"
                  placeholder="Nhập tên biểu đồ..."
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Chọn trạm</p>
                <MultiSelect
                  options={stationOptions}
                  selected={selectedStationObjs}
                  onChange={newSelected => setSelectedStationIds(newSelected.map(s => Number(s.value)))}
                  placeholder="Chọn trạm quan trắc..."
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Chọn tham số</p>
                <MultiSelect
                  options={parameterOptions}
                  selected={selectedParamObjs}
                  onChange={newSelected => setSelectedParamIds(newSelected.map(s => Number(s.value)))}
                  placeholder="Chọn tham số..."
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Màu từng dòng</p>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-2">
                  {selectedStationIds.flatMap(sId =>
                    selectedParamIds.map(pId => {
                      const key = `${sId}-${pId}`;
                      const station = stations.find(s => s.id === sId);
                      const param = availableParameters.find(p => p.id === pId);
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-sm w-40 truncate">{param?.name} - {station?.name}</span>
                          <input
                            type="color"
                            value={colorMap[key] || "#000000"}
                            onChange={e => handleColorChange(sId, pId, e.target.value)}
                          />
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" onClick={onClose}>
                  Huỷ
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700" onClick={handleSave}>
                  Lưu cấu hình
                </button>
              </div>
            </DialogPanel>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}