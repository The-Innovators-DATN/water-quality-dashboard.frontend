// pages/components/DetailPageTemplate.tsx
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

import { useParametersStore } from "@/lib/stores/useParametersStore";
import { useStationChart } from "@/lib/hooks/useStationChart";
import { useStationParameters } from "@/lib/hooks/useStationParameters";
import { generateComparisonWidget } from "@/lib/utils/compareHelpers";

import WQIGauge from "@/components/WQIGauge";
import AlertHistoryTable from "@/components/AlertHistoryTable";
import LineChart from "@/components/charts/LineChart";
import StationSidebar from "@/components/water/StationSidebar";
import ChartToolbar from "@/components/water/chart/ChartToolbar";

interface Parameter {
  id: number;
  name: string;
  parameterGroup?: string;
}

interface StationData {
  id?: string;
  name?: string;
  lat?: string;
  long?: string;
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
  };
}) {
  const router = useRouter();
  const stationId = data.station?.id ? parseInt(data.station.id) : 0;
  const allParameters = useParametersStore((state) => state.parameters);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [sidebarHeight, setSidebarHeight] = useState(0);
  const [time, setTime] = useState("");

  const { parameters, grouped } = useStationParameters(stationId);

  const {
    datasets,
    isLoading,
    selectedParams,
    setSelectedParams,
    selectedInterval,
    setSelectedInterval,
    timeRange,
    setTimeRange,
    refresh,
  } = useStationChart(stationId, parameters);

  const toggleParam = (name: string) => {
    setSelectedParams((prev) =>
      prev.includes(name) ? prev.filter((p) => p !== name) : [...prev, name]
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
    });

    console.log("Widget data:", widget);

    localStorage.setItem("compare:widget", JSON.stringify(widget));
    router.push("/dashboard/new");
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(format(new Date(), "H:mm:ss"));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

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
            <Tab key={label} className="p-2 flex flex-col items-center text-xs data-[selected]:text-blue-500 data-[selected]:border-b-2 data-[selected]:border-blue-500">
              <Icon size={16} />
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
                  <p className="text-lg">Chỉ số WQI</p>
                  <WQIGauge value={120} />
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

              <div className="flex-1 flex justify-between items-center px-2 text-sm font-medium">
                {selectedParams.length > 0 && (
                  <>
                    <ChartToolbar
                      interval={selectedInterval}
                      timeRange={timeRange}
                      onIntervalChange={(val) => {
                        setSelectedInterval(val);
                        refresh();
                      }}
                      onTimeRangeChange={(from, to) => {
                        setTimeRange({ from, to });
                        refresh();
                      }}
                      onManualRefresh={refresh}
                    />
                    <button
                      className="ml-2 px-3 py-1 border rounded bg-green-500 text-white hover:bg-green-600"
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
                  <LineChart datasets={datasets} />
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