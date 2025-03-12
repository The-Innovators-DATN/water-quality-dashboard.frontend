"use client";

import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogOverlay,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import { CloudSun } from "lucide-react";

// TypeScript interfaces
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

const WaterQualityDialog: React.FC<WaterQualityDialogProps> = ({ 
  isOpen, 
  onOpenChange, 
  stationData, 
  weatherData,
  measurementData 
}) => {
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  
  // Format time as 00:00:00
  const formatTime = (seconds: number = 0): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 z-[9998]" />
      <DialogContent className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[9999] max-w-[90%] w-[90%] max-h-[90%] h-[90%] bg-white shadow-lg rounded-lg p-0 overflow-auto">
        <button 
          onClick={() => onOpenChange(false)} 
          className="absolute top-3 right-3 z-10 rounded-full p-1 hover:bg-gray-100"
          aria-label="Đóng"
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12.8536 2.85355C13.0488 2.65829 13.0488 2.34171 12.8536 2.14645C12.6583 1.95118 12.3417 1.95118 12.1464 2.14645L7.5 6.79289L2.85355 2.14645C2.65829 1.95118 2.34171 1.95118 2.14645 2.14645C1.95118 2.34171 1.95118 2.65829 2.14645 2.85355L6.79289 7.5L2.14645 12.1464C1.95118 12.3417 1.95118 12.6583 2.14645 12.8536C2.34171 13.0488 2.65829 13.0488 2.85355 12.8536L7.5 8.20711L12.1464 12.8536C12.3417 13.0488 12.6583 13.0488 12.8536 12.8536C13.0488 12.6583 13.0488 12.3417 12.8536 12.1464L8.20711 7.5L12.8536 2.85355Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" />
          </svg>
        </button>
        <DialogHeader className="px-4 pt-4 pb-2 hidden">
          <DialogTitle>Chi tiết trạm quan trắc chất lượng nước</DialogTitle>
        </DialogHeader>
        
        {/* Custom Tabs Header */}
        <div className="w-full sticky top-0 bg-white z-10 border-b">
          <div className="grid grid-cols-2">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`py-4 text-center transition-colors ${
                activeTab === "dashboard" 
                  ? "bg-white border-b-2 border-blue-500 font-medium" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Bảng điều khiển
            </button>
            <button
              onClick={() => setActiveTab("parameters")}
              className={`py-4 text-center transition-colors ${
                activeTab === "parameters" 
                  ? "bg-white border-b-2 border-blue-500 font-medium" 
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              Các thông số
            </button>
          </div>
        </div>

        {/* Dashboard Tab Content */}
        {activeTab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {/* Station Info - Dark Blue Header */}
            <div className="col-span-2 bg-blue-800 text-white p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xl font-bold">{stationData?.name ?? "ALBA IULIA AMONTE"}</h3>
                  <p className="text-sm mt-2">ID trạm: {stationData?.id ?? "RO/000/03"}</p>
                  <p className="text-sm mt-2">Kinh vĩ: {stationData?.coordinates ?? "46.074/23"}</p>
                  <p className="text-sm mt-2">Lưu vực: {stationData?.basin ?? "DANUBE"}</p>
                </div>
                <div>
                  <p className="text-sm">Khu vực: {stationData?.area ?? "Chưa Âu"}</p>
                  <p className="text-sm mt-2">Quốc gia: {stationData?.country ?? "Romania"}</p>
                </div>
              </div>
            </div>

            {/* Weather Card */}
            <div className="bg-white border text-center flex flex-col items-center justify-center p-4">
              <div className="flex items-center justify-center">
                <CloudSun size={48} className="text-gray-500" />
                <div className="ml-2">
                  <h2 className="text-4xl font-bold">{weatherData?.temperature ?? "27°C"}</h2>
                  <p className="text-sm">
                    {weatherData?.condition ?? "Trời nhiều mây"}
                  </p>
                </div>
              </div>
            </div>

            {/* Timer Card */}
            <div className="border p-4 mt-2">
              <p className="text-center text-sm mb-2">Giờ hiện tại</p>
              <h2 className="text-5xl font-bold text-center text-gray-800">
                {formatTime(weatherData?.elapsedTime ?? 2358)}
              </h2>
            </div>

            {/* WQI Gauge Card */}
            <div className="border p-4 mt-2">
              <p className="text-center text-sm mb-2">Chỉ số WQI</p>
              <div className="flex justify-center">
                <div className="w-40 h-40 relative">
                  <div className="w-full h-full rounded-full border-8 border-gray-200 flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">{stationData?.wqi ?? "75"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Table */}
            <div className="col-span-2 border p-4 mt-2">
              <div className="overflow-x-auto">
                <p className="text-sm mb-2">Lịch sử cảnh báo</p>
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thời gian</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạm</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nội dung thông báo</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mức độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {(measurementData ?? Array(5).fill({})).map((record, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 text-sm">{record?.timestamp ?? "2024-12-13 23:49:00"}</td>
                        <td className="px-4 py-2 text-sm">{record?.user ?? "abcxyz"}</td>
                        <td className="px-4 py-2 text-sm">{record?.station ?? "Alba Iulia Amonte"}</td>
                        <td className="px-4 py-2 text-sm">{record?.message ?? "Chỉ số pH tại trạm Alba Iulia Amonte đã vượt mức 10"}</td>
                        <td className="px-4 py-2 text-sm">
                          <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                            {record?.level ?? "Cao"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm text-gray-500">1 - 5 trên 10</span>
                  <div className="flex space-x-2">
                    <button className="p-1 border rounded">
                      <span className="sr-only">First</span>
                      ⟪
                    </button>
                    <button className="p-1 border rounded">
                      <span className="sr-only">Previous</span>
                      ⟨
                    </button>
                    <button className="p-1 border rounded">
                      <span className="sr-only">Next</span>
                      ⟩
                    </button>
                    <button className="p-1 border rounded">
                      <span className="sr-only">Last</span>
                      ⟫
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Parameters Tab Content */}
        {activeTab === "parameters" && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border p-4 rounded-lg">
                <h3 className="font-medium mb-2">Thông số vật lý</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Nhiệt độ</span>
                    <span className="font-medium">24.5°C</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Độ đục</span>
                    <span className="font-medium">5.2 NTU</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Độ dẫn điện</span>
                    <span className="font-medium">320 μS/cm</span>
                  </li>
                </ul>
              </div>
              
              <div className="border p-4 rounded-lg">
                <h3 className="font-medium mb-2">Thông số hóa học</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>pH</span>
                    <span className="font-medium">7.8</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Oxy hòa tan (DO)</span>
                    <span className="font-medium">6.5 mg/L</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Nitrate</span>
                    <span className="font-medium">2.1 mg/L</span>
                  </li>
                </ul>
              </div>
              
              <div className="border p-4 rounded-lg">
                <h3 className="font-medium mb-2">Kim loại nặng</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>Chì (Pb)</span>
                    <span className="font-medium">0.002 mg/L</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Thủy ngân (Hg)</span>
                    <span className="font-medium">&lt; 0.001 mg/L</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Asen (As)</span>
                    <span className="font-medium">0.003 mg/L</span>
                  </li>
                </ul>
              </div>
              
              <div className="border p-4 rounded-lg">
                <h3 className="font-medium mb-2">Vi sinh vật</h3>
                <ul className="space-y-2">
                  <li className="flex justify-between">
                    <span>E. coli</span>
                    <span className="font-medium">120 CFU/100mL</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Coliform tổng</span>
                    <span className="font-medium">350 CFU/100mL</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default WaterQualityDialog;