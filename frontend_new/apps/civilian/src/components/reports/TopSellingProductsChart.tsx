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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ReportCard } from './ReportCard';
import { TopSellingProduct, ValueMetric } from '@shared/types/reports';

interface TopSellingProductsChartProps {
  data: TopSellingProduct[];
  metric: ValueMetric;
  onMetricChange: (metric: ValueMetric) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

export const TopSellingProductsChart: React.FC<TopSellingProductsChartProps> = ({
  data,
  metric,
  onMetricChange,
  onExportCSV,
  onExportPDF,
}) => {
  const handleMetricChange = (event: SelectChangeEvent) => {
    onMetricChange(event.target.value as ValueMetric);
  };

  const formatValue = (value: number) => {
    if (metric === 'revenue') {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString();
  };

  const customization = (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="value-metric-label">Metric</InputLabel>
      <Select
        labelId="value-metric-label"
        value={metric}
        label="Metric"
        onChange={handleMetricChange}
      >
        <MenuItem value="revenue">By Revenue</MenuItem>
        <MenuItem value="quantity">By Quantity</MenuItem>
      </Select>
    </FormControl>
  );

  return (
    <ReportCard
      title="Top-Selling Products"
      helpText="View your best-performing products by revenue or quantity sold"
      customization={customization}
      onExportCSV={onExportCSV}
      onExportPDF={onExportPDF}
    >
      <Box sx={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis
              tickFormatter={formatValue}
            />
            <Tooltip
              formatter={(value: number) => formatValue(value)}
            />
            <Legend />
            <Bar
              dataKey={metric === 'revenue' ? 'revenue' : 'quantity'}
              name={metric === 'revenue' ? 'Revenue' : 'Quantity Sold'}
              fill="#82ca9d"
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </ReportCard>
  );
}; 