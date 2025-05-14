import React, { useEffect, useState } from "react";
import { useStationStore } from "@/lib/stores/useStationStore";
import { useRouter } from "next/navigation";

const PAGE_SIZE = 10;

export default function StationTable() {
  const { stations, fetchStations, isLoading } = useStationStore();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);

  const translateStatus = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "inactive":
        return "Ngưng hoạt động";
      default:
        return "Không xác định";
    }
  };

  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  const totalPages = Math.ceil(stations.length / PAGE_SIZE);
  const currentData = stations.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  if (isLoading) return <p className="p-4">Đang tải danh sách trạm...</p>;

  return (
    <div className="w-full space-y-2 p-2">
      <div className="rounded-lg border shadow-sm">
        <table className="w-full table-fixed text-xs">
          <thead className="bg-gray-100 text-gray-700">
            <tr className="h-10">
              <th className="w-[160px] px-2 border">Tên trạm</th>
              <th className="w-[120px] px-2 border">Tọa độ</th>
              <th className="w-[120px] px-2 border">Quốc gia</th>
              <th className="w-[180px] px-2 border">Loại trạm</th>
              <th className="w-[120px] px-2 border">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((station) => (
              <tr
                key={station.id}
                onClick={() => router.push(`/water/station/${station.id}`)}
                className="h-10 cursor-pointer hover:bg-blue-50"
              >
                <td className="px-2 border truncate">{station.name}</td>
                <td className="px-2 border text-xs">
                  {station.lat.toFixed(5)}, {station.long.toFixed(5)}
                </td>
                <td className="px-2 border">{station.country}</td>
                <td className="px-2 border truncate" title={station.stationType}>
                  {station.stationType}
                </td>
                <td className="px-2 border">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      station.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {translateStatus(station.status)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end items-center gap-2 mt-1 text-xs">
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Trước
        </button>
        <span>
          Trang {currentPage} / {totalPages}
        </span>
        <button
          className="px-3 py-1 border rounded disabled:opacity-50"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Sau
        </button>
      </div>
    </div>
  );
}
