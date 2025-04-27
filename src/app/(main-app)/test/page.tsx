"use client";

import GridLayout from "react-grid-layout";
import { WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

const ResponsiveGridLayout = WidthProvider(GridLayout);

const layout = [
  { i: "chart1", x: 0, y: 0, w: 6, h: 4 },
  { i: "chart2", x: 6, y: 0, w: 6, h: 4 },
  { i: "chart3", x: 0, y: 4, w: 6, h: 4 },
];

export default function CustomDashboard() {
  return (
    <ResponsiveGridLayout
      className="layout border-2 border-gray-300"
      layout={layout}
      cols={12}
      rowHeight={100}
    >
      <div key="chart1" className="bg-white shadow rounded">Biểu đồ 1</div>
      <div key="chart2" className="bg-white shadow rounded">Biểu đồ 2</div>
      <div key="chart3" className="bg-white shadow rounded">Biểu đồ 3</div>
    </ResponsiveGridLayout>
  );
}