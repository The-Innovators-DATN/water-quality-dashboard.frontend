"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { format } from "date-fns";

import {
  Monitor, ClipboardList, Table, BarChart, ChevronDown, ChevronUp,
} from "lucide-react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";

import WQIGauge from "@/components/WQIGauge";
import AlertHistoryTable from "@/components/AlertHistoryTable";
// import RefreshSelector from "@/components/RefreshSelector";
// import LineChart from "@/components/charts/LineChart";

export default function StationDetailPage() {
  const params = useParams();
  const stationId = params.stationId;

  const [stationData, setStationData] = useState<StationData | null>(null);
  const [time, setTime] = useState("");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [selectedParams, setSelectedParams] = useState<string[]>([]);
  const [parameters, setParameters] = useState<Parameter[]>([]);
  const [groupedParameters, setGroupedParameters] = useState<Record<string, Parameter[]>>({});

  // const [refreshInterval, setRefreshInterval] = useState(60);
  // const [timeRange, setTimeRange] = useState("24h");
  // const [triggerFetch, setTriggerFetch] = useState(false);

  // const [viewStep, setViewStep] = useState<ViewStep>("select");

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [group]: !prev[group]
    }));
  };

  useEffect(() => {
    setStationData({
      id: Array.isArray(stationId) ? stationId.join(",") : stationId,
      name: "OB",
      coordinates: "45.123/25.456",
      area: "Châu Âu",
      country: "Việt Nam",
      basin: "DANUBE",
      wqi: 120,
    });
  }, [stationId]);

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

  // const handleAction = (action: ActionType) => {
  //   if (selectedParams.length === 0) {
  //     alert("Vui lòng chọn ít nhất một thông số.");
  //     return;
  //   }
  
  //   setActiveAction(action);
  
  //   switch (action) {
  //     case "chart":
  //       setViewStep("chart");
  //       break;
  //     case "stats":
  //       setViewStep("stats"); // Bạn có thể thêm view thống kê nếu có
  //       break;
  //     case "export":
  //       console.log("Exporting report for:", selectedParams);
  //       break;
  //     case "schedule":
  //       console.log("Scheduling report for:", selectedParams);
  //       break;
  //   }
  // };

  useEffect(() => {
    const fetchParameters = async () => {
      try {
        const res = await fetch("/api/parameters");
        const data = await res.json();

        const parameterList = data?.parameters || [];
  
        setParameters(parameterList);
  
        const grouped = parameterList.reduce((acc: Record<string, Parameter[]>, param: Parameter) => {
          const group = param.parameterGroup || "Khác";
          if (!acc[group]) acc[group] = [];
          acc[group].push(param);
          return acc;
        }, {});        
        setGroupedParameters(grouped);
      } catch (err) {
        console.error("Lỗi khi gọi API nội bộ:", err);
      }
    };
  
    fetchParameters();
  }, []);

  console.log(parameters);

  return (
    <div className="w-full h-full p-4">
      <TabGroup className="w-full h-full flex flex-col">
        <TabList className="flex">
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
            <div className="h-full flex">
              <div className="w-52 flex flex-col border-r">
                <div className="w-full h-10 flex justify-center items-center border-b px-2 py-1">
                  <p className="">Chọn thông số</p>
                </div>

                <div className="overflow-auto h-full flex-1">
                  {Object.entries(groupedParameters).map(([group, params]) => (
                    <div key={group} className="border-b p-2">
                      <button
                        onClick={() => toggleGroup(group)}
                        className="w-full flex items-center justify-between text-left font-bold"
                      >
                        {group}
                        {openGroups[group] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>

                      {openGroups[group] && (
                        <div className="mt-2 space-y-1">
                          {params.map((param) => (
                            <div key={param.id} className="flex items-center gap-x-2">
                              <input
                                type="checkbox"
                                checked={selectedParams.includes(param.name)}
                                onChange={() => toggleParam(param.name)}
                              />
                              <label>{param.name}</label>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <TabGroup className="flex flex-col flex-1">
                <TabList className="w-full h-10 flex items-center border-b px-2 py-1">
                  <Tab className="flex items-center gap-x-1 px-2 py-1 data-[selected]:text-blue-500 data-[selected]:border-b-2 data-[selected]:border-blue-500">
                    <BarChart size={20} />
                    <p>Biểu đồ</p>
                  </Tab>
                  <Tab className="flex items-center gap-x-1 px-2 py-1 data-[selected]:text-blue-500 data-[selected]:border-b-2 data-[selected]:border-blue-500">
                    <Table size={20} />
                    <p>Thống kê</p>
                  </Tab>
                </TabList>

                <TabPanels>
                  <TabPanel></TabPanel>
                  <TabPanel className="flex-1 flex flex-col">
                    
                  </TabPanel>

                  
                </TabPanels>
              </TabGroup>
            </div>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}

// const availableParameters = ["pH", "Nhiệt độ nước", "TSS", "NH4", "NO3", "Coliform"];

// const chartColorMap: Record<string, string> = {
//   "pH": "#f59e0b",
//   "Nhiệt độ nước": "#10b981",
//   "TSS": "#3b82f6",
//   "NH4": "#ef4444",
//   "NO3": "#8b5cf6",
//   "Coliform": "#ec4899"
// };

// type ViewStep = "select" | "stats" | "chart";

// type ActionType = "chart" | "export" | "schedule" | "stats";

interface Parameter {
  id: string;
  name: string;
  parameterGroup?: string;
}

interface StationData {
  id?: string;
  name?: string;
  coordinates?: string;
  area?: string;
  country?: string;
  basin?: string;
  wqi?: number;
}