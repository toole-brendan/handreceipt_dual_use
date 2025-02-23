import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  LinearProgress,
} from '@mui/material';
import { UnitInventoryOverviewProps } from '../types';

export const UnitInventoryOverview: React.FC<UnitInventoryOverviewProps> = ({
  stats,
  onViewAll,
}) => {
  const getStockLevel = (currentStock: number, reorderLevel: number) => {
    const percentage = (currentStock / reorderLevel) * 100;
    if (percentage <= 25) return 'error';
    if (percentage <= 50) return 'warning';
    return 'success';
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Critical Items</Typography>
          <Button
            color="primary"
            onClick={onViewAll}
            sx={{ textTransform: 'none' }}
          >
            View All
          </Button>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Item Name</TableCell>
                <TableCell>Issue</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stats.criticalItems.map((item) => {
                const stockLevel = item.status === 'critical' ? 25 : 50;
                const stockColor = item.status === 'critical' ? 'error' : 'warning';
                
                return (
                  <TableRow
                    key={item.name}
                    sx={{
                      '&:nth-of-type(odd)': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <TableCell>{item.name}</TableCell>
                    <TableCell>{item.issue}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={stockLevel}
                            color={stockColor}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {stockLevel}%
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
}; 