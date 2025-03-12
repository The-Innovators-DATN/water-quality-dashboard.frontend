'use client';

import React from 'react';
import { ChartContainer } from '@/components/dashboard/ChartContainer';
import { FilterControls } from '@/components/dashboard/FilterControls';

export default function DashboardPage() {
  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
        <FilterControls />
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-6">
            <ChartContainer type="line" title="Lưu lượng người dùng" />
          </div>
          <div className="col-span-6">
            <ChartContainer type="line" title="Tình trạng các trạm" showAnomalyMarker={true} />
          </div>
          <div className="col-span-6">
            <ChartContainer type="bar" title="Lượng truy cập các chỉ số" />
          </div>
          <div className="col-span-6">
            <ChartContainer type="line" title="Tần suất truy cập các trạm" />
          </div>
          <div className="col-span-3">
            <ChartContainer type="pie" title="Loại trạm" />
          </div>
        </div>
      </main>
    </div>
  );
}