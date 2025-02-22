import React from 'react';
import {
  Box,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ToggleButton,
  ToggleButtonGroup,
  Stack,
  Typography,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ViewModule as GridViewIcon,
  ViewList as TableViewIcon,
  QrCode as QrCodeIcon,
  Edit as EditIcon,
  LocalShipping as TransferIcon,
  Inventory as StockIcon,
} from '@mui/icons-material';
import { Button } from '@shared/components/base/Button';
import type { CivilianProperty } from '../../../../types/property';
import { getStatusLabel } from '../../../../utils/statusMapping';
import { CivilianStatusChip } from '../../../../components/common/CivilianStatusChip';
import { CivilianChip, CivilianChipColor } from '../../../../components/common/CivilianChip';

interface InventoryListProps {
  items: CivilianProperty[];
  onItemClick: (itemId: string) => void;
  onEditItem: (itemId: string) => void;
  onTransferItem: (itemId: string) => void;
  onViewQR: (itemId: string) => void;
}

export const InventoryList: React.FC<InventoryListProps> = ({
  items,
  onItemClick,
  onEditItem,
  onTransferItem,
  onViewQR,
}) => {
  const [view, setView] = React.useState<'card' | 'table'>('card');

  const handleViewChange = (_: React.MouseEvent<HTMLElement>, newView: 'card' | 'table') => {
    if (newView !== null) {
      setView(newView);
    }
  };

  const getStockLevelColor = (item: CivilianProperty): CivilianChipColor => {
    const currentStock = item.quantity || 0;
    if (currentStock <= item.reorderPoint) return 'error';
    if (currentStock <= item.reorderPoint * 1.5) return 'warning';
    return 'success';
  };

  const renderCardView = () => (
    <Grid container spacing={2}>
      {items.map((item) => (
        <Grid item xs={12} sm={6} md={4} key={item.id}>
          <Card sx={{ p: 2 }}>
            <Stack spacing={2}>
              {/* Item Image or Placeholder */}
              <Box
                sx={{
                  width: '100%',
                  height: 200,
                  borderRadius: 1,
                  bgcolor: 'grey.100',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <StockIcon sx={{ fontSize: 64, color: 'grey.400' }} />
              </Box>

              {/* Item Details */}
              <Stack spacing={1}>
                <Typography variant="h6">{item.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  SKU: {item.serialNumber}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">Stock Level:</Typography>
                  <CivilianChip
                    size="small"
                    color={getStockLevelColor(item)}
                    label={`${item.quantity || 0} units`}
                  />
                </Stack>
                <Typography variant="body2" color="text.secondary">
                  Location: {item.warehouseLocation?.zone} - {item.warehouseLocation?.bin}
                </Typography>
                <CivilianStatusChip 
                  status={item.status}
                  label={getStatusLabel(item.status)}
                />
              </Stack>

              {/* Actions */}
              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Tooltip title="View QR Code">
                  <IconButton size="small" onClick={() => onViewQR(item.id)}>
                    <QrCodeIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => onEditItem(item.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  startIcon={<TransferIcon />}
                  onClick={() => onTransferItem(item.id)}
                >
                  Transfer
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderTableView = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Name/SKU</TableCell>
            <TableCell>Stock Level</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Last Updated</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover onClick={() => onItemClick(item.id)}>
              <TableCell>
                <Stack>
                  <Typography variant="body1">{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.serialNumber}
                  </Typography>
                </Stack>
              </TableCell>
              <TableCell>
                <CivilianChip
                  size="small"
                  color={getStockLevelColor(item)}
                  label={`${item.quantity || 0} units`}
                />
              </TableCell>
              <TableCell>
                {item.warehouseLocation?.zone} - {item.warehouseLocation?.bin}
              </TableCell>
              <TableCell>
                <CivilianStatusChip 
                  status={item.status}
                  label={getStatusLabel(item.status)}
                />
              </TableCell>
              <TableCell>
                {new Date(item.updatedAt).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Tooltip title="View QR Code">
                    <IconButton size="small" onClick={(e) => {
                      e.stopPropagation();
                      onViewQR(item.id);
                    }}>
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditItem(item.id);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<TransferIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onTransferItem(item.id);
                    }}
                  >
                    Transfer
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  return (
    <Stack spacing={2}>
      {/* View Toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={handleViewChange}
          aria-label="view mode"
          size="small"
        >
          <ToggleButton value="card" aria-label="card view">
            <GridViewIcon />
          </ToggleButton>
          <ToggleButton value="table" aria-label="table view">
            <TableViewIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Inventory List */}
      {view === 'card' ? renderCardView() : renderTableView()}
    </Stack>
  );
};
