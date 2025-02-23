import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  IconButton,
  Typography,
} from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { PaymentChartData, PaymentStatusDistribution, TopEntity } from '@shared/types/payments';
import { formatCurrency } from '@shared/utils/formatting';

interface PaymentsAnalyticsProps {
  expanded: boolean;
  onToggle: () => void;
  timelineData: PaymentChartData[];
  statusDistribution: PaymentStatusDistribution[];
  topEntities: TopEntity[];
}

const COLORS = {
  incoming: '#2e7d32',
  outgoing: '#d32f2f',
  completed: '#4caf50',
  pending: '#ff9800',
  failed: '#f44336',
};

export const PaymentsAnalytics: React.FC<PaymentsAnalyticsProps> = ({
  expanded,
  onToggle,
  timelineData,
  statusDistribution,
  topEntities,
}) => {
  const formatTooltipValue = (value: number) => formatCurrency(value);

  return (
    <Card sx={{ mt: 3 }}>
      <CardHeader
        title="Analytics"
        action={
          <IconButton onClick={onToggle}>
            {expanded ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        }
      />
      {expanded && (
        <CardContent>
          <Grid container spacing={3}>
            {/* Payments Over Time Chart */}
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <Typography variant="h6" gutterBottom>
                  Payments Over Time
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis tickFormatter={formatTooltipValue} />
                    <Tooltip
                      formatter={formatTooltipValue}
                      labelFormatter={(value) => new Date(value as string).toLocaleDateString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="incoming"
                      stroke={COLORS.incoming}
                      name="Incoming"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="outgoing"
                      stroke={COLORS.outgoing}
                      name="Outgoing"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Grid>

            {/* Payment Status Distribution Chart */}
            <Grid item xs={12} md={6}>
              <Box sx={{ height: 300 }}>
                <Typography variant="h6" gutterBottom>
                  Payment Status Distribution
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusDistribution}
                      dataKey="amount"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={(entry) => `${entry.status}: ${formatCurrency(entry.amount)}`}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell
                          key={entry.status}
                          fill={
                            entry.status === 'COMPLETED'
                              ? COLORS.completed
                              : entry.status === 'PENDING'
                              ? COLORS.pending
                              : COLORS.failed
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={formatTooltipValue} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Grid>

            {/* Top Recipients/Suppliers Chart */}
            <Grid item xs={12}>
              <Box sx={{ height: 300 }}>
                <Typography variant="h6" gutterBottom>
                  Top Recipients/Suppliers
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topEntities}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={formatTooltipValue} />
                    <Tooltip
                      formatter={formatTooltipValue}
                      labelFormatter={(value) => `Entity: ${value}`}
                    />
                    <Legend />
                    <Bar
                      dataKey="totalAmount"
                      name="Total Amount"
                      fill={COLORS.incoming}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      )}
    </Card>
  );
};

export default PaymentsAnalytics; 