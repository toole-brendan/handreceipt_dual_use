import React from 'react';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Divider,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  QrCode as QrCodeIcon,
  Edit as EditIcon,
  LocalShipping as TransferIcon,
  History as HistoryIcon,
  Inventory as StockIcon,
} from '@mui/icons-material';
import { Button } from '@shared/components/base/Button';
import { CivilianProperty } from '../../../../types/property';
import { getStatusLabel } from '../../../../utils/statusMapping';
import { CivilianStatusChip } from '../../../../components/common/CivilianStatusChip';
import { CivilianChip } from '../../../../components/common/CivilianChip';

interface ItemDetailsProps {
  item: CivilianProperty;
  onEdit: (id: string) => void;
  onTransfer: (id: string) => void;
  onViewQR: (id: string) => void;
  onClose: () => void;
}

export const ItemDetails: React.FC<ItemDetailsProps> = ({
  item,
  onEdit,
  onTransfer,
  onViewQR,
  onClose,
}) => {
  const getStockLevelColor = () => {
    const currentStock = item.quantity || 0;
    if (currentStock <= item.reorderPoint) return 'error';
    if (currentStock <= item.reorderPoint * 1.5) return 'warning';
    return 'success';
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Item Details
          </Typography>
          <Tooltip title="View QR Code">
            <IconButton size="small" onClick={() => onViewQR(item.id)}>
              <QrCodeIcon />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            size="small"
            startIcon={<EditIcon />}
            onClick={() => onEdit(item.id)}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<TransferIcon />}
            onClick={() => onTransfer(item.id)}
          >
            Transfer
          </Button>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Grid container spacing={3}>
          {/* Basic Info */}
          <Grid item xs={12}>
            <Stack spacing={2}>
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

              <Typography variant="h5">{item.name}</Typography>
              
              <Stack direction="row" spacing={2} alignItems="center">
                <CivilianStatusChip 
                  status={item.status}
                  label={getStatusLabel(item.status)}
                />
                <CivilianChip
                  size="small"
                  color={getStockLevelColor()}
                  label={`${item.quantity || 0} units`}
                />
              </Stack>
            </Stack>
          </Grid>

          {/* Details Grid */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" color="text.secondary">
                Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      SKU
                    </Typography>
                    <Typography variant="body1">
                      {item.serialNumber}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Product Type
                    </Typography>
                    <Typography variant="body1">
                      {item.productType}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Location
                    </Typography>
                    <Typography variant="body1">
                      {item.warehouseLocation?.zone} - {item.warehouseLocation?.bin}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Supplier
                    </Typography>
                    <Typography variant="body1">
                      {item.supplier}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Unit Price
                    </Typography>
                    <Typography variant="body1">
                      ${item.unitPrice.toFixed(2)}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Total Value
                    </Typography>
                    <Typography variant="body1">
                      ${(item.unitPrice * (item.quantity || 0)).toFixed(2)}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          {/* Inventory Management */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Typography variant="subtitle1" color="text.secondary">
                Inventory Management
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Reorder Point
                    </Typography>
                    <Typography variant="body1">
                      {item.reorderPoint} units
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6}>
                  <Stack spacing={1}>
                    <Typography variant="body2" color="text.secondary">
                      Reorder Quantity
                    </Typography>
                    <Typography variant="body1">
                      {item.reorderQuantity} units
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Grid>

          {/* Blockchain Info */}
          <Grid item xs={12}>
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography variant="subtitle1" color="text.secondary">
                  Blockchain Information
                </Typography>
                <Tooltip title="View History">
                  <IconButton size="small">
                    <HistoryIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="body2">
                Blockchain ID: {item.blockchainId}
              </Typography>
              <Typography variant="body2">
                Last Updated: {new Date(item.updatedAt).toLocaleString()}
              </Typography>
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </Card>
  );
};
