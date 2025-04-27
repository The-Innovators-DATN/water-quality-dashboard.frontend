"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Database } from "lucide-react";
import Link from "next/link";
import { useStationStore } from "@/lib/stores/useStationStore";
import { useParametersStore } from "@/lib/stores/useParametersStore";
import { usePagination } from "@/lib/hooks/usePagination";

export default function DataPage() {
  const [activeTab, setActiveTab] = useState<"stations" | "parameters">("stations");
  const [searchTerm, setSearchTerm] = useState("");

  const { stations, isLoading: loadingStations, fetchStations } = useStationStore();
  const { parameters, fetchAllParameters } = useParametersStore();

  useEffect(() => {
    fetchStations();
    fetchAllParameters();
  }, [fetchStations, fetchAllParameters]);

  const {
    currentPage,
    setCurrentPage,
    totalPages,
    pageNumbers,
    currentData: currentStations,
    filteredCount: stationCount,
  } = usePagination(stations, 10, (s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const {
    currentData: currentParameters,
    totalPages: parameterTotalPages,
    pageNumbers: parameterPageNumbers,
    currentPage: parameterPage,
    setCurrentPage: setParameterPage,
    filteredCount: parameterCount,
  } = usePagination(parameters, 10, (p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusInfo = (status: "active" | "inactive") => {
    switch (status) {
      case "active": return { label: "Đang hoạt động", color: "bg-green-500" };
      case "inactive": return { label: "Ngừng hoạt động", color: "bg-red-500" };
      default: return { label: "Không xác định", color: "bg-gray-500" };
    }
  };

  const Pagination = ({
    current,
    setCurrent,
    total,
    pages,
  }: {
    current: number;
    setCurrent: (val: number) => void;
    total: number;
    pages: number[];
  }) => (
    <div className="mt-4 flex justify-center gap-1 text-sm flex-wrap">
      <button onClick={() => setCurrent(1)} disabled={current === 1} className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">Đầu</button>
      <button onClick={() => setCurrent(Math.max(1, current - 1))} className="px-2 py-1 border rounded hover:bg-gray-100">«</button>
      {pages.map((page) => (
        <button key={page} onClick={() => setCurrent(page)} className={`px-3 py-1 border rounded ${current === page ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-100"}`}>{page}</button>
      ))}
      <button onClick={() => setCurrent(Math.min(total, current + 1))} className="px-2 py-1 border rounded hover:bg-gray-100">»</button>
      <button onClick={() => setCurrent(total)} disabled={current === total} className="px-2 py-1 border rounded hover:bg-gray-100 disabled:opacity-50">Cuối</button>
    </div>
  );

  return (
    <div className="w-full p-6">
      <div className="flex items-center mb-6">
        <div className="p-4">
          <Database className="stroke-blue-400" size={40} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Dữ liệu</h1>
          <p className="text-gray-500">Quản lý nguồn dữ liệu và các trạm quan trắc</p>
        </div>
      </div>

      <div className="w-full flex flex-wrap items-center justify-between gap-2 border-b mb-4 pb-2">
        <div className="flex">
          <button
            className={`py-2 px-4 text-sm ${
              activeTab === "stations"
                ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("stations")}
          >
            Danh sách các trạm
          </button>
          <button
            className={`py-2 px-4 text-sm ${
              activeTab === "parameters"
                ? "border-b-2 border-blue-500 text-blue-500 font-medium"
                : "text-gray-500"
            }`}
            onClick={() => setActiveTab("parameters")}
          >
            Các chỉ số
          </button>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder={`Tìm theo tên ${activeTab === "stations" ? "trạm" : "chỉ số"}...`}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
              setParameterPage(1);
            }}
            className="border border-gray-300 rounded px-3 py-2 text-sm w-44 sm:w-64"
          />
          <Link href={`/data/${activeTab}/new`}>
            <button className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 text-sm rounded flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              {activeTab === "stations" ? "Trạm mới" : "Chỉ số mới"}
            </button>
          </Link>
        </div>
      </div>

      {activeTab === "stations" ? (
        loadingStations ? (
          <div className="flex flex-col items-center justify-center h-64 text-blue-500">
            <Loader2 className="w-6 h-6 animate-spin mb-2" />
            <p className="text-sm">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm table-auto">
                <thead>
                  <tr className="bg-gray-100 text-xs text-gray-600">
                    <th className="px-2 py-2 text-left w-16">ID</th>
                    <th className="px-2 py-2 text-left">Tên trạm</th>
                    <th className="px-2 py-2 text-left">Loại</th>
                    <th className="px-2 py-2 text-left">Thời gian cập nhật</th>
                    <th className="px-2 py-2 text-left">Trạng thái</th>
                    <th className="px-2 py-2 text-left">Địa chỉ</th>
                    <th className="px-2 py-2 text-left">Nhà cung cấp</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {currentStations.map((station) => {
                    const { label, color } = getStatusInfo(station.status);
                    return (
                      <tr key={station.id} className="border-b hover:bg-gray-50">
                        <td className="px-2 py-2">{station.id}</td>
                        <td className="px-2 py-2 max-w-[160px] truncate" title={station.name}>
                          <Link href={`/data/stations/${station.id}`} className="text-blue-500 hover:underline">
                            {station.name}
                          </Link>
                        </td>
                        <td className="px-2 py-2 max-w-[220px] truncate" title={station.stationType}>
                          {station.stationType}
                        </td>
                        <td className="px-2 py-2">{new Date(station.updatedAt).toLocaleString("vi-VN")}</td>
                        <td className="px-2 py-2">
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-2 ${color}`} />
                            {label}
                          </div>
                        </td>
                        <td className="px-2 py-2">{station.country}</td>
                        <td className="px-2 py-2">{station.stationManager}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {stationCount === 0 && (
              <p className="text-sm text-center text-gray-500 mt-4">Không có dữ liệu phù hợp.</p>
            )}
            {totalPages > 1 && (
              <Pagination current={currentPage} setCurrent={setCurrentPage} total={totalPages} pages={pageNumbers} />
            )}
          </>
        )
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm table-auto">
              <thead>
                <tr className="bg-gray-100 text-xs text-gray-600">
                  <th className="px-2 py-2 text-left w-16">ID</th>
                  <th className="px-2 py-2 text-left">Tên chỉ số</th>
                  <th className="px-2 py-2 text-left">Nhóm</th>
                  <th className="px-2 py-2 text-left">Đơn vị</th>
                  <th className="px-2 py-2 text-left">Mô tả</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                {currentParameters.map((param) => (
                  <tr key={param.id} className="border-b hover:bg-gray-50">
                    <td className="px-2 py-2">{param.id}</td>
                    <td className="px-2 py-2 max-w-[180px] truncate" title={param.name}>{param.name}</td>
                    <td className="px-2 py-2">{param.parameterGroup}</td>
                    <td className="px-2 py-2">{param.unit}</td>
                    <td className="px-2 py-2 max-w-[240px] truncate" title={param.description}>{param.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {parameterCount === 0 && (
            <p className="text-sm text-center text-gray-500 mt-4">Không có chỉ số nào phù hợp.</p>
          )}
          {parameterTotalPages > 1 && (
            <Pagination current={parameterPage} setCurrent={setParameterPage} total={parameterTotalPages} pages={parameterPageNumbers} />
          )}
        </>
      )}
    </div>
  );
}