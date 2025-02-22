import React from 'react';
import { Box, useTheme, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { alpha } from '@mui/material/styles';

// Types
interface InventoryLevel {
  category: string;
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

interface ShipmentStatus {
  status: string;
  count: number;
}

interface DeliveryTrendData {
  date: string;
  onTime: number;
  delayed: number;
}

// Inventory Levels Chart
export const InventoryLevelsChart: React.FC<{ data: InventoryLevel[] }> = ({ data }) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
        <XAxis
          dataKey="category"
          stroke={theme.palette.text.secondary}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: theme.palette.divider }}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          fontSize={12}
          tickLine={false}
          axisLine={{ stroke: theme.palette.divider }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  p: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  boxShadow: theme.shadows[2]
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {payload[0].payload.category}
                </Typography>
                {payload.map((entry) => (
                  <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: entry.color,
                        mr: 1
                      }}
                    />
                    <Typography variant="body2">
                      {entry.name}: {entry.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          }}
        />
        <Legend />
        <Bar dataKey="inStock" name="In Stock" fill={theme.palette.success.main} />
        <Bar dataKey="lowStock" name="Low Stock" fill={theme.palette.warning.main} />
        <Bar dataKey="outOfStock" name="Out of Stock" fill={theme.palette.error.main} />
      </BarChart>
    </ResponsiveContainer>
  );
};

// Shipment Status Chart
export const ShipmentStatusChart: React.FC<{ data: ShipmentStatus[] }> = ({ data }) => {
  const theme = useTheme();
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          outerRadius={80}
          fill="#8884d8"
          dataKey="count"
          nameKey="status"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  p: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  boxShadow: theme.shadows[2]
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {payload[0].payload.status}
                </Typography>
                <Typography variant="body2">
                  Count: {payload[0].value}
                </Typography>
              </Box>
            );
          }}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

// Delivery Trend Chart
export const DeliveryTrendChart: React.FC<{ data: DeliveryTrendData[] }> = ({ data }) => {
  const theme = useTheme();

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={alpha(theme.palette.divider, 0.2)} />
        <XAxis
          dataKey="date"
          stroke={theme.palette.text.secondary}
          fontSize={12}
          tickLine={false}
        />
        <YAxis
          stroke={theme.palette.text.secondary}
          fontSize={12}
          tickLine={false}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <Box
                sx={{
                  bgcolor: 'background.paper',
                  p: 1.5,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 1,
                  boxShadow: theme.shadows[2]
                }}
              >
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  {payload[0].payload.date}
                </Typography>
                {payload.map((entry) => (
                  <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: entry.color,
                        mr: 1
                      }}
                    />
                    <Typography variant="body2">
                      {entry.name}: {entry.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            );
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="onTime"
          name="On Time"
          stroke={theme.palette.success.main}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="delayed"
          name="Delayed"
          stroke={theme.palette.error.main}
          strokeWidth={2}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
