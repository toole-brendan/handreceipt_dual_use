import React from 'react';
import { Box, useTheme } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ChartData } from '../../types';

interface MaintenanceChartProps {
  data: ChartData[];
}

export const MaintenanceChart: React.FC<MaintenanceChartProps> = ({ data }) => {
  const theme = useTheme();

  // Mock data - replace with actual data
  const mockData = [
    {
      name: 'Jan',
      completed: 65,
      pending: 28,
      inProgress: 15,
    },
    {
      name: 'Feb',
      completed: 59,
      pending: 32,
      inProgress: 18,
    },
    {
      name: 'Mar',
      completed: 80,
      pending: 25,
      inProgress: 12,
    },
    {
      name: 'Apr',
      completed: 81,
      pending: 30,
      inProgress: 20,
    },
    {
      name: 'May',
      completed: 56,
      pending: 35,
      inProgress: 25,
    },
    {
      name: 'Jun',
      completed: 55,
      pending: 40,
      inProgress: 30,
    },
  ];

  return (
    <Box sx={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={mockData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="completed"
            stackId="a"
            fill={theme.palette.success.main}
            name="Completed"
          />
          <Bar
            dataKey="pending"
            stackId="a"
            fill={theme.palette.warning.main}
            name="Pending"
          />
          <Bar
            dataKey="inProgress"
            stackId="a"
            fill={theme.palette.info.main}
            name="In Progress"
          />
        </BarChart>
      </ResponsiveContainer>
    </Box>
  );
}; 