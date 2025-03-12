'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { ClientOnly } from './ClientOnly';

// ApexCharts phải được import dynamic để tránh lỗi SSR
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface LineDataPoint {
  x: string;
  [key: string]: string | number;
}

interface LineChartProps {
  data: LineDataPoint[];
  title: string;
  showAnomalyMarker?: boolean;
}

export const LineChart: React.FC<LineChartProps> = ({ 
  data, 
  title,
  showAnomalyMarker = false
}) => {
  // Chuyển đổi dữ liệu cho ApexCharts
  const series = Object.keys(data[0])
    .filter(key => key !== 'x')
    .map(key => ({
      name: key,
      data: data.map(item => item[key] as number)
    }));
  
  const categories = data.map(item => item.x);
  
  const colors = ['#FF9800', '#4CAF50', '#2196F3', '#F44336'];
  
  const annotations = showAnomalyMarker ? {
    points: [{
      x: 'Apr',
      y: 50,
      marker: {
        size: 8,
        fillColor: '#ff0000',
        strokeColor: '#fff',
        radius: 2
      },
      label: {
        text: 'Bất thường',
        style: {
          color: '#fff',
          background: '#ff0000'
        }
      }
    }]
  } : undefined;
  
  const options: ApexOptions = {
    chart: {
      type: 'line' as const,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: false
      }
    },
    colors: colors,
    stroke: {
      width: 3,
      curve: 'smooth'
    },
    markers: {
      size: 4,
      hover: {
        size: 6
      }
    },
    xaxis: {
      categories: categories,
      labels: {
        style: {
          colors: '#9ca3af'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: '#9ca3af'
        }
      }
    },
    tooltip: {
      shared: true,
      intersect: false
    },
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4,
      xaxis: {
        lines: {
          show: true
        }
      }
    },
    legend: {
      position: 'top',
      horizontalAlign: 'right'
    },
    annotations: annotations
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div id="chart">
        <ClientOnly>
          <Chart 
            options={options} 
            series={series} 
            type="line" 
            height={280} 
          />
        </ClientOnly>
      </div>
    </div>
  );
};