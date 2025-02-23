import React from 'react';
import {
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
  Box,
  LinearProgress,
} from '@mui/material';
import { LowStockItem } from '../types';

interface LowStockItemsProps {
  items: LowStockItem[];
  onViewAll: () => void;
}

export const LowStockItems: React.FC<LowStockItemsProps> = ({
  items,
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
          <Typography variant="h6">Low-Stock Items</Typography>
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
                <TableCell align="right">Current Stock</TableCell>
                <TableCell align="right">Reorder Level</TableCell>
                <TableCell>Stock Level</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((item) => {
                const stockPercentage = (item.currentStock / item.reorderLevel) * 100;
                const stockColor = getStockLevel(item.currentStock, item.reorderLevel);
                
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
                    <TableCell align="right">
                      {item.currentStock} {item.unit}
                    </TableCell>
                    <TableCell align="right">
                      {item.reorderLevel} {item.unit}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', mr: 1 }}>
                          <LinearProgress
                            variant="determinate"
                            value={stockPercentage}
                            color={stockColor}
                          />
                        </Box>
                        <Box sx={{ minWidth: 35 }}>
                          <Typography variant="body2" color="text.secondary">
                            {Math.round(stockPercentage)}%
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