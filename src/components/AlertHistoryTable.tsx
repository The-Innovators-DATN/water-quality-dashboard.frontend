"use client";

import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

const mockData = Array(100).fill({
  timestamp: "2024-12-13 23:49:00",
  user: "abcxyz",
  station: "Alba Iulia Amonte",
  message: "Chỉ số pH tại trạm Alba Iulia Amonte đã vượt mức 10",
  level: "Cao",
});

const AlertHistoryTable = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const sampleRowRef = useRef<HTMLTableRowElement>(null);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const headerHeight = 40;
  const paginationHeight = 48;
  const extraBuffer = 16;

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      if (!containerRef.current || !sampleRowRef.current) return;

      const containerHeight = containerRef.current.clientHeight;
      const rowHeight = sampleRowRef.current.clientHeight || 42;
      const availableHeight = containerHeight - headerHeight - paginationHeight - extraBuffer;
      const estimatedRows = Math.floor(availableHeight / rowHeight) - 1;

      setRowsPerPage(Math.max(1, estimatedRows));
    });

    if (containerRef.current) resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const totalPages = Math.ceil(mockData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentData = mockData.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  return (
    <div ref={containerRef} className="h-full flex flex-col">
      <h2 className="text-center font-semibold bg-gray-100 py-2">Lịch sử cảnh báo</h2>
      <div className="overflow-x-auto flex-1">
        <table className="min-w-full text-sm text-left table-fixed">
          <thead className="bg-gray-200 text-gray-700 sticky top-0">
            <tr>
              <th className="px-4 py-2 border">Thời gian</th>
              <th className="px-4 py-2 border">Tên</th>
              <th className="px-4 py-2 border">Trạm</th>
              <th className="px-4 py-2 border">Nội dung thông báo</th>
              <th className="px-4 py-2 border">Mức độ</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, index) => (
              <tr key={index} ref={index === 0 ? sampleRowRef : null} className="border-b">
                <td className="px-4 py-2 border">{row.timestamp}</td>
                <td className="px-4 py-2 border">{row.user}</td>
                <td className="px-4 py-2 border">{row.station}</td>
                <td className="px-4 py-2 border">{row.message}</td>
                <td className="px-4 py-2 border text-red-500 font-semibold">{row.level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-2 text-sm text-gray-600 border-t">
        <div>
          {startIndex + 1} - {Math.min(endIndex, mockData.length)} trên {mockData.length}
        </div>
        <div className="flex space-x-2">
          <button onClick={() => goToPage(1)} disabled={currentPage === 1}>
            <ChevronsLeft size={18} />
          </button>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft size={18} />
          </button>
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages}>
            <ChevronRight size={18} />
          </button>
          <button onClick={() => goToPage(totalPages)} disabled={currentPage === totalPages}>
            <ChevronsRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertHistoryTable;