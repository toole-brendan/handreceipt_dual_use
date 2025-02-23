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
import BuildIcon from '@mui/icons-material/Build';
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
const mockMaintenanceRequests = [
  {
    id: 'MNT-001',
    itemName: 'HMMWV',
    serialNumber: '123456',
    type: 'Scheduled Maintenance',
    priority: 'High',
    status: 'Pending',
    requestedBy: 'SGT Smith',
    date: '2024-03-15T10:30:00Z',
  },
  {
    id: 'MNT-002',
    itemName: 'M4 Carbine',
    serialNumber: '789012',
    type: 'Repair',
    priority: 'Medium',
    status: 'In Progress',
    requestedBy: 'CPL Johnson',
    date: '2024-03-14T15:45:00Z',
  },
];

const summaryData = {
  totalRequests: 45,
  pendingRequests: 12,
  inProgressRequests: 20,
  completedRequests: 13,
};

const MaintenancePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [priority, setPriority] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success';
      case 'in progress':
        return 'info';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
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
                MAINTENANCE
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track and manage equipment maintenance requests
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <TextField
                placeholder="Search maintenance requests..."
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
                startIcon={<BuildIcon />}
              >
                New Request
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
                  {summaryData.totalRequests}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Total Requests
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard>
              <div className="card-content">
                <Typography variant="h4" color="warning.main" gutterBottom>
                  {summaryData.pendingRequests}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Pending
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard>
              <div className="card-content">
                <Typography variant="h4" color="info.main" gutterBottom>
                  {summaryData.inProgressRequests}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  In Progress
                </Typography>
              </div>
            </DashboardCard>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <DashboardCard>
              <div className="card-content">
                <Typography variant="h4" color="success.main" gutterBottom>
                  {summaryData.completedRequests}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary">
                  Completed
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
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={priority}
                  label="Priority"
                  onChange={(e) => setPriority(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </div>
        </DashboardCard>

        {/* Maintenance Requests Table Section */}
        <DashboardCard>
          <div className="card-header">
            <Typography variant="h6">Maintenance Requests</Typography>
          </div>
          <div className="card-content">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Request ID</TableCell>
                    <TableCell>Item Name</TableCell>
                    <TableCell>Serial Number</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Priority</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mockMaintenanceRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.id}</TableCell>
                      <TableCell>{request.itemName}</TableCell>
                      <TableCell>{request.serialNumber}</TableCell>
                      <TableCell>{request.type}</TableCell>
                      <TableCell>
                        <Chip
                          label={request.priority}
                          color={getPriorityColor(request.priority)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={request.status}
                          color={getStatusColor(request.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{request.requestedBy}</TableCell>
                      <TableCell>{format(new Date(request.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <InfoIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {request.status === 'Pending' && (
                          <Tooltip title="Start Maintenance">
                            <IconButton size="small" color="primary">
                              <BuildIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {request.status === 'In Progress' && (
                          <Tooltip title="Complete Maintenance">
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

export default MaintenancePage;
