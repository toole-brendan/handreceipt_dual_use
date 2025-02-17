import React from 'react';
import { Box, useTheme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { colors } from '@/styles/theme/colors';
import { PharmaceuticalShipment } from '@/mocks/api/pharmaceuticals-shipments.mock';

interface DeliveryPerformanceData {
  status: string;
  count: number;
}

interface VolumeData {
  date: string;
  shipments: number;
  items: number;
}

const getDeliveryPerformanceData = (shipments: PharmaceuticalShipment[]): DeliveryPerformanceData[] => {
  const statusCounts = shipments.reduce((acc, shipment) => {
    acc[shipment.status] = (acc[shipment.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(statusCounts).map(([status, count]) => ({
    status,
    count
  }));
};

const getVolumeData = (shipments: PharmaceuticalShipment[]): VolumeData[] => {
  // Group shipments by date
  const volumeByDate = shipments.reduce((acc, shipment) => {
    const date = shipment.expectedDeparture.split('T')[0];
    if (!acc[date]) {
      acc[date] = { shipments: 0, items: 0 };
    }
    acc[date].shipments += 1;
    acc[date].items += shipment.items.reduce((sum, item) => sum + item.quantity, 0);
    return acc;
  }, {} as Record<string, { shipments: number; items: number }>);

  return Object.entries(volumeByDate)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, data]) => ({
      date,
      ...data
    }));
};

export const DeliveryPerformanceChart: React.FC<{ shipments: PharmaceuticalShipment[] }> = ({ shipments }) => {
  const theme = useTheme();
  const data = getDeliveryPerformanceData(shipments);
  const COLORS = [colors.success, colors.info, colors.warning, colors.error, colors.secondary];

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius="80%"
            innerRadius="55%"
            fill="#8884d8"
            dataKey="count"
            nameKey="status"
            paddingAngle={2}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS[index % COLORS.length]}
                stroke={theme.palette.background.paper}
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export const ShipmentVolumeChart: React.FC<{ shipments: PharmaceuticalShipment[] }> = ({ shipments }) => {
  const theme = useTheme();
  const data = getVolumeData(shipments);

  return (
    <Box sx={{ width: '100%', height: '100%', p: 2 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={alpha(theme.palette.divider, 0.2)}
            vertical={false}
          />
          <XAxis
            dataKey="date"
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: theme.palette.divider }}
            tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          />
          <YAxis
            stroke={theme.palette.text.secondary}
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: theme.palette.divider }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 4,
            }}
            labelFormatter={(value) => new Date(value).toLocaleDateString()}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
          />
          <Line
            type="monotone"
            dataKey="shipments"
            name="Shipments"
            stroke={colors.primary}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2, fill: theme.palette.background.paper }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="items"
            name="Items"
            stroke={colors.secondary}
            strokeWidth={2}
            dot={{ r: 4, strokeWidth: 2, fill: theme.palette.background.paper }}
            activeDot={{ r: 6, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};
