import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  IconButton,
  Card,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Link,
  TablePagination,
  styled,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import InfoIcon from '@mui/icons-material/Info';
import WarningIcon from '@mui/icons-material/Warning';
import BuildIcon from '@mui/icons-material/Build';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import LinkIcon from '@mui/icons-material/Link';
import { format } from 'date-fns';
import { useProperty } from '../../hooks/useProperty';
import { PropertySkeleton } from '../../components/property';
import { ErrorDisplay } from '../../components/common/ErrorDisplay';

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

interface PropertyItem {
  id: string;
  name: string;
  serialNumber: string;
  condition: 'Good' | 'Fair' | 'Poor';
  readiness: 'Operational' | 'Needs Maintenance' | 'In Repair';
  issuedDate: string;
}

const PropertyPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [condition, setCondition] = useState('all');
  const [readiness, setReadiness] = useState('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const {
    loadSummary,
    loadEquipmentList,
    loadComplianceStatus,
    loading,
    error,
  } = useProperty();

  const handleRetry = useCallback(() => {
    loadSummary();
    loadEquipmentList();
    loadComplianceStatus();
    setLastUpdated(new Date());
  }, [loadSummary, loadEquipmentList, loadComplianceStatus]);

  useEffect(() => {
    loadSummary();
    loadEquipmentList();
    loadComplianceStatus();
  }, [loadSummary, loadEquipmentList, loadComplianceStatus]);

  // Mock data for demonstration
  const summaryData = {
    totalItems: 15,
    goodCondition: 12,
    needsMaintenance: 2,
    overdueTasks: 1,
  };

  const mockItems: PropertyItem[] = [
    {
      id: '1',
      name: 'M4 Carbine',
      serialNumber: '123456',
      condition: 'Good',
      readiness: 'Operational',
      issuedDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Kevlar Helmet',
      serialNumber: '789012',
      condition: 'Fair',
      readiness: 'Needs Maintenance',
      issuedDate: '2024-03-10',
    },
    {
      id: '3',
      name: 'Radio Set',
      serialNumber: '345678',
      condition: 'Good',
      readiness: 'Operational',
      issuedDate: '2024-02-20',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Good':
      case 'Operational':
        return 'success';
      case 'Fair':
      case 'Needs Maintenance':
        return 'warning';
      case 'Poor':
      case 'In Repair':
        return 'error';
      default:
        return 'default';
    }
  };

  const renderHeader = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          MY PROPERTY
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage and track your assigned equipment
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <TextField
          placeholder="Search by item name or serial number..."
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
        <IconButton onClick={handleRetry}>
          <RefreshIcon />
        </IconButton>
      </Box>
    </Box>
  );

  const renderSummaryCards = () => (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      <Grid item xs={12} sm={6} md={3}>
        <DashboardCard>
          <div className="card-content">
            <Typography variant="h4" color="primary" gutterBottom>
              {summaryData.totalItems}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Total Items
            </Typography>
          </div>
        </DashboardCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <DashboardCard>
          <div className="card-content">
            <Typography variant="h4" color="success.main" gutterBottom>
              {summaryData.goodCondition} ({Math.round((summaryData.goodCondition / summaryData.totalItems) * 100)}%)
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Good Condition
            </Typography>
          </div>
        </DashboardCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <DashboardCard>
          <div className="card-content">
            <Typography variant="h4" color="warning.main" gutterBottom>
              {summaryData.needsMaintenance}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Needs Maintenance
            </Typography>
          </div>
        </DashboardCard>
      </Grid>
      <Grid item xs={12} sm={6} md={3}>
        <DashboardCard>
          <div className="card-content">
            <Typography variant="h4" color="error.main" gutterBottom>
              {summaryData.overdueTasks}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary">
              Overdue Tasks
            </Typography>
          </div>
        </DashboardCard>
      </Grid>
    </Grid>
  );

  const renderFilters = () => (
    <DashboardCard sx={{ mb: 3 }}>
      <div className="card-header">
        <Typography variant="h6">Filters</Typography>
      </div>
      <div className="card-content">
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="weapons">Weapons</MenuItem>
              <MenuItem value="gear">Personal Gear</MenuItem>
              <MenuItem value="comms">Communication</MenuItem>
              <MenuItem value="vehicles">Vehicles</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Condition</InputLabel>
            <Select
              value={condition}
              label="Condition"
              onChange={(e) => setCondition(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="good">Good</MenuItem>
              <MenuItem value="fair">Fair</MenuItem>
              <MenuItem value="poor">Poor</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Readiness</InputLabel>
            <Select
              value={readiness}
              label="Readiness"
              onChange={(e) => setReadiness(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="operational">Operational</MenuItem>
              <MenuItem value="maintenance">Needs Maintenance</MenuItem>
              <MenuItem value="repair">In Repair</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </div>
    </DashboardCard>
  );

  const renderPropertyTable = () => (
    <TableContainer component={Paper} sx={{ mb: 3 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Item Name</TableCell>
            <TableCell>Serial Number</TableCell>
            <TableCell>Condition</TableCell>
            <TableCell>Readiness</TableCell>
            <TableCell>Issued Date</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {mockItems.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>{item.name}</TableCell>
              <TableCell>{item.serialNumber}</TableCell>
              <TableCell>
                <Chip
                  label={item.condition}
                  color={getStatusColor(item.condition)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={item.readiness}
                  color={getStatusColor(item.readiness)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {format(new Date(item.issuedDate), 'MMM dd, yyyy')}
              </TableCell>
              <TableCell align="center">
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                  <Tooltip title="View Details">
                    <IconButton size="small">
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Request Maintenance">
                    <IconButton size="small">
                      <BuildIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Transfer">
                    <IconButton size="small">
                      <SwapHorizIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TablePagination
        component="div"
        count={mockItems.length}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
      />
    </TableContainer>
  );

  const renderFooter = () => (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 4, pt: 2, borderTop: 1, borderColor: 'divider' }}>
      <Typography variant="body2" color="text.secondary">
        HandReceipt v1.0
      </Typography>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Link href="#" underline="hover">Export to CSV</Link>
        <Link href="#" underline="hover">Help</Link>
        <Link href="#" underline="hover">Support</Link>
      </Box>
    </Box>
  );

  if (loading.summary || loading.equipmentList || loading.compliance) {
    return <PropertySkeleton />;
  }

  if (error.summary || error.equipmentList || error.compliance) {
    return (
      <ErrorDisplay
        title="Error Loading Property Data"
        message="There was a problem loading your property information. Please try again."
        onRetry={handleRetry}
      />
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        {renderHeader()}
        {renderSummaryCards()}
        {renderFilters()}
        {renderPropertyTable()}
        {renderFooter()}
      </Box>
    </Container>
  );
};

export default PropertyPage;
