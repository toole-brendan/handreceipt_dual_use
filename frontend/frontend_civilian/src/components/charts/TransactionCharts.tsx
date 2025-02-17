import React from 'react';
import { Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { alpha } from '@mui/material/styles';
import { colors } from '@/styles/theme/colors';

interface TransactionVolumeData {
  date: string;
  count: number;
}

interface TransactionTypeData {
  type: string;
  count: number;
}

const COLORS = [
  colors.info,
  colors.success,
  colors.warning,
  colors.error,
];

const CHART_STYLES = {
  text: {
    fill: colors.text.primary,
  },
  grid: {
    stroke: colors.divider,
  },
};

export const TransactionVolumeChart: React.FC<{ data: TransactionVolumeData[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLES.grid.stroke} />
        <XAxis dataKey="date" tick={CHART_STYLES.text} />
        <YAxis tick={CHART_STYLES.text} />
        <Tooltip contentStyle={{ backgroundColor: colors.background.paper }} />
        <Line
          type="monotone"
          dataKey="count"
          stroke={colors.info}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export const TransactionTypeChart: React.FC<{ data: TransactionTypeData[] }> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ type, percent }) => (
            <text
              x={0}
              y={0}
              fill={colors.text.primary}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {`${type} ${(percent * 100).toFixed(0)}%`}
            </text>
          )}
          outerRadius={80}
          fill={colors.primary}
          dataKey="count"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ backgroundColor: colors.background.paper }} />
      </PieChart>
    </ResponsiveContainer>
  );
};
