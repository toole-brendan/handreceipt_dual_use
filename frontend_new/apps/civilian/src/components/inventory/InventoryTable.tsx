import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Tooltip,
  TablePagination,
  Box,
  Typography,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  QrCode as QrCodeIcon,
  Verified as VerifiedIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { InventoryItem, BlockchainVerificationStatus } from '@shared/types/inventory';

interface InventoryTableProps {
  items: InventoryItem[];
  onViewDetails: (item: InventoryItem) => void;
  onEdit: (item: InventoryItem) => void;
  onGenerateQR: (item: InventoryItem) => void;
  page: number;
  rowsPerPage: number;
  totalItems: number;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'IN_STOCK':
      return 'success';
    case 'RESERVED':
      return 'info';
    case 'IN_TRANSIT':
      return 'warning';
    case 'OUT_OF_STOCK':
      return 'error';
    default:
      return 'default';
  }
};

const BlockchainStatus: React.FC<{ status: BlockchainVerificationStatus }> = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'VERIFIED':
        return <VerifiedIcon color="success" />;
      case 'PENDING':
        return <PendingIcon color="warning" />;
      case 'FAILED':
        return <ErrorIcon color="error" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'VERIFIED':
        return 'Verified on Blockchain';
      case 'PENDING':
        return 'Pending Verification';
      case 'FAILED':
        return 'Verification Failed';
    }
  };

  return (
    <Tooltip title={getStatusText()}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {getStatusIcon()}
      </Box>
    </Tooltip>
  );
};

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onViewDetails,
  onEdit,
  onGenerateQR,
  page,
  rowsPerPage,
  totalItems,
  onPageChange,
  onRowsPerPageChange,
}) => {
  if (items.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="text.secondary">
          No inventory items found. Try adjusting your filters.
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Item Name</TableCell>
              <TableCell>SKU</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Roast Date</TableCell>
              <TableCell>Best By Date</TableCell>
              <TableCell>Blockchain</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <TableRow
                key={item.id}
                sx={{
                  backgroundColor: item.quantity <= 10 ? 'error.light' : 'inherit',
                  '&:hover': { backgroundColor: 'action.hover' },
                }}
              >
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.sku}</TableCell>
                <TableCell>
                  {item.category.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ')}
                </TableCell>
                <TableCell>
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell>{item.location}</TableCell>
                <TableCell>
                  <Chip
                    label={item.status.split('_').join(' ')}
                    color={getStatusColor(item.status) as any}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {item.roastDate ? format(new Date(item.roastDate), 'MMM dd, yyyy') : '-'}
                </TableCell>
                <TableCell>
                  {format(new Date(item.bestByDate), 'MMM dd, yyyy')}
                </TableCell>
                <TableCell>
                  <BlockchainStatus status={item.blockchainStatus} />
                </TableCell>
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton size="small" onClick={() => onViewDetails(item)}>
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit">
                    <IconButton size="small" onClick={() => onEdit(item)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Generate QR Code">
                    <IconButton size="small" onClick={() => onGenerateQR(item)}>
                      <QrCodeIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={totalItems}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
}; 