import React, { useState } from 'react';
import {
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  useTheme,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ReportType } from '../../types';

interface ReportChartProps {
  type: ReportType;
}

// Mock data - replace with actual API data
const MOCK_DATA = {
  inventory: {
    bar: [
      { name: 'M4 Carbine', value: 500 },
      { name: 'HMMWV', value: 50 },
      { name: 'JLTV', value: 30 },
      { name: 'M240B', value: 100 },
    ],
    line: [
      { date: '2024-01', value: 650 },
      { date: '2024-02', value: 680 },
      { date: '2024-03', value: 670 },
      { date: '2024-04', value: 700 },
    ],
    pie: [
      { name: 'Good Condition', value: 550 },
      { name: 'Needs Maintenance', value: 100 },
      { name: 'Critical', value: 50 },
    ],
  },
  transfers: {
    bar: [
      { name: 'Completed', value: 42 },
      { name: 'Pending', value: 5 },
      { name: 'Awaiting', value: 3 },
    ],
    line: [
      { date: '2024-01', value: 35 },
      { date: '2024-02', value: 40 },
      { date: '2024-03', value: 45 },
      { date: '2024-04', value: 50 },
    ],
    pie: [
      { name: 'Completed', value: 42 },
      { name: 'Pending', value: 5 },
      { name: 'Awaiting', value: 3 },
    ],
  },
  maintenance: {
    bar: [
      { name: 'Scheduled', value: 15 },
      { name: 'In Progress', value: 5 },
      { name: 'Completed', value: 20 },
      { name: 'Overdue', value: 2 },
    ],
    line: [
      { date: '2024-01', value: 35 },
      { date: '2024-02', value: 42 },
      { date: '2024-03', value: 38 },
      { date: '2024-04', value: 42 },
    ],
    pie: [
      { name: 'Scheduled', value: 15 },
      { name: 'In Progress', value: 5 },
      { name: 'Completed', value: 20 },
      { name: 'Overdue', value: 2 },
    ],
  },
};

type ChartType = 'bar' | 'line' | 'pie';

export const ReportChart: React.FC<ReportChartProps> = ({ type }) => {
  const theme = useTheme();
  const [chartType, setChartType] = useState<ChartType>('bar');

  const handleChartTypeChange = (_: React.MouseEvent<HTMLElement>, newType: ChartType | null) => {
    if (newType !== null) {
      setChartType(newType);
    }
  };

  const getChartTitle = () => {
    switch (type) {
      case 'inventory':
        return chartType === 'bar'
          ? 'Equipment Distribution'
          : chartType === 'line'
          ? 'Total Inventory Over Time'
          : 'Equipment Status Distribution';
      case 'transfers':
        return chartType === 'bar'
          ? 'Transfer Status Distribution'
          : chartType === 'line'
          ? 'Total Transfers Over Time'
          : 'Transfer Status Breakdown';
      case 'maintenance':
        return chartType === 'bar'
          ? 'Maintenance Task Status'
          : chartType === 'line'
          ? 'Total Maintenance Tasks Over Time'
          : 'Maintenance Task Distribution';
      default:
        return '';
    }
  };

  const renderChart = () => {
    const data = MOCK_DATA[type][chartType];
    const colors = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
    ];

    switch (chartType) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={theme.palette.primary.main} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke={theme.palette.primary.main}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">{getChartTitle()}</Typography>
        <ToggleButtonGroup
          exclusive
          value={chartType}
          onChange={handleChartTypeChange}
          size="small"
        >
          <ToggleButton value="bar">
            <BarChartIcon size={20} />
          </ToggleButton>
          <ToggleButton value="line">
            <LineChartIcon size={20} />
          </ToggleButton>
          <ToggleButton value="pie">
            <PieChartIcon size={20} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      {renderChart()}
    </Box>
  );
}; 