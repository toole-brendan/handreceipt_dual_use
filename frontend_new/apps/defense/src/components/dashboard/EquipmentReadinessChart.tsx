import React from 'react';
import { Box, Paper, Typography, Stack, styled } from '@mui/material';
import DonutChart from './DonutChart';

const ChartContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: 'rgba(0, 0, 0, 0.8)',
  backdropFilter: 'blur(8px)',
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(2),
}));

interface EquipmentStatus {
  status: string;
  count: number;
  color: string;
}

interface EquipmentReadinessChartProps {
  data: EquipmentStatus[];
  totalItems: number;
}

const EquipmentReadinessChart: React.FC<EquipmentReadinessChartProps> = ({
  data,
  totalItems,
}) => {
  // Transform data for the donut chart
  const chartData = data.map(item => ({
    name: item.status,
    value: item.count,
    color: item.color,
  }));

  return (
    <ChartContainer>
      <Typography variant="h6" mb={2}>Equipment Readiness</Typography>
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ flex: 1, height: 300 }}>
          <DonutChart data={chartData} />
        </Box>
        <Stack spacing={2}>
          {data.map((item) => (
            <Box key={item.status}>
              <Typography variant="subtitle2" color="text.secondary">
                {item.status}
              </Typography>
              <Typography variant="h4">
                {((item.count / totalItems) * 100).toFixed(0)}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {item.count} items
              </Typography>
            </Box>
          ))}
        </Stack>
      </Stack>
    </ChartContainer>
  );
};

export default EquipmentReadinessChart;
