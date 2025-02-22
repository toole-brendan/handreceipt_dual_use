import React from 'react';
import { Box } from '@mui/material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface DonutChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  width?: number | string;
  height?: number | string;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  width = '100%',
  height = 300,
}) => {
  return (
    <ResponsiveContainer width={width} height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius="60%"
          outerRadius="80%"
          dataKey="value"
          nameKey="name"
          label={false}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '4px',
          }}
          itemStyle={{ color: 'rgba(255, 255, 255, 0.7)' }}
        />
        <Legend
          verticalAlign="middle"
          align="right"
          layout="vertical"
          wrapperStyle={{
            paddingLeft: '20px',
          }}
          formatter={(value: string) => (
            <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default DonutChart;
