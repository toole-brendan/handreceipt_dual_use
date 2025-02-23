import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Warning as WarningIcon, ShoppingCart as ShoppingCartIcon } from '@mui/icons-material';
import { ReportCard } from './ReportCard';
import { LowStockItem } from '@shared/types/reports';

interface LowStockItemsTableProps {
  data: LowStockItem[];
  onReorder?: (itemId: string) => void;
  onExportCSV?: () => void;
  onExportPDF?: () => void;
}

export const LowStockItemsTable: React.FC<LowStockItemsTableProps> = ({
  data,
  onReorder,
  onExportCSV,
  onExportPDF,
}) => {
  const getStockLevelColor = (currentStock: number, threshold: number): 'error' | 'warning' => {
    return currentStock <= threshold / 2 ? 'error' : 'warning';
  };

  return (
    <ReportCard
      title="Low Stock Items"
      helpText="Items that are below their minimum stock threshold"
      onExportCSV={onExportCSV}
      onExportPDF={onExportPDF}
    >
      <TableContainer component={Paper} elevation={0}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell align="right">Current Stock</TableCell>
              <TableCell align="right">Min. Threshold</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell component="th" scope="row">
                  {item.name}
                </TableCell>
                <TableCell align="right">{item.currentStock}</TableCell>
                <TableCell align="right">{item.minThreshold}</TableCell>
                <TableCell align="right">
                  <Chip
                    icon={<WarningIcon />}
                    label={`${item.currentStock} units remaining`}
                    color={getStockLevelColor(item.currentStock, item.minThreshold)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  {onReorder && (
                    <Tooltip title="Reorder">
                      <IconButton
                        size="small"
                        onClick={() => onReorder(item.id)}
                        color="primary"
                      >
                        <ShoppingCartIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </ReportCard>
  );
}; 