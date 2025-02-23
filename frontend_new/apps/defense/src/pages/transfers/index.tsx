/* frontend/src/pages/transfers/index.page.tsx */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  styled,
  TextField,
  IconButton,
  InputAdornment,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { format } from 'date-fns';

// Base card styling following dashboard pattern
const DashboardCard = styled(Paper)(({ theme }) => ({
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  '& .card-header': {
    padding: theme.spacing(2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& h6': {
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  '& .card-content': {
    padding: theme.spacing(2),
  },
}));

// Mock data
const mockTransfers = [
  {
    id: 'TRF-001',
    itemName: 'M4 Carbine',
    serialNumber: '123456',
    fromUnit: 'Alpha Company',
    toUnit: 'Bravo Company',
    status: 'Pending',
    initiatedBy: 'SGT Smith',
    date: '2024-03-15T10:30:00Z',
  },
  {
    id: 'TRF-002',
    itemName: 'HMMWV',
    serialNumber: '789012',
    fromUnit: 'Charlie Company',
    toUnit: 'HQ Company',
    status: 'Completed',
    initiatedBy: 'LT Johnson',
    date: '2024-03-14T15:45:00Z',
  },
];

const summaryData = {
  totalTransfers: 45,
  pendingTransfers: 12,
  completedTransfers: 30,
  rejectedTransfers: 3,
};

const TransfersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [unit, setUnit] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h4" gutterBottom>
                TRANSFERS
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage and track property transfers between units
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search transfers..."
                size="small"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: 300 }}
              />
              <IconButton>
                <RefreshIcon />
              </IconButton>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SwapHorizIcon />}
              >
                New Transfer
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Summary Cards Section */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard>
              <div className="card-content">
                <Typography variant="h4" color="primary" gutterBottom>
                  {summaryData.totalTransfers}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Transfers
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard>
              <div className="card-content">
                <Typography variant="h4" color="warning.main" gutterBottom>
                  {summaryData.pendingTransfers}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending Transfers
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard>
              <div className="card-content">
                <Typography variant="h4" color="success.main" gutterBottom>
                  {summaryData.completedTransfers}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Completed Transfers
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard>
              <div className="card-content">
                <Typography variant="h4" color="error.main" gutterBottom>
                  {summaryData.rejectedTransfers}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Rejected Transfers
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
        </Grid>

        {/* Filters Section */}
        <DashboardCard sx={{ mb: 3 }}>
          <div className="card-header">
            <Typography variant="h6">Filters</Typography>
          </div>
          <div className="card-content">
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={unit}
                  label="Unit"
                  onChange={(e) => setUnit(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="alpha">Alpha Company</MenuItem>
                  <MenuItem value="bravo">Bravo Company</MenuItem>
                  <MenuItem value="charlie">Charlie Company</MenuItem>
                  <MenuItem value="hq">HQ Company</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </div>
        </DashboardCard>

        {/* Transfers Table Section */}
        <DashboardCard>
          <div className="card-header">
            <Typography variant="h6">Transfer Records</Typography>
          </div>
          <div className="card-content">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Transfer ID</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>From Unit</TableCell>
                    <TableCell>To Unit</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Initiated By</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockTransfers.map((transfer) => (
                    <TableRow key={transfer.id}>
                      <TableCell>{transfer.id}</TableCell>
                      <TableCell>{transfer.itemName}</TableCell>
                      <TableCell>{transfer.serialNumber}</TableCell>
                      <TableCell>{transfer.fromUnit}</TableCell>
                      <TableCell>{transfer.toUnit}</TableCell>
                      <TableCell>
                        <Chip
                          label={transfer.status}
                          color={getStatusColor(transfer.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{transfer.initiatedBy}</TableCell>
                      <TableCell>{format(new Date(transfer.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {transfer.status === 'Pending' && (
                          <Tooltip title="Approve Transfer">
                            <IconButton size="small" color="success">
                              <CheckCircleIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={100}
              page={page}
              onPageChange={(e, newPage) => setPage(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => {
                setRowsPerPage(parseInt(e.target.value, 10));
                setPage(0);
              }}
            />
          </div>
        </DashboardCard>
      </Box>
    </Container>
  );
};

export default TransfersPage;
