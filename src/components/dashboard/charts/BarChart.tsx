'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { ClientOnly } from './ClientOnly';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface BarDataPoint {
  x: string;
  y: number;
}

interface BarChartProps {
  data: BarDataPoint[];
  title: string;
}

export const BarChart: React.FC<BarChartProps> = ({ data, title }) => {
  // Chuyển đổi dữ liệu cho ApexCharts
  const series = [{
    name: 'Truy cập',
    data: data.map(item => item.y)
  }];
  
  const categories = data.map(item => item.x);
  
  const options: ApexOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        borderRadius: 4,
        columnWidth: '50%',
      }
    },
    colors: ['#64B5F6', '#4CAF50'],
    dataLabels: {
      enabled: false
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
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 4
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function(val: number) {
          return val.toString();
        }
      }
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div id="chart">
        <ClientOnly>
          <Chart 
            options={options} 
            series={series} 
            type="bar" 
            height={280} 
          />
        </ClientOnly>
      </div>
    </div>
  );
};