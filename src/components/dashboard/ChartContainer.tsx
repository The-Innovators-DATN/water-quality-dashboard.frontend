import React from 'react';
import { LineChart } from './charts/LineChart';
import { BarChart } from './charts/BarChart';
import { PieChart } from './charts/PieChart';

interface ChartContainerProps {
  type: 'line' | 'bar' | 'pie';
  title: string;
  showAnomalyMarker?: boolean;
}

const lineChartData = [
  { x: 'Jan', trạm1: 31, trạm2: 41, trạm3: 35 },
  { x: 'Feb', trạm1: 40, trạm2: 24, trạm3: 65 },
  { x: 'Mar', trạm1: 35, trạm2: 40, trạm3: 35 },
  { x: 'Apr', trạm1: 50, trạm2: 45, trạm3: 30 },
  { x: 'May', trạm1: 40, trạm2: 35, trạm3: 45 },
  { x: 'Jun', trạm1: 35, trạm2: 50, trạm3: 40 },
  { x: 'Jul', trạm1: 45, trạm2: 40, trạm3: 30 },
];

const barChartData = [
  { x: 'pH', y: 240 },
  { x: 'Nhiệt độ', y: 300 },
  { x: 'Oxy', y: 180 },
  { x: 'Độ đục', y: 280 },
  { x: 'Nitrat', y: 200 },
  { x: 'Amoni', y: 230 },
];

const pieChartData = [
  { name: 'Sông', value: 44 },
  { name: 'Hồ', value: 55 },
  { name: 'Biển', value: 13 },
  { name: 'Nước ngầm', value: 33 },
];

export const ChartContainer: React.FC<ChartContainerProps> = ({ 
  type, 
  title,
  showAnomalyMarker = false
}) => {
  return (
    <>
      {type === 'line' && (
        <LineChart 
          data={lineChartData} 
          title={title} 
          showAnomalyMarker={showAnomalyMarker} 
        />
      )}
      
      {type === 'bar' && (
        <BarChart 
          data={barChartData} 
          title={title} 
        />
      )}
      
      {type === 'pie' && (
        <PieChart 
          data={pieChartData} 
          title={title} 
        />
      )}
    </>
  );
};