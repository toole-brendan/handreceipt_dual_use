import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { SalesData } from '../types';

interface SalesChartProps {
  data: SalesData[];
  granularity: 'daily' | 'weekly' | 'monthly';
  onGranularityChange: (value: 'daily' | 'weekly' | 'monthly') => void;
}

export const SalesChart: React.FC<SalesChartProps> = ({
  data,
  granularity,
  onGranularityChange,
}) => {
  const formatDate = (date: string) => {
    const d = new Date(date);
    switch (granularity) {
      case 'daily':
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case 'weekly':
        return `Week ${Math.ceil(d.getDate() / 7)}`;
      case 'monthly':
        return d.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date;
    }
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Sales Over Time</Typography>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>View By</InputLabel>
            <Select
              value={granularity}
              label="View By"
              onChange={(e) => onGranularityChange(e.target.value as any)}
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box sx={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                tickFormatter={(value) => `$${value}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip
                formatter={(value: number) => [`$${value}`, 'Sales']}
                labelFormatter={formatDate}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#388E3C"
                activeDot={{ r: 8 }}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}; 