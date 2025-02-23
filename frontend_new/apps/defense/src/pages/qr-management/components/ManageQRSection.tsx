import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TablePagination,
  Grid,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import type { QRCodeDetails, QRStatus } from '../types';

// Mock data - replace with actual data from your API
const mockQRCodes: QRCodeDetails[] = [
  {
    id: 'QR001',
    itemId: '1',
    itemName: 'Rifle, 5.56mm, M4',
    serialNumber: 'SN12345',
    action: {
      type: 'TRANSFER',
      details: {
        recipientName: 'SGT Johnson',
      },
    },
    createdDate: '2024-01-15T10:00:00Z',
    status: 'PENDING',
  },
  // Add more mock data as needed
];

const statusFilters: QRStatus[] = ['PENDING', 'SCANNED', 'EXPIRED', 'CANCELLED'];

interface Props {
  onViewQR: (qrDetails: QRCodeDetails) => void;
}

export const ManageQRSection: React.FC<Props> = ({ onViewQR }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<QRStatus | 'ALL'>('ALL');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: QRStatus) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'SCANNED':
        return 'success';
      case 'EXPIRED':
        return 'error';
      case 'CANCELLED':
        return 'default';
      default:
        return 'default';
    }
  };

  const filteredQRCodes = mockQRCodes
    .filter((qr) => {
      const matchesSearch =
        qr.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        qr.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || qr.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by item name, serial number, or QR code ID"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            select
            label="Filter by Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as QRStatus | 'ALL')}
          >
            <MenuItem value="ALL">All Statuses</MenuItem>
            {statusFilters.map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>QR Code ID</TableCell>
              <TableCell>Item Name</TableCell>
              <TableCell>Serial Number</TableCell>
              <TableCell>Action</TableCell>
              <TableCell>Created Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQRCodes.map((qr) => (
              <TableRow key={qr.id}>
                <TableCell>{qr.id}</TableCell>
                <TableCell>{qr.itemName}</TableCell>
                <TableCell>{qr.serialNumber}</TableCell>
                <TableCell>
                  {qr.action.type}{' '}
                  {qr.action.details.recipientName
                    ? `to ${qr.action.details.recipientName}`
                    : ''}
                </TableCell>
                <TableCell>
                  {new Date(qr.createdDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Chip
                    label={qr.status}
                    color={getStatusColor(qr.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => onViewQR(qr)}
                    title="View Details"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      /* Handle regenerate */
                    }}
                    title="Regenerate QR Code"
                  >
                    <RefreshIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      /* Handle delete */
                    }}
                    title="Delete QR Code"
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={mockQRCodes.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
}; 