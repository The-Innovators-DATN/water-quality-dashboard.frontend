"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import {
  Monitor,
  LayoutDashboard,
  Table,
} from "lucide-react";

import { generateComparisonWidget } from "@/lib/utils/compareHelpers";

import AlertHistoryTable from "@/components/AlertHistoryTable";
import LineChart from "@/components/charts/LineChart";
import StationSidebar from "@/components/water/StationSidebar";
import ChartToolbar from "@/components/water/chart/ChartToolbar";
import { useStationChart } from "@/lib/hooks/useStationChart";
import { useStationParameters } from "@/lib/hooks/useStationParameters";
import { getTimeRangeFromLabel } from "@/components/water/chart/timeOptions";

interface WeatherData {
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
}

interface StationData {
  id?: string;
  name?: string;
  lat?: number;
  long?: number;
  status?: string;
  stationType?: string;
  country?: string;
}

interface LocationData {
  catchmentName?: string;
  riverBasinName?: string;
}

export default function DetailPageTemplate({
  label,
  data,
}: {
  label: string;
  data: {
    station: StationData;
    location: LocationData;
    weather?: WeatherData;
  };
}) {
  const router = useRouter();
  const stationId = data.station?.id ? parseInt(data.station.id) : 0;
  const allParameters = JSON.parse(localStorage.getItem('parameters-store') || '{}').state.parameters;

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const [time, setTime] = useState("");

  const stationData = JSON.parse(localStorage.getItem(`stations-data`) || '{}')[stationId] ?? {};

  const [selectedParams, setSelectedParams] = useState<string[]>(stationData.selectedParams || []);
  const [selectedInterval, setSelectedInterval] = useState<number>(stationData.selectedInterval || 0);
  const [timeRange, setTimeRange] = useState<{ from: Date | string; to: Date | string }>(stationData.timeRange || { from: "now-1d", to: "now" });
  const [timeLabel, setTimeLabel] = useState<string | null>(stationData.timeLabel || "1 ngày trước");
  const [forecastEnabled, setForecastEnabled] = useState<boolean>(stationData.forecastEnabled || false);
  const [anomalyEnabled, setAnomalyEnabled] = useState<boolean>(stationData.anomalyEnabled || false);
  const [timeStep, setTimeStep] = useState<number>(stationData.timeStep || 3600);
  const [horizon, setHorizon] = useState<number>(stationData.horizon || 5);

  const { parameters, grouped } = useStationParameters(stationId);
  const { datasets, isLoading, refresh } = useStationChart({
    stationId,
    parameters,
    selectedParams,
    selectedInterval,
    timeRange,
    forecastEnabled,
    anomalyEnabled,
    timeStep,
    horizon,
    setSelectedParams,
    setSelectedInterval,
    setTimeRange,
    setForecastEnabled,
    setAnomalyEnabled,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(format(new Date(), "H:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (timeLabel) {
      const timeRange = getTimeRangeFromLabel(timeLabel);

      setTimeRange(timeRange);
    }
  }, [timeLabel]);

  useEffect(() => {
    const stationData = {
      selectedParams,
      selectedInterval,
      timeRange,
      timeLabel,
      timeStep,
      horizon,
      forecastEnabled,
      anomalyEnabled,
    };


    const allStationsData = JSON.parse(localStorage.getItem('stations-data') || '{}');
    allStationsData[stationId] = stationData;
    localStorage.setItem('stations-data', JSON.stringify(allStationsData));
  }, [stationId, selectedParams, selectedInterval, timeRange, timeLabel, forecastEnabled, anomalyEnabled, timeStep, horizon]);

  const toggleParam = (name: string) => {
    setSelectedParams(
      selectedParams.includes(name)
        ? selectedParams.filter((p) => p !== name)
        : [...selectedParams, name]
    );
  };

  const handleCompareClick = () => {
    if (selectedParams.length === 0) {
      toast.error("Bạn cần chọn ít nhất một thông số để so sánh.");
      return;
    }

    const widget = generateComparisonWidget({
      stationId,
      selectedParams,
      allParameters,
      timeRange,
      interval: selectedInterval,
      timeLabel,
      timeStep,
      horizon,
      anomalyEnabled,
      forecastEnabled,
    });

    console.log("Widget data:", widget);

    localStorage.setItem("compare:widget", JSON.stringify(widget));
    router.push("/dashboard/new");
  };

  useEffect(() => {
    if (!sidebarRef.current) return;
    const observer = new ResizeObserver(() => {
      setSidebarHeight(sidebarRef.current?.offsetHeight || 0);
    });
    observer.observe(sidebarRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="w-full h-[calc(100%-40px)] p-4">
      <TabGroup className="w-full h-full flex flex-col">
        <TabList className="w-full flex">
          {[
            { icon: Monitor, label: "Tổng quan" },
            { icon: LayoutDashboard, label: "Bảng điều khiển" },
            { icon: Table, label: "Thống kê" },
          ].map(({ icon: Icon, label }) => (
            <Tab key={label} className="p-2 flex flex-col items-center text-xs data-[selected]:text-blue-500 data-[selected]:border-b-2 data-[selected]:border-blue-500 space-y-1">
              <Icon size={20} />
              <span>{label}</span>
            </Tab>
          ))}
        </TabList>

        <TabPanels className="flex-1 mt-1 border rounded-lg overflow-hidden flex flex-col">
          <TabPanel className="grid grid-rows-4 flex-1">
            <div className="row-span-1 bg-blue-500 text-white p-2 rounded-t-lg space-y-2">
              <p className="font-bold">{label}: {data.station.name}</p>
              <div className="w-1/2 h-1 bg-white"></div>
              <div className="w-1/2 flex justify-between text-sm">
                <div className="w-1/3">
                  <p>ID: {data.station.id}</p>
                  <p>Vĩ độ: {data.station.lat}</p>
                  <p>Kinh độ: {data.station.long}</p>
                  <p>Trạng thái: {data.station.status === "active" ? "Đang hoạt động" : "Không hoạt động"}</p>
                </div>
                <div className="w-2/3">
                  <p>Loại trạm: {data.station.stationType}</p>
                  <p>Quốc gia: {data.station.country}</p>
                  <p>Lưu vực: {data.location.catchmentName}</p>
                  <p>Sông: {data.location.riverBasinName}</p>
                </div>
              </div>
            </div>

            <div className="row-span-3 flex gap-4 p-4">
              <div className="w-1/4 flex flex-col gap-4">
                <div className="bg-gray-200 rounded-lg p-4 flex flex-col items-center flex-1">
                  <p className="text-lg">Giờ hiện tại</p>
                  <p className="text-6xl">{time}</p>
                </div>
                <div className="bg-gray-200 rounded-lg p-4 flex flex-col items-center flex-1">
                  <p className="text-lg mb-2">Thời tiết hiện tại</p>
                  {data.weather ? (
                    <>
                      <p className="text-2xl font-semibold">{data.weather.main?.temp}°C</p>
                      <p className="capitalize">{data.weather.weather?.[0]?.description}</p>
                      <p>Độ ẩm: {data.weather.main?.humidity}%</p>
                      <p>Gió: {data.weather.wind?.speed} m/s</p>
                    </>
                  ) : (
                    <p className="text-sm italic text-gray-500">Không có dữ liệu thời tiết</p>
                  )}
                </div>
              </div>

              <div className="w-3/4 h-full overflow-auto">
                <AlertHistoryTable />
              </div>
            </div>
          </TabPanel>

          <TabPanel className="w-full h-full flex flex-col">
            <div className="w-full h-10 flex border-b">
              <div className="w-52 h-full border-r flex justify-center items-center">
                <p>Chọn thông số</p>
              </div>

              <div className="w-[calc(100%-208px)] flex-1 flex justify-between items-center px-2 text-sm font-medium">
                {selectedParams.length > 0 && (
                  <>
                    <ChartToolbar
                      interval={selectedInterval}
                      timeLabel={timeLabel}
                      timeRange={timeRange}
                      onIntervalChange={(val) => {
                        setSelectedInterval(val);
                        refresh();
                      }}
                      onTimeRangeChange={(from, to) => {
                        setTimeRange({ from, to });
                        refresh();
                      }}
                      onChangeTimeLabel={(label) => {
                        setTimeLabel(label);
                        refresh();
                      }}
                      onManualRefresh={refresh}
                      predictionEnabled={forecastEnabled}
                      onTogglePrediction={(val) => {
                        setForecastEnabled(val);
                        refresh();
                      }}
                      anomalyEnabled={anomalyEnabled}
                      onToggleAnomaly={(val) => {
                        setAnomalyEnabled(val);
                        refresh();
                      }}
                      timeStep={timeStep}
                      horizon={horizon}
                      onTimeStepChange={(val) => {
                        setTimeStep(val);
                        refresh();
                      }}
                      onHorizonChange={(val) => {
                        setHorizon(val);
                        refresh();
                      }}
                    />
                    <button
                      className="h-8 ml-2 px-3 py-1 border rounded bg-green-500 text-white hover:bg-green-600 whitespace-nowrap"
                      onClick={handleCompareClick}
                    >
                      So sánh với trạm khác
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="w-full h-[calc(100%-32px)] flex">
              <div ref={sidebarRef}>
                <StationSidebar
                  groupedParameters={grouped}
                  selectedParams={selectedParams}
                  toggleParam={toggleParam}
                  sidebarHeight={sidebarHeight}
                  openGroups={openGroups}
                  setOpenGroups={setOpenGroups}
                />
              </div>

              <div className="flex-1 p-4 overflow-y-auto text-sm text-gray-600">
                {isLoading ? (
                  <p className="text-gray-500 italic">Đang tải dữ liệu...</p>
                ) : datasets.length > 0 && selectedParams.length > 0 ? (
                  <LineChart datasets={datasets} timeRange={timeRange} />
                ) : (
                  <p className="text-gray-500 italic">Chưa có chỉ số nào được chọn.</p>
                )}
              </div>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}