"use client";

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import {
  X, Monitor, ClipboardList, Calendar, Share, Table, BarChart,
} from "lucide-react";

import WQIGauge from '@/components/WQIGauge';
import AlertHistoryTable from "@/components/AlertHistoryTable";
import LineChart from "@/components/charts/LineChart";
import RefreshSelector from "@/components/RefreshSelector";

export interface StationData {
  id?: string;
  name?: string;
  coordinates?: string;
  area?: string;
  country?: string;
  basin?: string;
  wqi?: number;
}

export interface WeatherData {
  temperature?: string;
  condition?: string;
  elapsedTime?: number;
}

export interface MeasurementRecord {
  timestamp?: string;
  user?: string;
  station?: string;
  message?: string;
  level?: string;
}

export interface WaterQualityDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  stationData?: StationData;
  weatherData?: WeatherData;
  measurementData?: MeasurementRecord[];
}

type ViewStep = "select" | "stats" | "chart";

type ActionType = "chart" | "export" | "schedule" | "stats";

const availableParameters = ["pH", "Nhiệt độ nước", "TSS", "NH4", "NO3", "Coliform"];

const chartColorMap: Record<string, string> = {
  "pH": "#f59e0b",
  "Nhiệt độ nước": "#10b981",
  "TSS": "#3b82f6",
  "NH4": "#ef4444",
  "NO3": "#8b5cf6",
  "Coliform": "#ec4899"
};

const WaterQualityDialog: React.FC<WaterQualityDialogProps> = ({
  isOpen,
  onOpenChange,
  stationData
}) => {
  const [time, setTime] = useState(format(new Date(), "HH:mm:ss"));
  const [viewStep, setViewStep] = useState<ViewStep>("select");
  const [selectedParams, setSelectedParams] = useState<string[]>([]);
  const [activeAction, setActiveAction] = useState<ActionType | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(99);
  const [timeRange, setTimeRange] = useState("24h");
  const [triggerFetch, setTriggerFetch] = useState(false);


  const handleAction = (action: ActionType) => {
    if (selectedParams.length === 0) {
      alert("Vui lòng chọn ít nhất một thông số.");
      return;
    }
  
    setActiveAction(action);
  
    switch (action) {
      case "chart":
        setViewStep("chart");
        break;
      case "stats":
        setViewStep("stats"); // Bạn có thể thêm view thống kê nếu có
        break;
      case "export":
        console.log("Exporting report for:", selectedParams);
        break;
      case "schedule":
        console.log("Scheduling report for:", selectedParams);
        break;
    }
  };
  

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(format(new Date(), "H:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleParam = (param: string) => {
    setSelectedParams(prev =>
      prev.includes(param)
        ? prev.filter(p => p !== param)
        : [...prev, param]
    );
  };

  return (
    <Dialog open={isOpen} onClose={() => onOpenChange(false)} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-black/30" />
      <div className="fixed inset-0 flex flex-col w-screen h-screen items-center justify-center">
        <DialogPanel className="w-[90%] h-[90%] bg-white p-6 rounded-xl flex flex-col relative">
          <button
            className="absolute top-4 right-4 z-10"
            onClick={() => onOpenChange(false)}
          >
            <X size={24} className="text-gray-500 hover:text-gray-700" />
          </button>

          <TabGroup className="w-full h-full flex flex-col">
            <TabList className="flex shrink-0 space-x-4">
              <Tab className="px-2 py-1 flex flex-col items-center text-xs space-y-1 data-[selected]:text-blue-500 data-[selected]:border-b-2 data-[selected]:border-blue-500">
                <Monitor size={18} />
                <span>Bảng điều khiển</span>
              </Tab>
              <Tab className="px-2 py-1 flex flex-col items-center text-xs space-y-1 data-[selected]:text-blue-500 data-[selected]:border-b-2 data-[selected]:border-blue-500">
                <ClipboardList size={18} />
                <span>Các thông số</span>
              </Tab>
            </TabList>

            <TabPanels className="h-full mt-2 border rounded-lg overflow-hidden">
              {/* Dashboard */}
              <TabPanel className="grid grid-rows-4 h-full">
                <div className="row-span-1 bg-blue-500 text-white p-2 rounded-t-lg space-y-2">
                  <p className="font-bold">{stationData?.name}</p>
                  <div className="w-1/2 h-1 bg-white"></div>
                  <div className="w-1/2 flex justify-between space-x-2">
                    <div className="w-1/2 truncate">
                      <p>ID trạm: {stationData?.id}</p>
                      <p>Toạ độ: {stationData?.coordinates}</p>
                    </div>
                    <div className="w-1/2 truncate">
                      <p>Khu vực: {stationData?.area}</p>
                      <p>Quốc gia: {stationData?.country}</p>
                      <p>Hệ thống lưu vực: {stationData?.basin}</p>
                    </div>
                  </div>
                </div>

                <div className="row-span-3 flex gap-4 p-4 h-full">
                  <div className="w-1/4 flex flex-col gap-4">
                    <div className="bg-gray-200 rounded-lg p-4 flex flex-col justify-center items-center flex-1">
                      <p className="text-lg">Giờ hiện tại</p>
                      <p className="text-6xl">{time}</p>
                    </div>
                    <div className="bg-gray-200 rounded-lg p-4 flex flex-col justify-center items-center flex-1">
                      <p className="text-lg">Chỉ số WQI</p>
                      <WQIGauge value={stationData?.wqi || 120} />
                    </div>
                  </div>

                  <div className="w-3/4 h-full overflow-auto">
                    <AlertHistoryTable />
                  </div>
                </div>
              </TabPanel>

              <TabPanel className="h-full overflow-auto">
                <div className="flex-1 h-full flex flex-col min-w-0">
                  <div className="flex items-center justify-between border-b px-6 py-2 text-sm">
                    {activeAction === "chart" && (
                      <div className="flex items-center gap-3">
                        <button
                          className="text-sm text-blue-600 hover:underline ml-4"
                          onClick={() => {
                            setViewStep("select");
                            setActiveAction(null);
                          }}
                        >
                          ← Quay lại
                        </button>
                        <select
                          className="border rounded px-2 py-1 h-8 text-sm"
                          value={timeRange}
                          onChange={(e) => setTimeRange(e.target.value)}
                        >
                          <option value="1h">1 giờ trước</option>
                          <option value="6h">6 giờ trước</option>
                          <option value="12h">12 giờ trước</option>
                          <option value="24h">24 giờ trước</option>
                        </select>

                        <RefreshSelector
                          onRefresh={() => setTriggerFetch((prev) => !prev)}
                          onIntervalChange={(val: number) => setRefreshInterval(val)}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-4">
                        <button
                          className="flex items-center gap-1 text-sm"
                          onClick={() => handleAction("schedule")}
                        >
                          <Calendar size={16} />
                          <span>Lập lịch báo cáo</span>
                        </button>
                        <button
                          className="flex items-center gap-1 text-sm"
                          onClick={() => handleAction("export")}
                        >
                          <Share size={16} />
                          <span>Xuất báo cáo</span>
                        </button>
                      </div>

                      <div className="w-px h-5 bg-gray-300" />

                      <div className="flex items-center gap-4">
                        <button
                          className={`flex items-center gap-1 text-sm ${
                            activeAction === "stats"
                              ? "text-blue-500 border-b-2 border-blue-500"
                              : "hover:text-blue-500"
                          }`}
                          onClick={() => handleAction("stats")}
                        >
                          <Table size={16} />
                          <span>Thống kê</span>
                        </button>
                        <button
                          className={`flex items-center gap-1 text-sm ${
                            activeAction === "chart"
                              ? "text-blue-500 border-b-2 border-blue-500"
                              : "hover:text-blue-500"
                          }`}
                          onClick={() => handleAction("chart")}
                        >
                          <BarChart size={16} />
                          <span>Biểu đồ</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-auto px-6 py-4">
                    {viewStep === "select" && (
                      <div className="space-y-4">
                        <p className="font-medium text-lg">Chọn thông số để xem biểu đồ:</p>

                        <div className="overflow-auto border rounded">
                          <table className="min-w-full text-sm">
                            <thead className="bg-gray-100 text-left">
                              <tr>
                                <th className="px-4 py-2"><input type="checkbox" /></th>
                                <th className="px-4 py-2">Nhóm thông số</th>
                                <th className="px-4 py-2">Thông số</th>
                                <th className="px-4 py-2">Viết tắt</th>
                                <th className="px-4 py-2">Đơn vị</th>
                                <th className="px-4 py-2">Số lượng giá trị</th>
                              </tr>
                            </thead>
                            <tbody>
                              {availableParameters.map((param, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 border-t">
                                  <td className="px-4 py-2">
                                    <input
                                      type="checkbox"
                                      checked={selectedParams.includes(param)}
                                      onChange={() => toggleParam(param)}
                                    />
                                  </td>
                                  <td className="px-4 py-2">Nhóm thông số mẫu</td>
                                  <td className="px-4 py-2">{param}</td>
                                  <td className="px-4 py-2">{param}</td>
                                  <td className="px-4 py-2">µg/l</td>
                                  <td className="px-4 py-2">999999</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {viewStep === "chart" && (
                      <LineChart
                        targets={selectedParams.map(param => ({
                          target_type: "parameter",
                          display_name: param,
                          color: chartColorMap[param] || "#0ea5e9",
                          api: `/api/data/${encodeURIComponent(param)}`
                        }))}
                        refreshInterval={refreshInterval}
                        timeRange={timeRange}
                        triggerFetch={triggerFetch}
                      />
                    )}
                  </div>
                </div>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </DialogPanel>
      </div>
    </Dialog>
  );
};

export default WaterQualityDialog;