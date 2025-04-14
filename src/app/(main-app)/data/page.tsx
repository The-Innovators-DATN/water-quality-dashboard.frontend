"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, AlertCircle, Loader2, Database } from "lucide-react";
import Link from "next/link";
import { useStationStore } from "@/lib/stores/useStationStore";

export default function DataPage() {
  const [activeTab, setActiveTab] = useState<"stations" | "parameters">("stations");
  const { 
    stations, 
    selectedStations, 
    isLoading, 
    error,
    fetchStations,
    toggleSelectStation,
    selectAllStations,
    deselectAllStations,
    deleteStation
  } = useStationStore();
  
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);
  
  useEffect(() => {
    setSelectAll(selectedStations.length === stations.length && stations.length > 0);
  }, [selectedStations, stations]);

  const handleTabChange = (tab: "stations" | "parameters") => {
    setActiveTab(tab);
  };

  const handleSelectAll = () => {
    if (selectAll) {
      deselectAllStations();
    } else {
      selectAllStations();
    }
    setSelectAll(!selectAll);
  };

  const handleDeleteStation = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa trạm này?")) {
      await deleteStation(id);
    }
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case "Đang hoạt động":
        return "bg-green-500";
      case "Tạm dừng":
        return "bg-yellow-500";
      case "Bảo trì":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  if (isLoading && stations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  if (error && stations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-red-500">
        <AlertCircle className="w-8 h-8 mb-4" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow">
      <div className="flex items-center mb-6">
        <div className="p-4">
          <Database className="stroke-blue-400" size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dữ liệu</h1>
          <p className="text-gray-500">Quản lý nguồn dữ liệu và các trạm quan trắc</p>
        </div>
      </div>

      <div className="w-full flex items-center justify-between mb-4">
        <div className="flex border-b">
          <button
            className={`py-2 px-4 ${activeTab === "stations" ? "border-b-2 border-blue-500 text-blue-500 font-medium" : "text-gray-500"}`}
            onClick={() => handleTabChange("stations")}
          >
            Danh sách các trạm
          </button>
          <button
            className={`py-2 px-4 ${activeTab === "parameters" ? "border-b-2 border-blue-500 text-blue-500 font-medium" : "text-gray-500"}`}
            onClick={() => handleTabChange("parameters")}
          >
            Các chỉ số
          </button>
        </div>

        {
          activeTab === "stations" && (
            <div className="flex justify-end">
              <Link href="/data/stations/new">
                <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Trạm mới
                </button>
              </Link>
            </div>
          )
        }
      </div>

      {isLoading && (
        <div className="mb-4 flex items-center text-blue-500">
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
          <span>Đang cập nhật...</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-2 bg-red-50 text-red-500 rounded flex items-center">
          <AlertCircle className="w-4 h-4 mr-2" />
          <span>{error}</span>
        </div>
      )}

      {activeTab === "stations" && (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">
                  <input 
                    type="checkbox" 
                    checked={selectAll}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="p-3 text-left">ID</th>
                <th className="p-3 text-left">Tên trạm</th>
                <th className="p-3 text-left">Loại</th>
                <th className="p-3 text-left">Thời gian cập nhật lần cuối</th>
                <th className="p-3 text-left">Trạng thái</th>
                <th className="p-3 text-left">Địa chỉ</th>
                <th className="p-3 text-left">Nhà cung cấp</th>
                <th className="p-3 text-left">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {stations.map(station => (
                <tr key={station.id} className="border-b hover:bg-gray-50">
                  <td className="p-3">
                    <input 
                      type="checkbox" 
                      checked={selectedStations.includes(station.id)}
                      onChange={() => toggleSelectStation(station.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="p-3">{station.id}</td>
                  <td className="p-3 text-blue-500 hover:underline">
                    <Link href={`/data/stations/${station.id}`}>
                      {station.name}
                    </Link>
                  </td>
                  <td className="p-3">{station.type}</td>
                  <td className="p-3">{station.lastUpdateTime}</td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColorClass(station.status)}`}></div>
                      {station.status}
                    </div>
                  </td>
                  <td className="p-3">{station.location}</td>
                  <td className="p-3">{station.provider}</td>
                  <td className="p-3">
                    <div className="flex space-x-2">
                      <Link href={`/data/stations/${station.id}/edit`}>
                        <button className="text-blue-500 hover:text-blue-700">
                          <Edit className="w-5 h-5" />
                        </button>
                      </Link>
                      <button 
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteStation(station.id)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {stations.length === 0 && (
            <div className="p-4 text-center text-gray-500">
              <p>Không có dữ liệu trạm. Thêm trạm mới để bắt đầu.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "parameters" && (
        <div className="p-4 border rounded">
          <p className="text-gray-500">Nội dung danh sách các chỉ số sẽ hiển thị ở đây.</p>
        </div>
      )}
    </div>
  );
}