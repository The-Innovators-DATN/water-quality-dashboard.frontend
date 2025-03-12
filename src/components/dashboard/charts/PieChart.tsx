'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ApexOptions } from 'apexcharts';
import { ClientOnly } from './ClientOnly';

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface PieDataPoint {
  name: string;
  value: number;
}

interface PieChartProps {
  data: PieDataPoint[];
  title: string;
}

export const PieChart: React.FC<PieChartProps> = ({ data, title }) => {
  const series = data.map(item => item.value);
  const labels = data.map(item => item.name);
  
  const options: ApexOptions = {
    chart: {
      type: 'donut' as const,
    },
    colors: ['#2196F3', '#4CAF50', '#FFC107', '#F44336'],
    labels: labels,
    plotOptions: {
      pie: {
        donut: {
          size: '60%'
        }
      }
    },
    legend: {
      position: 'bottom',
      formatter: function (val: string, opts: { seriesIndex: number; w: { globals: { series: number[] } } }) {
        return `${val} - ${opts.w.globals.series[opts.seriesIndex]}`;
      }
    },
    dataLabels: {
      enabled: false
    },
    responsive: [{
      breakpoint: 480,
      options: {
        chart: {
          width: 200
        },
        legend: {
          position: 'bottom'
        }
      }
    }]
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <h3 className="text-lg font-medium mb-4">{title}</h3>
      <div id="chart">
        <ClientOnly>
          <Chart 
            options={options} 
            series={series} 
            type="donut" 
            height={280} 
          />
        </ClientOnly>
      </div>
    </div>
  );
};