import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { PieChart } from 'react-minimal-pie-chart';
import { UnitInventoryOverviewProps } from '../types';

interface PieChartData {
  title: string;
  value: number;
  color: string;
}

export const UnitInventoryOverview: React.FC<UnitInventoryOverviewProps> = ({
  stats,
  styles,
  chartColors,
}) => {
  const pieChartData: PieChartData[] = stats.categories.map((category) => ({
    title: category.name,
    value: category.value,
    color: chartColors[category.name.toLowerCase() as keyof typeof chartColors],
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Property Distribution Chart */}
      <Card sx={styles.categoryChart}>
        <CardContent>
          <Typography variant="h6" className="chart-title">
            Property by Category
          </Typography>
          <Box className="chart-container">
            <PieChart
              data={pieChartData}
              lineWidth={20}
              paddingAngle={2}
              // @ts-ignore - types not available
              label={({ dataEntry }) => `${Math.round(dataEntry.percentage)}%`}
              labelStyle={{
                fontSize: '5px',
                fontFamily: 'sans-serif',
                fill: '#fff',
              }}
              labelPosition={75}
            />
          </Box>
          <Box className="chart-legend">
            {pieChartData.map((item) => (
              <Box key={item.title} className="legend-item">
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    backgroundColor: item.color,
                  }}
                />
                <Typography variant="body2">
                  {item.title}: {item.value} items
                </Typography>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Critical Items Table */}
      <Card sx={styles.criticalItems}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Critical Items
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Issue</TableCell>
                <TableCell align="right">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.criticalItems.map((item) => (
                <TableRow key={item.name} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.issue}</TableCell>
                  <TableCell align="right">
                    <Chip
                      label={item.status.toUpperCase()}
                      color={item.status === 'critical' ? 'error' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
}; 