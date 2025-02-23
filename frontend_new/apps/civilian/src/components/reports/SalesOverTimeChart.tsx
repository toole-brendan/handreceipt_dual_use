import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';
import { ReportCard } from './ReportCard';
import { SalesData, TimeGranularity } from '@shared/types/reports';

interface SalesOverTimeChartProps {
  data: SalesData[];
  granularity: TimeGranularity;
  onGranularityChange: (granularity: TimeGranularity) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

export const SalesOverTimeChart: React.FC<SalesOverTimeChartProps> = ({
  data,
  granularity,
  onGranularityChange,
  onExportCSV,
  onExportPDF,
}) => {
  const handleGranularityChange = (event: SelectChangeEvent) => {
    onGranularityChange(event.target.value as TimeGranularity);
  };

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    switch (granularity) {
      case 'daily':
        return format(dateObj, 'MMM dd');
      case 'weekly':
        return `Week ${format(dateObj, 'w')}`;
      case 'monthly':
        return format(dateObj, 'MMM yyyy');
      default:
        return date;
    }
  };

  const formatValue = (value: number) => {
    return `$${value.toLocaleString()}`;
  };

  const customization = (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="time-granularity-label">Granularity</InputLabel>
      <Select
        labelId="time-granularity-label"
        value={granularity}
        label="Granularity"
        onChange={handleGranularityChange}
      >
        <MenuItem value="daily">Daily</MenuItem>
        <MenuItem value="weekly">Weekly</MenuItem>
        <MenuItem value="monthly">Monthly</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <ReportCard
      title="Sales Over Time"
      helpText="Track your sales revenue trends over the selected time period"
      customization={customization}
      onExportCSV={onExportCSV}
      onExportPDF={onExportPDF}
    >
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
            />
            <YAxis
              tickFormatter={formatValue}
            />
            <Tooltip
              formatter={(value: number) => formatValue(value)}
              labelFormatter={(label: string) => formatDate(label)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Sales"
              stroke="#8884d8"
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </ReportCard>
  );
}; 