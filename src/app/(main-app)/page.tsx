"use client";

import { Tab } from "@headlessui/react";
import LineChart from "@/components/adminDashboard/charts/LineChart";
import { WidthProvider } from "react-grid-layout";
import GridLayout from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import BarChart from "@/components/adminDashboard/charts/BarChart";
import PieChart from "@/components/adminDashboard/charts/PieChart";
import * as d3 from "d3";
import { useRef, useEffect, useState } from "react";

const ResponsiveGridLayout = WidthProvider(GridLayout);

export default function MainPage() {
    const hours = 24;
    const mockLineData = [
      {
        label: "Lưu lượng",
        color: "#3B82F6",
        values: Array.from({ length: hours }, (_, i) => {
          const time = new Date();
          time.setHours(i, 0, 0, 0);
          const base = 80 + 40 * Math.sin((i / 24) * 2 * Math.PI); // peak at midday
          const value = base + Math.random() * 5;
          return {
            time: time.toISOString(),
            value: Math.round(value),
          };
        }),
      },
    ];

    const stationColors = ["#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6"];
    const basePatterns = [
      () => 20 + Math.sin(Math.random()),
      () => 10,
      () => 5 + Math.random() * 0.5,
      () => 8 + Math.cos(Math.random()),
      () => 7,
    ];
    const mockStationData = Array.from({ length: 5 }, (_, stationIndex) => ({
      label: `Trạm ${stationIndex + 1}`,
      color: stationColors[stationIndex],
      values: Array.from({ length: 12 }, (_, i) => {
        const time = new Date();
        time.setHours(i, 0, 0, 0);
        return {
          time: time.toISOString(),
          value: parseFloat(basePatterns[stationIndex]().toFixed(2)),
        };
      }),
    }));

    const mockBarData = [
        { label: "pH", value: 370 },
        { label: "BOD", value: 460 },
        { label: "Turbidity", value: 310 },
        { label: "Pb", value: 70 },
        { label: "DO", value: 340 },
    ];

    const mockPieData = [
      { label: "Sông", value: 50, color: "#60a5fa" },
      { label: "Suối", value: 20, color: "#99f6e4" },
      { label: "Ao", value: 18, color: "#fbbf24" },
      { label: "Hồ", value: 12, color: "#86efac" },
    ];

    const mockFreqData = [
      {
        label: "Trạm 1",
        color: "#fbbf24",
        values: [280, 300, 320, 310, 300, 295].map((val, i) => ({
          time: new Date(2025, 4, 2, 8 + i).toISOString(),
          value: val,
        })),
      },
      {
        label: "Trạm 2",
        color: "#10b981",
        values: Array(6).fill(400).map((val, i) => ({
          time: new Date(2025, 4, 2, 8 + i).toISOString(),
          value: val,
        })),
      },
      {
        label: "Trạm 3",
        color: "#fca5a5",
        values: [580, 560, 580, 600, 540, 610].map((val, i) => ({
          time: new Date(2025, 4, 2, 8 + i).toISOString(),
          value: val,
        })),
      },
      {
        label: "Trạm 4",
        color: "#fde68a",
        values: Array(6).fill(0).map((val, i) => ({
          time: new Date(2025, 4, 2, 8 + i).toISOString(),
          value: val,
        })),
      },
      {
        label: "Trạm 5",
        color: "#e9d5ff",
        values: [250, 300, 200, 350, 340, 340].map((val, i) => ({
          time: new Date(2025, 4, 2, 8 + i).toISOString(),
          value: val,
        })),
      },
    ];

    return (
        <div className="h-screen p-4">
            <Tab.Group>
                <Tab.List className="w-1/2 flex space-x-4 border-b border-gray-300 mb-4">
                    <Tab className={({ selected }) =>
                        selected
                            ? "px-4 py-2 text-blue-600 border-b-2 border-blue-600"
                            : "px-4 py-2 text-gray-600"
                    }>
                        Tổng quan
                    </Tab>
                    <Tab className={({ selected }) =>
                        selected
                            ? "px-4 py-2 text-blue-600 border-b-2 border-blue-600"
                            : "px-4 py-2 text-gray-600"
                    }>
                        Quản lý tác vụ
                    </Tab>
                </Tab.List>
                <Tab.Panels>
                    <Tab.Panel>
                    <ResponsiveGridLayout
                      className="layout"
                      cols={12}
                      rowHeight={120}
                      isDraggable={false}
                      isResizable={false}
                      margin={[16, 16]}
                    >
                        <div key="chart1" data-grid={{ x: 0, y: 0, w: 5, h: 2 }} className="h-full w-full border rounded-lg">
                            <LineChart data={mockLineData} title="Lưu lượng người dùng" />
                        </div>
                        <div key="chart2" data-grid={{ x: 5, y: 0, w: 7, h: 2 }} className="h-full w-full border rounded-lg">
                            <LineChart data={mockStationData} title="Tình trạng các trạm" />
                        </div>
                        <div key="chart3" data-grid={{ x: 0, y: 3, w: 5, h: 2 }} className="h-full w-full border rounded-lg">
                            <BarChart data={mockBarData} title="Lượng truy cập các chỉ số" />
                        </div>
                        <div key="chart4" data-grid={{ x: 5, y: 3, w: 5, h: 2 }} className="h-full w-full border rounded-lg">
                            <LineChart data={mockFreqData} title="Tần suất truy cập các trạm" />
                        </div>
                        <div key="chart5" data-grid={{ x: 10, y: 3, w: 2, h: 2 }} className="h-full w-full border rounded-lg">
                            <PieChart data={mockPieData} title="Loại trạm" />
                        </div>
                      </ResponsiveGridLayout>
                    </Tab.Panel>
                    <Tab.Panel>
                        <div>Quản lý tác vụ content ở đây</div>
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
}