import React from 'react';

export const FilterControls: React.FC = () => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div className="flex space-x-2">
        <button className="bg-blue-500 text-white px-4 py-2 rounded">Tổng quan</button>
        <button className="bg-white text-gray-700 px-4 py-2 rounded border">Quản lý tác vụ</button>
      </div>
      <div className="flex space-x-2">
        <select className="border rounded px-3 py-2">
          <option>6 giờ trước</option>
          <option>12 giờ trước</option>
          <option>24 giờ trước</option>
          <option>7 ngày trước</option>
        </select>
        <select className="border rounded px-3 py-2">
          <option>Trạm</option>
          <option>Loại trạm</option>
          <option>Vị trí</option>
        </select>
        <select className="border rounded px-3 py-2">
          <option>Chọn</option>
          <option>Thống kê</option>
          <option>Xuất báo cáo</option>
        </select>
      </div>
    </div>
  );
};