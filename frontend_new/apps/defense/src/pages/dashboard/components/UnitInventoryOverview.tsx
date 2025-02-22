import React from 'react';
import { Box, Card, Grid, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
}));

const COLORS = ['#2e7d32', '#ed6c02', '#0288d1', '#9e9e9e'];

interface CategoryData {
  name: string;
  value: number;
  count: number;
}

interface CriticalItem {
  name: string;
  issue: string;
  status: 'critical' | 'warning';
}

interface UnitInventoryOverviewProps {
  stats: {
    categories: CategoryData[];
    criticalItems: CriticalItem[];
  };
}

const StatusCell = styled(TableCell)<{ status: 'critical' | 'warning' }>(({ theme, status }) => ({
  color: status === 'critical' ? theme.palette.error.main : theme.palette.warning.main,
  fontWeight: 'bold',
}));

export const UnitInventoryOverview: React.FC<UnitInventoryOverviewProps> = ({ stats }) => {
  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={7}>
        <StyledCard>
          <Typography variant="h6" gutterBottom>
            Property by Category
          </Typography>
          <Box sx={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={stats.categories}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {stats.categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name, props) => [
                    `${value}% (${props.payload.count} items)`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </Box>
        </StyledCard>
      </Grid>

      <Grid item xs={12} md={5}>
        <StyledCard>
          <Typography variant="h6" gutterBottom>
            Critical Items
          </Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Issue</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.criticalItems.map((item, index) => (
                <TableRow key={index} hover>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.issue}</TableCell>
                  <StatusCell status={item.status}>
                    {item.status === 'critical' ? 'Critical' : 'Warning'}
                  </StatusCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </StyledCard>
      </Grid>
    </Grid>
  );
}; 