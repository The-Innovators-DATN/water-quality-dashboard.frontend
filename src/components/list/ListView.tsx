"use client";

import { useState, useEffect } from "react";

interface DataItem {
  id: number;
  name: string;
  location: string;
  status: string;
}

const ListView = () => {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Giả lập API call
    setTimeout(() => {
      setData([
        { id: 1, name: "Trạm A", location: "Hà Nội", status: "Hoạt động" },
        { id: 2, name: "Trạm B", location: "TP HCM", status: "Bảo trì" },
        { id: 3, name: "Trạm C", location: "Đà Nẵng", status: "Hoạt động" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="p-4 bg-white shadow-md rounded-md">
      <h2 className="text-lg font-semibold mb-4">Danh sách trạm quan trắc</h2>
      {loading ? (
        <p>Đang tải dữ liệu...</p>
      ) : (
        <table className="w-full border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2">ID</th>
              <th className="border border-gray-300 px-4 py-2">Tên trạm</th>
              <th className="border border-gray-300 px-4 py-2">Vị trí</th>
              <th className="border border-gray-300 px-4 py-2">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{item.id}</td>
                <td className="border border-gray-300 px-4 py-2">{item.name}</td>
                <td className="border border-gray-300 px-4 py-2">{item.location}</td>
                <td className="border border-gray-300 px-4 py-2">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ListView;
